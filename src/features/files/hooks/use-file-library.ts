"use client";
import { useAuthorization } from "@/hooks/use-authorization";
import { useJobCollection } from "@/features/jobs/hooks/use-job-collection";
import { useApiData } from "@/hooks/use-api-data";
import { api, backendEnabled } from "@/lib/api/backend-api";
import { download, downloadFromUrl, downloadBlob } from "@/lib/file-download";
import {
  fileWorkspace,
  loadOriginalFile,
  saveOriginalFiles,
  supportsFhe,
} from "@/lib/local-file-storage";
import type {
  FileFolder,
  FileLibraryFixtures,
  FileMoveTarget,
  StoredFile,
} from "@/types/file-storage";
import type { WorkspaceOption } from "@/types/workspace";
import { useRef, useState } from "react";

function unique<T extends { id: string }>(items: T[]) {
  return items.filter(
    (item, index) => items.findIndex((other) => other.id === item.id) === index,
  );
}

export function useFileLibrary(
  fixtures: FileLibraryFixtures,
  mockWorkspaces: WorkspaceOption[],
) {
  const jobs = useJobCollection({ files: true, mockJobs: fixtures.results });
  const { store } = jobs;
  const originalSource = useApiData(api.storedFiles, fixtures.originals);
  const folderSource = useApiData(api.fileFolders, fixtures.folders);
  const authorization = useAuthorization({ workspaces: mockWorkspaces });
  const workspaceSource = authorization.workspaceSource;
  const [folderId, setFolderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const downloadBusy = useRef(false);
  const originals = unique(
    backendEnabled
      ? originalSource.data || []
      : [...(store.model.storedFiles || []), ...(originalSource.data || [])],
  );
  const folders = unique(
    backendEnabled
      ? folderSource.data || []
      : [...(store.model.fileFolders || []), ...(folderSource.data || [])],
  );
  const currentFolder =
    folders.find((folder) => folder.id === folderId) || null;
  const activeFolderId = currentFolder?.id || null;
  const scopes = Array.from(
    new Set([
      ...(workspaceSource.data || [])
        .filter((workspace) => workspace.type !== "group")
        .map((workspace) => fileWorkspace(workspace.name)),
      ...originals.map((file) => fileWorkspace(file.scope)),
      ...jobs.jobs.map((job) => fileWorkspace(job.scope)),
      ...folders.map((folder) => folder.scope),
    ]),
  ).sort((a, b) =>
    a === "Personal" ? -1 : b === "Personal" ? 1 : a.localeCompare(b),
  );
  const visibleFolders = folders.filter(
    (folder) => jobs.scope === "All workspaces" || folder.scope === jobs.scope,
  );
  const visibleOriginals = originals.filter(
    (file) =>
      (file.folderId || null) === activeFolderId &&
      (jobs.scope === "All workspaces" ||
        fileWorkspace(file.scope) === jobs.scope) &&
      `${file.name} ${file.id}`
        .toLowerCase()
        .includes(jobs.search.trim().toLowerCase()),
  );
  const visibleResults = jobs.filtered.filter(
    (job) => (job.folderId || null) === activeFolderId,
  );
  const breadcrumb: FileFolder[] = [];
  let parent = currentFolder;
  const visited = new Set<string>();
  while (parent && !visited.has(parent.id)) {
    visited.add(parent.id);
    breadcrumb.unshift(parent);
    parent = folders.find((folder) => folder.id === parent?.parentId) || null;
  }
  const loading =
    !store.ready ||
    jobs.source.loading ||
    originalSource.loading ||
    folderSource.loading ||
    workspaceSource.loading;
  const error = [
    jobs.source.error,
    originalSource.error,
    folderSource.error,
    workspaceSource.error,
  ]
    .filter(Boolean)
    .join(" · ");
  const defaultScope =
    currentFolder?.scope ||
    (jobs.scope !== "All workspaces" ? jobs.scope : scopes[0] || "");

  const writableScopes = scopes.filter((scope) =>
    authorization.canManage(scope),
  );
  function validateDestination(scope: string, destination: string | null) {
    if (!authorization.canManage(scope))
      throw new Error("Only Owner or Admin can change files in this workspace");
    if (!scopes.includes(scope))
      throw new Error("เลือก Workspace ที่สามารถใช้งานได้");
    if (
      destination &&
      !folders.some(
        (folder) => folder.id === destination && folder.scope === scope,
      )
    )
      throw new Error("โฟลเดอร์ต้องอยู่ใน Workspace เดียวกับไฟล์");
  }
  async function createFolder(name: string, scope: string) {
    const clean = name.trim();
    if (
      !clean ||
      clean.length > 80 ||
      /[\\/\u0000-\u001f]/.test(clean) ||
      [".", ".."].includes(clean)
    )
      throw new Error("กรอกชื่อโฟลเดอร์ 1–80 ตัวอักษร โดยไม่ใช้ / หรือ \\");
    const parentId = currentFolder?.id || null;
    validateDestination(scope, parentId);
    if (
      folders.some(
        (folder) =>
          folder.scope === scope &&
          (folder.parentId || null) === parentId &&
          folder.name.toLocaleLowerCase() === clean.toLocaleLowerCase(),
      )
    )
      throw new Error("มีโฟลเดอร์ชื่อนี้ในตำแหน่งเดียวกันแล้ว");
    const next = backendEnabled
      ? await api.createFileFolder({ name: clean, scope, parentId })
      : { id: "folder_" + crypto.randomUUID(), name: clean, scope, parentId };
    if (backendEnabled) folderSource.setData((current) => [...current, next]);
    else
      store.update((current) => ({
        ...current,
        fileFolders: [...(current.fileFolders || []), next],
      }));
  }
  async function uploadOriginals(files: File[], scope: string) {
    if (!files.length || files.some((file) => file.size === 0))
      throw new Error("เลือกไฟล์ที่ไม่ว่างอย่างน้อย 1 ไฟล์");
    const destination = currentFolder?.id || null;
    validateDestination(scope, destination);
    let added: StoredFile[];
    if (backendEnabled) {
      const form = new FormData();
      files.forEach((file) => form.append("files", file));
      form.append("scope", scope);
      if (destination) form.append("folderId", destination);
      added = await api.storeFiles(form);
      originalSource.setData((current) => [...added, ...current]);
    } else {
      added = files.map((file) => ({
        id: "source_" + crypto.randomUUID(),
        name: file.name,
        sizeBytes: file.size,
        mimeType: file.type || "application/octet-stream",
        scope,
        date: new Date().toLocaleDateString("en-GB"),
        folderId: destination,
      }));
      await saveOriginalFiles(
        added.map((file, index) => ({ id: file.id, file: files[index] })),
      );
      store.update((current) => ({
        ...current,
        storedFiles: [...added, ...(current.storedFiles || [])],
      }));
    }
  }
  async function moveFile(target: FileMoveTarget, destination: string | null) {
    const scope = fileWorkspace(
      target.kind === "original" ? target.file.scope : target.job.scope,
    );
    validateDestination(scope, destination);
    if (target.kind === "original") {
      const next = backendEnabled
        ? await api.moveStoredFile(target.file.id, destination)
        : { ...target.file, folderId: destination };
      if (backendEnabled)
        originalSource.setData((current) =>
          current.map((file) => (file.id === next.id ? next : file)),
        );
      else
        store.update((current) => ({
          ...current,
          storedFiles: [
            next,
            ...(current.storedFiles || []).filter(
              (file) => file.id !== next.id,
            ),
          ],
        }));
    } else {
      const assignment = backendEnabled
        ? await api.moveResultFile(
            target.job.resultFileId || target.job.id,
            destination,
          )
        : { folderId: destination };
      const next = { ...target.job, folderId: assignment.folderId };
      if (backendEnabled)
        jobs.source.setData((current) =>
          current.map((job) => (job.id === next.id ? next : job)),
        );
      else
        store.update((current) => ({
          ...current,
          jobs: [next, ...current.jobs.filter((job) => job.id !== next.id)],
        }));
    }
  }
  async function downloadOriginal(file: StoredFile) {
    if (downloadBusy.current) return;
    setActionError("");
    downloadBusy.current = true;
    setDownloadingId(file.id);
    try {
      if (backendEnabled)
        downloadFromUrl(
          file.name,
          (await api.downloadStoredFile(file.id)).downloadUrl,
        );
      else if (file.demo)
        download(file.name + ".metadata.json", JSON.stringify(file, null, 2));
      else {
        const blob = await loadOriginalFile(file.id);
        if (!blob)
          throw new Error(
            "ไม่พบไฟล์ต้นฉบับในอุปกรณ์นี้ กรุณาอัปโหลดไฟล์อีกครั้ง",
          );
        downloadBlob(file.name, blob);
      }
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to download file",
      );
    } finally {
      downloadBusy.current = false;
      setDownloadingId(null);
    }
  }
  function processOriginal(file: StoredFile) {
    if (
      !authorization.canManage(fileWorkspace(file.scope)) ||
      !supportsFhe(file)
    )
      return;
    store.setSourceFiles([file]);
    store.setFiles([]);
    store.setScope(fileWorkspace(file.scope));
    jobs.router.push("/upload");
  }

  return {
    authorization,
    writableScopes,
    jobs,
    originals,
    folders,
    visibleFolders,
    visibleOriginals,
    visibleResults,
    currentFolder,
    breadcrumb,
    scopes,
    defaultScope,
    loading,
    error,
    actionError,
    downloadingId,
    createFolder,
    uploadOriginals,
    moveFile,
    downloadOriginal,
    processOriginal,
    openFolder: setFolderId,
    setScope: (scope: string) => {
      jobs.setScope(scope);
      setFolderId(null);
    },
    refresh: () =>
      Promise.all([
        jobs.source.refresh(),
        originalSource.refresh(),
        folderSource.refresh(),
        workspaceSource.refresh(),
      ]),
  };
}

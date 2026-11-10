"use client";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Notice } from "@/components/ui/notice";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { DetailRows } from "@/components/ui/detail-rows";
import { FolderTree } from "@/features/files/components/folder-tree";
import { StoredFileCard } from "@/features/files/components/stored-file-card";
import { useFileLibrary } from "@/features/files/hooks/use-file-library";
import { JobDialogs } from "@/features/jobs/components/job-dialogs";
import { JobList } from "@/features/jobs/components/job-list";
import { fileWorkspace, formatFileSize } from "@/lib/local-file-storage";
import type {
  FileLibraryFixtures,
  FileMoveTarget,
  StoredFile,
} from "@/types/file-storage";
import type { WorkspaceOption } from "@/types/workspace";
import Link from "next/link";
import { useRef, useState } from "react";

export default function MyFilesPage() {
  const library = useFileLibrary(mockLibrary, mockWorkspaces);
  const { jobs } = library;
  const [dialog, setDialog] = useState<"folder" | "upload" | null>(null);
  const [folderName, setFolderName] = useState("");
  const [dialogScope, setDialogScope] = useState("");
  const [incoming, setIncoming] = useState<File[]>([]);
  const [moveTarget, setMoveTarget] = useState<FileMoveTarget | null>(null);
  const [destination, setDestination] = useState("");
  const [view, setView] = useState<StoredFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const moveScope = moveTarget
    ? fileWorkspace(
        moveTarget.kind === "original"
          ? moveTarget.file.scope
          : moveTarget.job.scope,
      )
    : "";
  const moveName =
    moveTarget?.kind === "original"
      ? moveTarget.file.name
      : moveTarget?.job.result;
  const canEditLocation = library.currentFolder
    ? library.authorization.canManage(library.currentFolder.scope)
    : jobs.scope === "All workspaces"
      ? library.writableScopes.length > 0
      : library.authorization.canManage(jobs.scope);
  function openDialog(next: "folder" | "upload") {
    if (!canEditLocation) return;
    setDialog(next);
    setFolderName("");
    setDialogScope(
      library.authorization.canManage(library.defaultScope)
        ? library.defaultScope
        : library.writableScopes[0] || "",
    );
    setIncoming([]);
    setDialogError("");
  }
  function openMove(target: FileMoveTarget) {
    if (
      !library.authorization.canManage(
        fileWorkspace(
          target.kind === "original" ? target.file.scope : target.job.scope,
        ),
      )
    )
      return;
    setMoveTarget(target);
    setDestination(
      target.kind === "original"
        ? target.file.folderId || ""
        : target.job.folderId || "",
    );
    setDialogError("");
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setDialogError("");
    try {
      if (dialog === "folder")
        await library.createFolder(folderName, dialogScope);
      if (dialog === "upload")
        await library.uploadOriginals(incoming, dialogScope);
      setDialog(null);
    } catch (error) {
      setDialogError(error instanceof Error ? error.message : "Unable to save");
    } finally {
      setBusy(false);
    }
  }
  async function submitMove(event: React.FormEvent) {
    event.preventDefault();
    if (!moveTarget || busy) return;
    setBusy(true);
    setDialogError("");
    try {
      await library.moveFile(moveTarget, destination || null);
      setMoveTarget(null);
    } catch (error) {
      setDialogError(
        error instanceof Error ? error.message : "Unable to move file",
      );
    } finally {
      setBusy(false);
    }
  }
  function folderLabel(id: string): string {
    const parts: string[] = [],
      visited = new Set<string>();
    let folder = library.folders.find((item) => item.id === id);
    while (folder && !visited.has(folder.id)) {
      visited.add(folder.id);
      parts.unshift(folder.name);
      folder = library.folders.find((item) => item.id === folder?.parentId);
    }
    return parts.join(" / ");
  }
  return (
    <PageShell
      title="My File"
      description="จัดเก็บไฟล์ต้นฉบับและผลลัพธ์จาก FHE ในพื้นที่เดียวกัน"
      wide
      action={
        canEditLocation && (
          <div className="cepp-row wrap cepp-library-header-actions">
            <Button
              secondary
              disabled={
                library.loading || !!library.error || !library.scopes.length
              }
              onClick={() => openDialog("folder")}
            >
              New folder
            </Button>
            <Button
              disabled={
                library.loading || !!library.error || !library.scopes.length
              }
              onClick={() => openDialog("upload")}
            >
              Upload files
            </Button>
          </div>
        )
      }
    >
      <div className="cepp-library-filters">
        <TextField
          label="Search files"
          placeholder="Search files in this folder"
          value={jobs.search}
          onChange={(event) => jobs.setSearch(event.target.value)}
        />
        <Select
          label="Workspace"
          value={jobs.scope}
          onChange={library.setScope}
          options={["All workspaces", ...library.scopes]}
        />
      </div>
      {library.error && (
        <div role="alert">
          <Notice
            title="Unable to load files"
            warning
            action={
              <Button secondary onClick={() => void library.refresh()}>
                Retry
              </Button>
            }
          >
            {library.error}
          </Notice>
        </div>
      )}
      {(library.actionError || jobs.fileDownload.error) && (
        <div role="alert">
          <Notice title="Unable to download file" warning>
            {library.actionError || jobs.fileDownload.error}
          </Notice>
        </div>
      )}
      {library.loading && (
        <p className="cepp-muted" role="status">
          Loading files…
        </p>
      )}
      {!library.loading && !library.error && (
        <div className="cepp-library-layout">
          <aside className="cepp-library-sidebar">
            <h2>Folders</h2>
            <FolderTree
              folders={library.visibleFolders}
              selectedId={library.currentFolder?.id || null}
              onSelect={library.openFolder}
              showWorkspace={jobs.scope === "All workspaces"}
            />
          </aside>
          <div className="cepp-library-main">
            <nav className="cepp-library-breadcrumb" aria-label="Folder path">
              <button
                type="button"
                aria-current={!library.currentFolder ? "page" : undefined}
                onClick={() => library.openFolder(null)}
              >
                All files
              </button>
              {library.breadcrumb.map((folder) => (
                <span key={folder.id}>
                  <span aria-hidden="true">/</span>
                  <button
                    type="button"
                    aria-current={
                      library.currentFolder?.id === folder.id
                        ? "page"
                        : undefined
                    }
                    onClick={() => library.openFolder(folder.id)}
                  >
                    {folder.name}
                  </button>
                </span>
              ))}
            </nav>
            <section
              className="cepp-library-section"
              aria-label="Original files"
            >
              <header className="cepp-library-section-heading">
                <div>
                  <h2>
                    Original files{" "}
                    <span>{library.visibleOriginals.length}</span>
                  </h2>
                  <p>ไฟล์ต้นฉบับที่ยังไม่ผ่าน FHE</p>
                </div>
              </header>
              {library.visibleOriginals.map((file) => (
                <StoredFileCard
                  key={file.id}
                  file={file}
                  downloading={library.downloadingId === file.id}
                  downloadDisabled={library.downloadingId !== null}
                  onView={() => setView(file)}
                  onDownload={() => void library.downloadOriginal(file)}
                  onProcess={() => library.processOriginal(file)}
                  canManage={library.authorization.canManage(
                    fileWorkspace(file.scope),
                  )}
                  onMove={() => openMove({ kind: "original", file })}
                />
              ))}
              {!library.visibleOriginals.length && (
                <div className="cepp-library-empty">
                  <p>
                    {jobs.search
                      ? "ไม่พบไฟล์ต้นฉบับที่ตรงกับการค้นหา"
                      : "ยังไม่มีไฟล์ต้นฉบับในตำแหน่งนี้"}
                  </p>
                  {canEditLocation && (
                    <Button
                      small
                      secondary
                      onClick={() => openDialog("upload")}
                    >
                      Upload files
                    </Button>
                  )}
                </div>
              )}
            </section>
            <section className="cepp-library-section" aria-label="FHE results">
              <header className="cepp-library-section-heading">
                <div>
                  <h2>
                    FHE results <span>{library.visibleResults.length}</span>
                  </h2>
                  <p>ไฟล์ผลลัพธ์ที่ประมวลผลด้วย FHE เสร็จแล้ว</p>
                </div>
                <Link href="/history">History</Link>
              </header>
              <JobList
                state={{ ...jobs, filtered: library.visibleResults }}
                canMove={(job) =>
                  library.authorization.canManage(fileWorkspace(job.scope))
                }
                onMove={(job) => openMove({ kind: "result", job })}
              />
              {!library.visibleResults.length && (
                <div className="cepp-library-empty">
                  <p>
                    {jobs.search
                      ? "ไม่พบผลลัพธ์ที่ตรงกับการค้นหา"
                      : "ผลลัพธ์จะปรากฏที่นี่เมื่อประมวลผล FHE เสร็จสิ้น"}
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      <Modal
        open={dialog !== null && library.authorization.canManage(dialogScope)}
        onClose={() => {
          if (!busy) setDialog(null);
        }}
        title={dialog === "folder" ? "New folder" : "Upload original files"}
        description={
          dialog === "folder"
            ? "สร้างโฟลเดอร์เพื่อจัดระเบียบไฟล์ใน Workspace"
            : "จัดเก็บไฟล์ต้นฉบับก่อนเลือกส่งไปประมวลผล FHE"
        }
      >
        <form className="cepp-stack" onSubmit={submit}>
          <Select
            label="Workspace"
            value={dialogScope}
            onChange={setDialogScope}
            options={
              library.currentFolder
                ? [library.currentFolder.scope]
                : library.writableScopes
            }
          />
          <p className="cepp-muted">
            Location:{" "}
            {library.currentFolder
              ? folderLabel(library.currentFolder.id)
              : "All files"}
          </p>
          {dialog === "folder" ? (
            <TextField
              autoFocus
              required
              maxLength={80}
              label="Folder name"
              placeholder="e.g. Field captures"
              value={folderName}
              onChange={(event) => {
                setFolderName(event.target.value);
                setDialogError("");
              }}
            />
          ) : (
            <>
              <input
                ref={input}
                hidden
                type="file"
                multiple
                aria-label="Original files to upload"
                onChange={(event) => {
                  setIncoming(Array.from(event.target.files || []));
                  setDialogError("");
                  event.currentTarget.value = "";
                }}
              />
              <Button
                secondary
                disabled={busy}
                onClick={() => input.current?.click()}
              >
                Choose files
              </Button>
              {incoming.length > 0 && (
                <ul className="cepp-library-upload-list">
                  {incoming.map((file, index) => (
                    <li key={index}>
                      {file.name}
                      <small>{formatFileSize(file.size)}</small>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {dialogError && (
            <p role="alert" className="cepp-alert">
              {dialogError}
            </p>
          )}
          <div className="cepp-row start wrap cepp-library-dialog-actions">
            <Button secondary disabled={busy} onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                busy ||
                !dialogScope ||
                (dialog === "folder" ? !folderName.trim() : !incoming.length)
              }
            >
              {busy
                ? "Saving…"
                : dialog === "folder"
                  ? "Create folder"
                  : "Upload"}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={moveTarget !== null && library.authorization.canManage(moveScope)}
        onClose={() => {
          if (!busy) setMoveTarget(null);
        }}
        title="Move file"
        description={moveName || "Choose a destination folder"}
      >
        <form className="cepp-stack" onSubmit={submitMove}>
          <p className="cepp-muted">Workspace: {moveScope}</p>
          <Select
            label="Destination folder"
            value={destination}
            onChange={setDestination}
            options={[
              { value: "", label: "All files (root)" },
              ...library.folders
                .filter((folder) => folder.scope === moveScope)
                .map((folder) => ({
                  value: folder.id,
                  label: folderLabel(folder.id),
                })),
            ]}
          />
          {dialogError && (
            <p role="alert" className="cepp-alert">
              {dialogError}
            </p>
          )}
          <div className="cepp-row start wrap cepp-library-dialog-actions">
            <Button
              secondary
              disabled={busy}
              onClick={() => setMoveTarget(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Moving…" : "Move file"}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={view !== null}
        onClose={() => setView(null)}
        title={view?.name || "Original file"}
        description="Original file details"
      >
        <DetailRows
          rows={[
            ["Size", view ? formatFileSize(view.sizeBytes) : "—"],
            ["Workspace", view?.scope],
            ["Saved", view?.date],
            [
              "Folder",
              view?.folderId ? folderLabel(view.folderId) : "All files",
            ],
            ["FHE", "Not processed"],
          ]}
        />
        <p className="cepp-muted">
          การประมวลผลจะสร้างไฟล์ผลลัพธ์ใหม่ โดยเก็บไฟล์ต้นฉบับนี้ไว้
        </p>
      </Modal>
      <JobDialogs state={jobs} />
    </PageShell>
  );
}

const mockLibrary: FileLibraryFixtures = {
  originals: [
    {
      id: "source-001",
      name: "photo-samples.jpg",
      sizeBytes: 2457600,
      mimeType: "image/jpeg",
      scope: "Personal",
      date: "28 Feb 2026",
      folderId: null,
      demo: true,
    },
    {
      id: "source-002",
      name: "street-camera.mp4",
      sizeBytes: 50541363,
      mimeType: "video/mp4",
      scope: "Enterprise A",
      date: "25 Feb 2026",
      folderId: null,
      demo: true,
    },
    {
      id: "source-003",
      name: "drone-flight.mp4",
      sizeBytes: 164416717,
      mimeType: "video/mp4",
      scope: "Personal",
      date: "2 Mar 2026",
      folderId: "folder-captures",
      demo: true,
    },
  ],
  folders: [
    {
      id: "folder-captures",
      name: "Personal",
      scope: "",
      parentId: null,
    },
    {
      id: "folder-survey",
      name: "Enterprise A",
      scope: "",
      parentId: null,
    },
  ],
  results: [
    {
      id: "ORD-2026-001",
      resultFileId: "result-001",
      sourceFileIds: ["source-002"],
      decrypted: true,
      name: "Face Detection - Batch 1",
      files: [],
      count: 24,
      size: "12.4 MB",
      scope: "Enterprise A / Group 1",
      keyId: "loc_7A2F",
      version: 1,
      status: "Completed",
      date: "28 Feb 2026",
      result: "batch_result_001.enc",
      demo: true,
    },
    {
      id: "ORD-2026-002",
      resultFileId: "result-002",
      sourceFileIds: ["source-002"],
      name: "Face Detection - Surveillance Set",
      files: [],
      count: 3,
      size: "48.2 MB",
      scope: "Enterprise A / Group 3",
      keyId: "kms_8C91",
      version: 1,
      status: "Completed",
      date: "25 Feb 2026",
      result: "surveillance_analysis.enc",
      demo: true,
    },
  ],
};
const mockWorkspaces: WorkspaceOption[] = [
  { id: "personal", name: "Personal", type: "personal" },
  {
    id: "enterprise-a",
    name: "Enterprise A",
    type: "enterprise",
    role: "Owner",
  },
  {
    id: "enterprise-b",
    name: "Enterprise B",
    type: "enterprise",
    role: "Member",
  },
];

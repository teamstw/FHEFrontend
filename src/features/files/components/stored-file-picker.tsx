"use client";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Notice } from "@/components/ui/notice";
import { Select } from "@/components/ui/select";
import { TextField } from "@/components/ui/text-field";
import { useApiData } from "@/hooks/use-api-data";
import { useAppState } from "@/hooks/use-app-state";
import { api, backendEnabled } from "@/lib/api/backend-api";
import {
  fileWorkspace,
  formatFileSize,
  supportsFhe,
} from "@/lib/local-file-storage";
import type { FileFolder, StoredFile } from "@/types/file-storage";
import { useState } from "react";

export function StoredFilePicker({
  scope,
  selectedIds,
  mockFiles,
  mockFolders,
  onClose,
  onConfirm,
}: {
  scope: string;
  selectedIds: string[];
  mockFiles: StoredFile[];
  mockFolders: FileFolder[];
  onClose: () => void;
  onConfirm: (files: StoredFile[]) => void;
}) {
  const { model } = useAppState();
  const filesSource = useApiData(api.storedFiles, mockFiles);
  const foldersSource = useApiData(api.fileFolders, mockFolders);
  const [search, setSearch] = useState("");
  const [folderId, setFolderId] = useState("*");
  const [checked, setChecked] = useState<string[]>([]);
  const files = (
    backendEnabled
      ? filesSource.data || []
      : [...(model.storedFiles || []), ...(filesSource.data || [])]
  )
    .filter(
      (file, index, all) =>
        all.findIndex((other) => other.id === file.id) === index,
    )
    .filter((file) => fileWorkspace(file.scope) === scope && supportsFhe(file));
  const folders = (
    backendEnabled
      ? foldersSource.data || []
      : [...(model.fileFolders || []), ...(foldersSource.data || [])]
  )
    .filter(
      (folder, index, all) =>
        all.findIndex((other) => other.id === folder.id) === index,
    )
    .filter((folder) => folder.scope === scope);
  const loading = filesSource.loading || foldersSource.loading;
  const error = [filesSource.error, foldersSource.error]
    .filter(Boolean)
    .join(" · ");
  const visible = files.filter(
    (file) =>
      (folderId === "*" || (file.folderId || "") === folderId) &&
      file.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const selection = files.filter(
    (file) => checked.includes(file.id) && !selectedIds.includes(file.id),
  );
  function folderName(id: string | null): string {
    if (!id) return "All files";
    const parts: string[] = [],
      visited = new Set<string>();
    let folder = folders.find((item) => item.id === id);
    while (folder && !visited.has(folder.id)) {
      visited.add(folder.id);
      parts.unshift(folder.name);
      folder = folders.find((item) => item.id === folder?.parentId);
    }
    return parts.join(" / ") || "Folder";
  }
  function toggle(id: string) {
    setChecked((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Select from My File"
      description="เลือกไฟล์ต้นฉบับที่ยังไม่ผ่าน FHE · รองรับ JPG, PNG และ MP4"
      wide
    >
      <p className="cepp-muted">
        Workspace: <strong>{scope}</strong>
      </p>
      <div className="cepp-grid">
        <TextField
          label="Search My File"
          placeholder="Search original files"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Select
          label="Folder"
          value={folderId}
          onChange={setFolderId}
          options={[
            { value: "*", label: "All folders" },
            { value: "", label: "All files (root)" },
            ...folders.map((folder) => ({
              value: folder.id,
              label: folderName(folder.id),
            })),
          ]}
        />
      </div>
      {loading && (
        <p className="cepp-muted" role="status">
          Loading original files…
        </p>
      )}
      {error && (
        <div role="alert">
          <Notice
            title="Unable to load My File"
            warning
            action={
              <Button
                secondary
                onClick={() =>
                  void Promise.all([
                    filesSource.refresh(),
                    foldersSource.refresh(),
                  ])
                }
              >
                Retry
              </Button>
            }
          >
            {error}
          </Notice>
        </div>
      )}
      {!loading && !error && (
        <>
          {visible.length ? (
            <div
              className="cepp-source-picker-list"
              role="group"
              aria-label="Original files available for FHE"
            >
              {visible.map((file) => {
                const added = selectedIds.includes(file.id);
                const selected = added || checked.includes(file.id);
                return (
                  <label
                    key={file.id}
                    className={
                      "cepp-source-picker-row" +
                      (selected ? " selected" : "") +
                      (added ? " added" : "")
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={added}
                      onChange={() => toggle(file.id)}
                    />
                    <span className="cepp-source-picker-info">
                      <strong>{file.name}</strong>
                      <span className="cepp-source-picker-meta">
                        <span>{formatFileSize(file.sizeBytes)}</span>
                        <span>{folderName(file.folderId)}</span>
                        <span>{file.date}</span>
                      </span>
                      {added && <small>Added to batch</small>}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <Notice
              title={
                files.length
                  ? "No matching files"
                  : "No original files available"
              }
            >
              {files.length
                ? "ลองค้นหาชื่ออื่นหรือเลือกโฟลเดอร์อื่น"
                : "ยังไม่มีไฟล์ต้นฉบับ JPG, PNG หรือ MP4 ใน Workspace นี้ อัปโหลดไฟล์ใน My File หรือเลือกไฟล์จากอุปกรณ์ได้"}
            </Notice>
          )}
        </>
      )}
      <div className="cepp-source-picker-footer">
        <span className="cepp-muted" aria-live="polite">
          {selection.length} files selected
        </span>
        <div className="cepp-row wrap">
          <Button secondary onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={loading || !!error || !selection.length}
            onClick={() => onConfirm(selection)}
          >
            Add selected files
          </Button>
        </div>
      </div>
    </Modal>
  );
}

"use client";
import type { FileFolder } from "@/types/file-storage";

export function FolderIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FolderTree({
  folders,
  selectedId,
  onSelect,
  showWorkspace,
}: {
  folders: FileFolder[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showWorkspace: boolean;
}) {
  function branch(parentId: string | null, visited = new Set<string>()) {
    const children = folders.filter(
      (folder) =>
        (folder.parentId || null) === parentId && !visited.has(folder.id),
    );
    if (!children.length) return null;
    return (
      <ul>
        {children.map((folder) => (
          <li key={folder.id}>
            <button
              type="button"
              className={selectedId === folder.id ? "selected" : ""}
              aria-current={selectedId === folder.id ? "page" : undefined}
              onClick={() => onSelect(folder.id)}
            >
              <FolderIcon />
              <span>
                {folder.name}
                {showWorkspace && <small>{folder.scope}</small>}
              </span>
            </button>
            {branch(folder.id, new Set([...visited, folder.id]))}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <nav className="cepp-folder-tree" aria-label="File folders">
      <button
        type="button"
        className={selectedId === null ? "selected" : ""}
        aria-current={selectedId === null ? "page" : undefined}
        onClick={() => onSelect(null)}
      >
        <FolderIcon />
        <span>All files</span>
      </button>
      {branch(null)}
      {!folders.length && (
        <p className="cepp-muted">ยังไม่มีโฟลเดอร์ใน Workspace นี้</p>
      )}
    </nav>
  );
}

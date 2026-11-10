import type { Job } from "./job";

export type StoredFile = {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  scope: string;
  date: string;
  folderId: string | null;
  demo?: boolean;
};

export type FileFolder = {
  id: string;
  name: string;
  scope: string;
  parentId: string | null;
};

export type FileLibraryFixtures = {
  originals: StoredFile[];
  folders: FileFolder[];
  results: Job[];
};

export type FileMoveTarget =
  | { kind: "original"; file: StoredFile }
  | { kind: "result"; job: Job };

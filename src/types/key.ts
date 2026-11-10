export type KeyMethod = "Local Storage" | "Cloud KMS" | "BYOK";
export type KeyVersion = {
  version: number;
  status: "Active" | "Retained" | "Revoked";
  createdAt?: string;
  actor?: string;
  note?: string;
};
export type KeyRecord = {
  createdAt?: string;
  lastRotatedAt?: string;
  custody?: string;
  registeredBy?: string;
  versions?: KeyVersion[];
  jobBindings?: { jobId: string; label: string; version: number }[];
  groupIds?: string[];
  groupNames?: string[];
  id: string;
  name: string;
  method: KeyMethod;
  version: number;
  scope: string;
  fingerprint?: string;
  revoked?: boolean;
};

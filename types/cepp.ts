export type KeyMethod = "Local Storage" | "Cloud KMS" | "BYOK";
export type KeyRecord = {
  id: string;
  name: string;
  method: KeyMethod;
  version: number;
  scope: string;
  fingerprint?: string;
  revoked?: boolean;
};
export type Job = {
  id: string;
  name: string;
  files: string[];
  count: number;
  size: string;
  scope: string;
  keyId: string;
  version: number;
  status: "Completed" | "Processing";
  date: string;
  result: string;
  demo: boolean;
};
export type Member = {
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
};
export type Group = {
  id: string;
  name: string;
  role: Member["role"];
  members: Member[];
  files: number;
};
export type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  name: string;
  default: boolean;
};
export type Model = {
  billingSettings: Record<
    string,
    { budget: string; threshold: string; plan?: string; pause?: boolean }
  >;
  name: string;
  signedIn: boolean;
  privacy: boolean;
  personalLabel: string;
  groups: Group[];
  groupsLoaded: boolean;
  cardsLoaded: boolean;
  activeJobId: string;
  enterprise: string;
  keys: KeyRecord[];
  jobs: Job[];
  cards: SavedCard[];
  unread: number;
  invites: string[];
  budget: string;
  threshold: string;
  plan: string;
  audit: string[];
};
export type Store = {
  model: Model;
  update: (fn: (m: Model) => Model) => void;
  files: File[];
  setFiles: (f: File[]) => void;
  scope: string;
  setScope: (s: string) => void;
  activeJob: Job | null;
  setActiveJob: (j: Job) => void;
  ready: boolean;
};

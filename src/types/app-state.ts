import type { BillingSplit } from "./billing";
import type { StoredFile, FileFolder } from "./file-storage";
import type { Group, GroupSelection } from "./workspace";
import type { Job } from "./job";
import type { KeyRecord } from "./key";
import type { SavedCard } from "./billing";
export type AppState = {
  /** Optional local fixtures only. Never used as authority when the API is enabled. */
  workspaceMemberships?: import("./workspace").WorkspaceOption[];
  storedFiles: StoredFile[];
  fileFolders: FileFolder[];
  avatarUrl: string;
  billingSettings: Record<
    string,
    {
      budget: string;
      threshold: string;
      plan?: string;
      pause?: boolean;
      split?: BillingSplit;
    }
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
export type AppStore = {
  sourceFiles: StoredFile[];
  setSourceFiles: (files: StoredFile[]) => void;
  model: AppState;
  update: (fn: (m: AppState) => AppState) => void;
  files: File[];
  setFiles: (f: File[]) => void;
  scope: string;
  setScope: (s: string) => void;
  selectedGroups: GroupSelection[];
  setSelectedGroups: (groups: GroupSelection[]) => void;
  activeJob: Job | null;
  setActiveJob: (j: Job) => void;
  markJobDecrypted: (job: Job) => void;
  ready: boolean;
};

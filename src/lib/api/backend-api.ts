import type { StoredFile, FileFolder } from "@/types/file-storage";
import type { BillingSummary } from "@/types/billing";
import type { NotificationRecord } from "@/types/notification";
import type { Group } from "@/types/workspace";
import type { Job } from "@/types/job";
import type { KeyRecord } from "@/types/key";
import type { SavedCard } from "@/types/billing";
import type { WorkspaceOption } from "@/types/workspace";
import { base, request } from "./http-client";
export { ApiError, backendEnabled } from "./http-client";
export const api = {
  session: () => request<{ name: string; email: string }>("/auth/session"),
  signInUrl: () => base + "/auth/google",
  signOut: () => request<void>("/auth/logout", { method: "POST" }),
  profile: () =>
    request<{
      name: string;
      email: string;
      privacy: boolean;
      avatarUrl?: string;
    }>("/profile"),
  updateAvatar: (avatar: File) => {
    const form = new FormData();
    form.append("avatar", avatar);
    return request<{ avatarUrl: string }>("/profile/avatar", {
      method: "POST",
      body: form,
    });
  },
  updateProfile: (data: unknown) =>
    request("/profile", { method: "PATCH", body: JSON.stringify(data) }),
  jobs: () => request<Job[]>("/jobs"),
  job: (id: string) => request<Job>("/jobs/" + encodeURIComponent(id)),
  createJob: (data: FormData) =>
    request<Job>("/jobs", { method: "POST", body: data }),
  files: () => request<Job[]>("/files"),
  storedFiles: () => request<StoredFile[]>("/storage/files"),
  storeFiles: (body: FormData) =>
    request<StoredFile[]>("/storage/files", { method: "POST", body }),
  downloadStoredFile: (id: string) =>
    request<{ downloadUrl: string }>(
      "/storage/files/" + encodeURIComponent(id) + "/download",
    ),
  fileFolders: () => request<FileFolder[]>("/file-folders"),
  createFileFolder: (data: {
    name: string;
    scope: string;
    parentId: string | null;
  }) =>
    request<FileFolder>("/file-folders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  moveStoredFile: (id: string, folderId: string | null) =>
    request<StoredFile>("/storage/files/" + encodeURIComponent(id), {
      method: "PATCH",
      body: JSON.stringify({ folderId }),
    }),
  moveResultFile: (id: string, folderId: string | null) =>
    request<{ folderId: string | null }>("/files/" + encodeURIComponent(id), {
      method: "PATCH",
      body: JSON.stringify({ folderId }),
    }),
  downloadFile: (id: string) =>
    request<{ downloadUrl: string }>(
      "/files/" + encodeURIComponent(id) + "/download",
    ),
  decrypt: (id: string, data: FormData) =>
    request<{ downloadUrl: string }>(
      "/jobs/" + encodeURIComponent(id) + "/decrypt",
      { method: "POST", body: data },
    ),
  workspaces: () => request<WorkspaceOption[]>("/workspaces"),
  groups: () => request<Group[]>("/groups"),
  workspaceGroups: (scope: string) =>
    request<Group[]>("/groups?scope=" + encodeURIComponent(scope)),
  createGroup: (name: string, enterpriseName: string | null = null) =>
    request<Group>("/groups", {
      method: "POST",
      body: JSON.stringify({ name, enterpriseName }),
    }),
  updateGroup: (id: string, data: unknown) =>
    request<Group>("/groups/" + encodeURIComponent(id), {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  keys: (scope: string) =>
    request<KeyRecord[]>("/keys?scope=" + encodeURIComponent(scope)),
  createKey: (data: FormData) =>
    request<KeyRecord>("/keys", { method: "POST", body: data }),
  keyAction: (id: string, action: string, version?: number) =>
    request<KeyRecord>("/keys/" + encodeURIComponent(id) + "/" + action, {
      method: "POST",
      ...(version !== undefined ? { body: JSON.stringify({ version }) } : {}),
    }),
  cards: () => request<SavedCard[]>("/billing/payment-methods"),
  billing: (scope: string) =>
    request<BillingSummary>("/billing?scope=" + encodeURIComponent(scope)),
  updateBilling: (data: unknown) =>
    request("/billing", { method: "PATCH", body: JSON.stringify(data) }),
  notifications: () => request<NotificationRecord[]>("/notifications"),
  markRead: () => request("/notifications/read", { method: "POST" }),
};

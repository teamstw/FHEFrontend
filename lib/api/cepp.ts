import type { BillingSummary, NotificationRecord } from "@/types/api";
import type { Group, Job, KeyRecord, SavedCard } from "@/types/cepp";
import { base, request } from "./client";
export { ApiError, backendEnabled } from "./client";
export const api = {
  session: () => request<{ name: string; email: string }>("/auth/session"),
  signInUrl: () => base + "/auth/google",
  signOut: () => request<void>("/auth/logout", { method: "POST" }),
  profile: () =>
    request<{ name: string; email: string; privacy: boolean }>("/profile"),
  updateProfile: (data: unknown) =>
    request("/profile", { method: "PATCH", body: JSON.stringify(data) }),
  jobs: () => request<Job[]>("/jobs"),
  job: (id: string) => request<Job>("/jobs/" + encodeURIComponent(id)),
  createJob: (data: FormData) =>
    request<Job>("/jobs", { method: "POST", body: data }),
  files: () => request<Job[]>("/files"),
  decrypt: (id: string, data: FormData) =>
    request<{ downloadUrl: string }>(
      "/jobs/" + encodeURIComponent(id) + "/decrypt",
      { method: "POST", body: data },
    ),
  workspaces: () =>
    request<{ id: string; name: string; type: string }[]>("/workspaces"),
  groups: () => request<Group[]>("/groups"),
  createGroup: (name: string) =>
    request<Group>("/groups", {
      method: "POST",
      body: JSON.stringify({ name }),
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
  keyAction: (id: string, action: string) =>
    request<KeyRecord>("/keys/" + encodeURIComponent(id) + "/" + action, {
      method: "POST",
    }),
  cards: () => request<SavedCard[]>("/billing/payment-methods"),
  billing: (scope: string) =>
    request<BillingSummary>("/billing?scope=" + encodeURIComponent(scope)),
  updateBilling: (data: unknown) =>
    request("/billing", { method: "PATCH", body: JSON.stringify(data) }),
  notifications: () => request<NotificationRecord[]>("/notifications"),
  markRead: () => request("/notifications/read", { method: "POST" }),
};

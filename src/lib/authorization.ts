import type { Group, Member, WorkspaceOption } from "@/types/workspace";

export function canManageRole(role: unknown): role is "Owner" | "Admin" {
  return role === "Owner" || role === "Admin";
}

// Roles belong to the exact resource. Group privileges never grant enterprise access.
export function scopeRole(
  scope: string,
  groups: Group[],
  workspaces: WorkspaceOption[],
): Member["role"] | null {
  if (scope === "Personal") return "Owner";
  const matches = groups.filter(
    (group) =>
      scope ===
      (group.enterpriseName
        ? group.enterpriseName + " / " + group.name
        : "Independent / " + group.name),
  );
  if (matches.length === 1) return matches[0].role;
  if (matches.length > 1) return null;
  const enterprise = workspaces.filter(
    (item) => item.type === "enterprise" && item.name === scope,
  );
  return enterprise.length === 1 ? enterprise[0].role || null : null;
}

export function canChangeMember(actor: unknown, target: unknown): boolean {
  return (
    target !== "Owner" &&
    (actor === "Owner" || (actor === "Admin" && target === "Member"))
  );
}

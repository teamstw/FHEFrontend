"use client";
import { useApiData } from "@/hooks/use-api-data";
import { useAppState } from "@/hooks/use-app-state";
import { api, backendEnabled } from "@/lib/api/backend-api";
import { canManageRole, scopeRole } from "@/lib/authorization";
import type { Group, WorkspaceOption } from "@/types/workspace";
import { useSession } from "next-auth/react";

export function useAuthorization(
  fixtures: { groups?: Group[]; workspaces?: WorkspaceOption[] } = {},
) {
  const { model, ready } = useAppState();
  const { status } = useSession();
  const groupSource = useApiData(api.groups, fixtures.groups || []);
  const workspaceSource = useApiData(api.workspaces, fixtures.workspaces || []);
  const groups = backendEnabled
    ? groupSource.data || []
    : model.groupsLoaded
      ? model.groups
      : groupSource.data || [];
  const workspaces = backendEnabled
    ? workspaceSource.data || []
    : (model.workspaceMemberships ?? workspaceSource.data ?? []);
  function role(scope: string) {
    if (!ready || status !== "authenticated") return null;
    return scopeRole(scope, groups, workspaces);
  }
  return {
    groups,
    workspaces,
    groupSource,
    workspaceSource,
    role,
    canManage: (scope: string) => canManageRole(role(scope)),
    canCreateGroup: (enterprise: string | null) =>
      !enterprise
        ? ready && status === "authenticated"
        : canManageRole(role(enterprise)),
  };
}

"use client";
import { useAuthorization } from "@/hooks/use-authorization";
import { canManageRole } from "@/lib/authorization";
import { notifySaved } from "@/lib/save-feedback";
import { useAppState } from "@/hooks/use-app-state";
import { api, backendEnabled } from "@/lib/api/backend-api";
import { getGroupEnterprise } from "@/lib/group-membership";
import type { Group } from "@/types/workspace";
import type { Member } from "@/types/workspace";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
export type WorkspaceFixtures = {
  workspaces?: import("@/types/workspace").WorkspaceOption[];
  groups: Group[];
  members: Member[];
  invites: string[];
};
export type WorkspaceView =
  | "workspace"
  | "personal"
  | "enterprise"
  | "groups"
  | "group";
export function useWorkspaceManagement({
  view,
  groupId = "1",
  fixtures,
}: {
  view: WorkspaceView;
  groupId?: string;
  fixtures: WorkspaceFixtures;
}) {
  const { data: session } = useSession();
  const currentUser = {
    name: session?.user?.name || "Test User",
    email: session?.user?.email || "user1@example.com",
  };
  const mockGroups = fixtures.groups,
    mockMembers = fixtures.members,
    mockInvites = fixtures.invites;
  const { model, update } = useAppState(),
    router = useRouter(),
    params = useSearchParams(),
    authorization = useAuthorization(fixtures),
    source = authorization.groupSource;
  const [groups, setGroups] = useState<Group[] | null>(null),
    [tab, setTab] = useState("All"),
    [modal, setModal] = useState(""),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [pending, setPending] = useState<Group | null>(null),
    [invites, setInvites] = useState(mockInvites),
    [label, setLabel] = useState(model.personalLabel || "Personal"),
    [enterprise, setEnterprise] = useState(model.enterprise || "Enterprise A"),
    [notify, setNotify] = useState(true),
    [share, setShare] = useState(false),
    [description, setDescription] = useState(
      "Secure face detection for our team",
    ),
    [members, setMembers] = useState(mockMembers),
    [audit, setAudit] = useState<string[]>([]);
  const activeEnterprise = model.enterprise || "Enterprise A";
  const [groupEnterprise, setGroupEnterprise] = useState<string | null>(
    view === "groups" ? null : activeEnterprise,
  );
  const allGroups = (
    groups ??
    (backendEnabled
      ? source.data
      : model.groupsLoaded
        ? model.groups
        : source.data) ??
    []
  ).map((entry) => ({
    ...entry,
    enterpriseName: getGroupEnterprise(entry, activeEnterprise),
    members: (() => {
      const own = entry.members.find(
        (member) =>
          member.email.toLowerCase() === currentUser.email.toLowerCase(),
      );
      if (own)
        return entry.members.map((member) =>
          member === own
            ? { ...member, name: currentUser.name, role: entry.role }
            : member,
        );
      if (backendEnabled) return entry.members;
      const legacy = entry.members.find(
        (member) =>
          member.email === "user1@example.com" && member.role === entry.role,
      );
      const member = { ...currentUser, role: entry.role };
      return legacy
        ? entry.members.map((item) => (item === legacy ? member : item))
        : [...entry.members, member];
    })(),
  }));
  const enterpriseScoped = view === "enterprise" || view === "workspace";
  const list = enterpriseScoped
    ? allGroups.filter((entry) => entry.enterpriseName === activeEnterprise)
    : allGroups;
  const availableEnterprises = Array.from(
    new Set([
      activeEnterprise,
      ...allGroups.flatMap((entry) =>
        entry.enterpriseName ? [entry.enterpriseName] : [],
      ),
    ]),
  );
  const group = list.find((g) => g.id === groupId) || null;
  const enterpriseRole = authorization.role(activeEnterprise);
  const enterpriseAdmin = canManageRole(enterpriseRole);
  const enterpriseRecord = authorization.workspaces.find(
    (item) => item.type === "enterprise" && item.name === activeEnterprise,
  );
  const enterpriseMembers = backendEnabled
    ? enterpriseRecord?.members || []
    : (() => {
        const own = members.find(
          (member) =>
            member.email.toLowerCase() === currentUser.email.toLowerCase(),
        );
        if (own)
          return members.map((member) =>
            member === own
              ? {
                  ...member,
                  name: currentUser.name,
                  role: enterpriseRole || "Member",
                }
              : member,
          );
        const legacy = members.find(
          (member) =>
            member.email === "user1@example.com" &&
            member.role === enterpriseRole,
        );
        const current = {
          ...currentUser,
          role: enterpriseRole || ("Member" as const),
        };
        return legacy
          ? members.map((member) => (member === legacy ? current : member))
          : [...members, current];
      })();
  const groupRole = group
    ? authorization.role(
        group.enterpriseName
          ? group.enterpriseName + " / " + group.name
          : "Independent / " + group.name,
      )
    : null;
  const owner = groupRole === "Owner",
    admin = canManageRole(groupRole);
  useEffect(() => {
    if (params.get("invited")) setModal("invited");
  }, [params]);
  const persist = (next: Group[]) => {
    const nextGroups = enterpriseScoped
      ? [
          ...allGroups.filter(
            (entry) => entry.enterpriseName !== activeEnterprise,
          ),
          ...next,
        ]
      : next;
    setGroups(nextGroups);
    update((m) => ({ ...m, groups: nextGroups, groupsLoaded: true }));
    notifySaved();
  };
  const log = (text: string) => {
    setAudit((a) => [new Date().toLocaleString() + " · " + text, ...a]);
    update((m) => ({ ...m, audit: [text, ...m.audit] }));
  };
  const invite = (type: string) => {
    if (type.includes("enterprise") ? !enterpriseAdmin : !admin) return;
    setModal(type);
    setEmail("");
  };
  async function create() {
    if (!name.trim() || !authorization.canCreateGroup(null)) return;
    if (
      modal !== "enterprise" &&
      !authorization.canCreateGroup(
        view === "groups" ? groupEnterprise : activeEnterprise,
      )
    )
      return;
    const parentEnterprise =
      view === "groups" ? groupEnterprise : activeEnterprise;
    if (backendEnabled && modal === "enterprise") {
      toast.info("Connect enterprise creation endpoint");
      return;
    }
    try {
      if (backendEnabled) {
        const created = await api.createGroup(name.trim(), parentEnterprise);
        persist([...list, created]);
      } else if (modal === "enterprise") {
        setEnterprise(name.trim());
        update((m) => ({
          ...m,
          enterprise: name.trim(),
          workspaceMemberships: [
            ...authorization.workspaces.filter(
              (item) => item.name !== name.trim(),
            ),
            {
              id: crypto.randomUUID(),
              name: name.trim(),
              type: "enterprise",
              role: "Owner",
            },
          ],
        }));
        router.push("/workspace/enterprise");
      } else
        persist([
          ...list,
          {
            id: crypto.randomUUID(),
            name: name.trim(),
            enterpriseName: parentEnterprise,
            role: "Owner",
            members: [
              {
                name: model.name || "Test User",
                email: currentUser.email,
                role: "Owner",
              },
            ],
            files: 0,
          },
        ]);
      setModal("");
      setName("");
      log("Created " + name);
    } catch {
      toast.error("Unable to create workspace");
    }
  }
  const isPersonal = view === "personal",
    isGroup = view === "group",
    isEnterprise = view === "enterprise",
    isGroups = view === "groups";
  const title = isPersonal
    ? "Personal workspace"
    : isGroup
      ? group?.name || "Group not found"
      : isEnterprise
        ? enterprise
        : isGroups
          ? "My Group"
          : "Workspace";
  return {
    view,
    authorization,
    enterpriseRole,
    enterpriseAdmin,
    currentUser,
    mockMembers,
    model,
    update,
    router,
    params,
    source,
    groups,
    setGroups,
    tab,
    setTab,
    modal,
    setModal,
    name,
    setName,
    email,
    setEmail,
    pending,
    setPending,
    invites,
    setInvites,
    label,
    setLabel,
    enterprise: view === "group" ? group?.enterpriseName || "" : enterprise,
    setEnterprise,
    activeEnterprise,
    allGroups,
    availableEnterprises,
    groupEnterprise,
    setGroupEnterprise,
    notify,
    setNotify,
    share,
    setShare,
    description,
    setDescription,
    members: enterpriseMembers,
    setMembers,
    audit,
    setAudit,
    list,
    group,
    owner,
    admin,
    persist,
    log,
    invite,
    create,
    isPersonal,
    isGroup,
    isEnterprise,
    isGroups,
    title,
  };
}
export type WorkspaceState = ReturnType<typeof useWorkspaceManagement>;

"use client";
import { saved } from "@/components/ui/cepp";
import { useData } from "@/hooks/use-api-data";
import { useCepp } from "@/hooks/use-cepp";
import { api, backendEnabled } from "@/lib/api/cepp";
import { type Group, type Member } from "@/types/cepp";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
export type WorkspaceFixtures = {
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
export function useWorkspace({
  view,
  groupId = "1",
  fixtures,
}: {
  view: WorkspaceView;
  groupId?: string;
  fixtures: WorkspaceFixtures;
}) {
  const mockGroups = fixtures.groups,
    mockMembers = fixtures.members,
    mockInvites = fixtures.invites;
  const { model, update } = useCepp(),
    router = useRouter(),
    params = useSearchParams(),
    source = useData(api.groups, mockGroups);
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
  const list =
    groups ?? (model.groupsLoaded ? model.groups : source.data) ?? [];
  const group = list.find((g) => g.id === groupId) || null;
  const owner = group?.role === "Owner",
    admin = owner || group?.role === "Admin";
  useEffect(() => {
    if (params.get("invited")) setModal("invited");
  }, [params]);
  const persist = (next: Group[]) => {
    setGroups(next);
    update((m) => ({ ...m, groups: next, groupsLoaded: true }));
    saved();
  };
  const log = (text: string) => {
    setAudit((a) => [new Date().toLocaleString() + " · " + text, ...a]);
    update((m) => ({ ...m, audit: [text, ...m.audit] }));
  };
  const invite = (type: string) => {
    setModal(type);
    setEmail("");
  };
  async function create() {
    if (!name.trim()) return;
    try {
      if (backendEnabled) {
        const created = await api.createGroup(name.trim());
        persist([...list, created]);
      } else if (modal === "enterprise") {
        setEnterprise(name.trim());
        update((m) => ({ ...m, enterprise: name.trim() }));
        router.push("/workspace/enterprise");
      } else
        persist([
          ...list,
          {
            id: crypto.randomUUID(),
            name: name.trim(),
            role: "Owner",
            members: [
              {
                name: model.name || "Test User",
                email: "user1@example.com",
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
    enterprise,
    setEnterprise,
    notify,
    setNotify,
    share,
    setShare,
    description,
    setDescription,
    members,
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
export type WorkspaceState = ReturnType<typeof useWorkspace>;

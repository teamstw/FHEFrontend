"use client";
import { Shell } from "@/components/layout/page-shell";
import { Badge, Button, Notice, Panel } from "@/components/ui/cepp";
import { GroupCard } from "@/features/workspaces/components/group-card";
import { WorkspaceDialogs } from "@/features/workspaces/components/workspace-dialogs";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";
import { type Group, type Member } from "@/types/cepp";
export default function MyGroupsPage() {
  const workspace = useWorkspace({
    view: "groups",
    fixtures: {
      groups: mockGroups,
      members: mockMembers,
      invites: mockInvites,
    },
  });
  const {
    model,
    router,
    source,
    setModal,
    setName,
    invites,
    enterprise,
    list,
    title,
  } = workspace;
  const groupRows = (group: Group) => (
    <GroupCard key={group.id} group={group} workspace={workspace} />
  );
  return (
    <Shell
      title={title}
      description={"กลุ่มทั้งหมดของคุณ"}
      section="Workspace"
      action=<Button
        onClick={() => {
          setModal("group");
          setName("");
        }}
      >
        {"Create group"}
      </Button>
    >
      {source.error && <p className="cepp-alert">{source.error}</p>}

      <>
        <p className="cepp-muted cepp-mono">
          Workspace / {enterprise}
          {" / Groups"}
        </p>
        <div className="cepp-row start wrap cepp-group-toolbar">
          <Badge tone="green">
            Enterprise Owner · {model.name || "Test User"}
          </Badge>
          <Badge>{list.length} groups / 4 enterprise members</Badge>
          <Button secondary onClick={() => router.push("/billing")}>
            Enterprise billing
          </Button>
          <Button secondary onClick={() => setModal("invited")}>
            Invited <Badge>{invites.length}</Badge>
          </Button>
        </div>

        <Panel title={"My Group"}>
          {list.map(groupRows)}
          <p className="cepp-muted">
            Enterprise Owner/Admin can create, manage and delete groups. Group
            membership is managed within each group.
          </p>
        </Panel>
        <Notice title="Roles are scoped to each group">
          Owner appoints and revokes group Admins. Group Admins manage group
          members and group billing; Members can view shared work. Your
          enterprise role: Owner.
        </Notice>
      </>

      <WorkspaceDialogs workspace={workspace} />
    </Shell>
  );
}
const mockMembers: Member[] = [
  { name: "Test User", email: "user1@example.com", role: "Owner" },
  { name: "Pim Suri", email: "pim@example.com", role: "Admin" },
  { name: "Narin Chai", email: "narin@example.com", role: "Member" },
  { name: "Arun Kiet", email: "arun@example.com", role: "Member" },
];
const mockGroups: Group[] = [
  { id: "1", name: "Group 1", role: "Owner", members: mockMembers, files: 4 },
  {
    id: "2",
    name: "Group 2",
    role: "Member",
    members: mockMembers.slice(0, 2),
    files: 1,
  },
  {
    id: "3",
    name: "Group 3",
    role: "Admin",
    members: [
      { ...mockMembers[1], role: "Owner" },
      { ...mockMembers[0], role: "Admin" },
      mockMembers[2],
    ],
    files: 2,
  },
];
const mockInvites = ["Group 4", "Group 5", "Group 6"];

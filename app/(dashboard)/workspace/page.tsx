"use client";
import { Shell } from "@/components/layout/page-shell";
import { Icon } from "@/components/ui/brand-icon";
import { Badge, Button, Notice, Panel, Tabs } from "@/components/ui/cepp";
import { WorkspaceDialogs } from "@/features/workspaces/components/workspace-dialogs";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";
import { type Group, type Member } from "@/types/cepp";
export default function WorkspacesPage() {
  const workspace = useWorkspace({
    view: "workspace",
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
    tab,
    setTab,
    setModal,
    setName,
    enterprise,
    list,
    title,
  } = workspace;
  return (
    <Shell
      title={title}
      description={"พื้นที่ทำงานส่วนตัวและองค์กรของคุณ"}
      section="Workspace"
      action=<Button
        onClick={() => {
          setModal("enterprise");
          setName("");
        }}
      >
        {"Create enterprise"}
      </Button>
    >
      {source.error && <p className="cepp-alert">{source.error}</p>}
      <>
        <Notice title="Choose the correct scope">
          Workspace → Personal OR Enterprise → multiple Groups. Jobs, key
          versions and billing belong to their selected scope.
        </Notice>
        <Tabs
          items={["All", "Personal", "Enterprise"]}
          value={tab}
          onChange={setTab}
        />
        {tab !== "Enterprise" && (
          <Panel>
            <div className="cepp-row wrap">
              <div className="cepp-row">
                <Icon name="personal" />
                <div>
                  <div className="cepp-row start">
                    <h2>Personal</h2>
                    <Badge>Sole user</Badge>
                  </div>
                  <p className="cepp-muted">
                    {model.name || "Test User"} · พื้นที่ส่วนตัวสำหรับคุณคนเดียว
                  </p>
                  <small className="cepp-mono cepp-muted">
                    1 user · 3 jobs · 3 encrypted files
                  </small>
                </div>
              </div>
              <Button
                secondary
                onClick={() => router.push("/workspace/personal")}
              >
                Open Personal
              </Button>
            </div>
          </Panel>
        )}
        {tab !== "Personal" && (
          <Panel>
            <div className="cepp-row wrap">
              <div className="cepp-row">
                <Icon name="group" />
                <div>
                  <div className="cepp-row start">
                    <h2>{enterprise}</h2>
                    <Badge tone="green">Owner</Badge>
                  </div>
                  <p className="cepp-muted">
                    {list.length} groups · 4 enterprise members
                  </p>
                </div>
              </div>
              <Button
                secondary
                onClick={() => router.push("/workspace/enterprise")}
              >
                Open Enterprise
              </Button>
            </div>
            <div className="cepp-grid three">
              {list.slice(0, 3).map((g) => (
                <Panel key={g.id}>
                  <h3>{g.name}</h3>
                  <Badge tone={g.role === "Admin" ? "amber" : "cyan"}>
                    {g.role}
                  </Badge>
                  <p className="cepp-muted">
                    {g.members.length} Members · {g.files} Files
                  </p>
                  <Button
                    secondary
                    small
                    onClick={() => router.push("/my-group/" + g.id)}
                  >
                    View group
                  </Button>
                </Panel>
              ))}
            </div>
          </Panel>
        )}
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

"use client";
import { Shell } from "@/components/layout/page-shell";
import {
  Badge,
  Button,
  Field,
  Notice,
  Panel,
  Rows,
  Tabs,
  saved,
} from "@/components/ui/cepp";
import { GroupCard } from "@/features/workspaces/components/group-card";
import { MemberList } from "@/features/workspaces/components/member-list";
import { WorkspaceDialogs } from "@/features/workspaces/components/workspace-dialogs";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";
import { backendEnabled } from "@/lib/api/cepp";
import { type Group, type Member } from "@/types/cepp";
import { toast } from "sonner";
export default function EnterprisePage() {
  const workspace = useWorkspace({
    view: "enterprise",
    fixtures: {
      groups: mockGroups,
      members: mockMembers,
      invites: mockInvites,
    },
  });
  const {
    model,
    update,
    router,
    source,
    tab,
    setTab,
    setModal,
    setName,
    enterprise,
    setEnterprise,
    members,
    audit,
    list,
    invite,
    title,
  } = workspace;
  const groupRows = (group: Group) => (
    <GroupCard key={group.id} group={group} workspace={workspace} />
  );
  const memberRows = (items: Member[], scope: "enterprise" | "group") => (
    <MemberList items={items} scope={scope} workspace={workspace} />
  );
  return (
    <Shell
      title={title}
      description={"ภาพรวมองค์กร กลุ่ม และสิทธิ์สมาชิก"}
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
          {""}
        </p>
        <div className="cepp-row start wrap">
          <Badge tone="green">
            Enterprise Owner · {model.name || "Test User"}
          </Badge>
          <Badge>{list.length} groups / 4 enterprise members</Badge>
          <Button secondary onClick={() => router.push("/billing")}>
            Enterprise billing
          </Button>
        </div>
        {
          <Tabs
            items={[
              "Overview",
              "Enterprise members",
              "Enterprise settings",
              "Audit",
            ]}
            value={tab === "All" ? "Overview" : tab}
            onChange={(v) => {
              setTab(v);
              document
                .getElementById(v)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        }
        <Panel title={"Groups within " + enterprise}>
          {list.map(groupRows)}
          <p className="cepp-muted">
            Enterprise Owner/Admin can create, manage and delete groups. Group
            membership is managed within each group.
          </p>
        </Panel>

        <>
          <div id="Enterprise members">
            <Panel title="Enterprise members · organization scope">
              <p className="cepp-muted">
                Owner alone can appoint or revoke enterprise Admins.
              </p>
              <div className="cepp-row" style={{ justifyContent: "flex-end" }}>
                <Button onClick={() => invite("Invite enterprise member")}>
                  Invite enterprise member
                </Button>
              </div>
              {memberRows(members, "enterprise")}
            </Panel>
          </div>
          <div className="cepp-grid">
            <div id="Enterprise settings">
              <Panel title="Enterprise settings">
                <Field
                  label="Enterprise name"
                  value={enterprise}
                  onChange={(e) => setEnterprise(e.target.value)}
                />
                <Rows
                  rows={[
                    [
                      "Default billing",
                      "Enterprise payer · Group 1 and Group 2",
                    ],
                  ]}
                />
                <p className="cepp-muted">
                  Group 3 uses independent billing. Changing this setting does
                  not change a group’s owner or local-key custody.
                </p>
                <Button
                  onClick={() => {
                    if (backendEnabled) {
                      toast.info("Connect enterprise settings endpoint");
                      return;
                    }
                    update((m) => ({ ...m, enterprise }));
                    saved();
                  }}
                >
                  Save enterprise settings
                </Button>
              </Panel>
            </div>
            <Panel title="Permission boundaries">
              <Rows
                rows={[
                  [
                    "Enterprise Admin",
                    "Manage / delete groups and enterprise billing",
                  ],
                  ["Group Admin", "Manage group Members and group billing"],
                  [
                    "Owner only",
                    "Appoint Admins; transfer enterprise ownership",
                  ],
                ]}
              />
              <Notice title="Owner-only enterprise actions" warning>
                Admin cannot appoint peer Admins or transfer enterprise
                ownership. These are not group settings.
              </Notice>
              <Button
                danger
                secondary
                onClick={() => setModal("Transfer enterprise ownership")}
              >
                Transfer enterprise ownership
              </Button>
            </Panel>
          </div>
          <div id="Audit">
            <Panel title="Enterprise audit">
              {[...audit, ...mockAudit].map((a, i) => (
                <p key={i} className="cepp-muted">
                  {a}
                </p>
              ))}
            </Panel>
          </div>
        </>
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
const mockAudit = [
  "2 Mar 2026 · Test User · updated enterprise monthly budget",
  "28 Feb 2026 · Test User · appointed Pim Suri as enterprise Admin",
];

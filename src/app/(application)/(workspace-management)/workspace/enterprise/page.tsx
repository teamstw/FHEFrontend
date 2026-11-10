"use client";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Notice } from "@/components/ui/notice";
import { Panel } from "@/components/ui/panel";
import { DetailRows } from "@/components/ui/detail-rows";
import { Tabs } from "@/components/ui/tabs";
import { notifySaved } from "@/lib/save-feedback";
import { GroupCard } from "@/features/workspaces/components/group-card";
import { MemberList } from "@/features/workspaces/components/member-list";
import { WorkspaceDialogs } from "@/features/workspaces/components/workspace-dialogs";
import { useWorkspaceManagement } from "@/features/workspaces/hooks/use-workspace-management";
import { backendEnabled } from "@/lib/api/backend-api";
import type { Group } from "@/types/workspace";
import type { Member } from "@/types/workspace";
import { toast } from "sonner";
export default function EnterpriseWorkspacePage() {
  const workspace = useWorkspaceManagement({
    view: "enterprise",
    fixtures: {
      groups: mockGroups,
      workspaces: mockWorkspaces,
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
    activeEnterprise,
    allGroups,
    setGroups,
    members,
    audit,
    list,
    invite,
    title,
    enterpriseAdmin,
    enterpriseRole,
  } = workspace;
  const groupRows = (group: Group) => (
    <GroupCard key={group.id} group={group} workspace={workspace} />
  );
  const memberRows = (items: Member[], scope: "enterprise" | "group") => (
    <MemberList items={items} scope={scope} workspace={workspace} />
  );
  return (
    <PageShell
      title={title}
      description={"ภาพรวมองค์กร กลุ่ม และสิทธิ์สมาชิก"}
      section="Workspace"
      action={
        enterpriseAdmin && (
          <Button
            onClick={() => {
              setModal("group");
              setName("");
            }}
          >
            {"Create group"}
          </Button>
        )
      }
    >
      {source.error && <p className="cepp-alert">{source.error}</p>}

      <>
        <p className="cepp-muted cepp-mono">
          Workspace / {enterprise}
          {""}
        </p>
        <div className="cepp-row start wrap cepp-enterprise-toolbar">
          <Badge
            tone={
              enterpriseRole === "Owner"
                ? "green"
                : enterpriseRole === "Admin"
                  ? "amber"
                  : "cyan"
            }
          >
            Enterprise {enterpriseRole || "Member"} ·{" "}
            {model.name || "Test User"}
          </Badge>
          <Badge>
            {list.length} groups / {members.length} enterprise members
          </Badge>
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
                {enterpriseAdmin && (
                  <Button onClick={() => invite("Invite enterprise member")}>
                    Invite enterprise member
                  </Button>
                )}
              </div>
              {memberRows(members, "enterprise")}
            </Panel>
          </div>
          <div className="cepp-grid">
            <div id="Enterprise settings">
              <Panel title="Enterprise settings">
                {enterpriseAdmin ? (
                  <TextField
                    label="Enterprise name"
                    value={enterprise}
                    onChange={(e) => setEnterprise(e.target.value)}
                  />
                ) : (
                  <DetailRows rows={[["Enterprise name", enterprise]]} />
                )}
                <DetailRows
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
                {enterpriseAdmin && (
                  <Button
                    onClick={() => {
                      if (!enterpriseAdmin) return;
                      if (backendEnabled) {
                        toast.info("Connect enterprise settings endpoint");
                        return;
                      }
                      const nextName = enterprise.trim();
                      if (!nextName) return;
                      update((m) => ({
                        ...m,
                        enterprise: nextName,
                        workspaceMemberships:
                          workspace.authorization.workspaces.map((item) =>
                            item.type === "enterprise" &&
                            item.name === activeEnterprise
                              ? { ...item, name: nextName }
                              : item,
                          ),
                        groups: allGroups.map((entry) =>
                          entry.enterpriseName === activeEnterprise
                            ? { ...entry, enterpriseName: nextName }
                            : entry,
                        ),
                        groupsLoaded: true,
                      }));
                      setGroups(null);
                      notifySaved();
                    }}
                  >
                    Save enterprise settings
                  </Button>
                )}
              </Panel>
            </div>
            <Panel title="Permission boundaries">
              <DetailRows
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
              {enterpriseRole === "Owner" && (
                <Button
                  danger
                  secondary
                  onClick={() => setModal("Transfer enterprise ownership")}
                >
                  Transfer enterprise ownership
                </Button>
              )}
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
    </PageShell>
  );
}
const mockMembers: Member[] = [
  { name: "Test User", email: "user1@example.com", role: "Owner" },
  { name: "Pim Suri", email: "pim@example.com", role: "Admin" },
  { name: "Narin Chai", email: "narin@example.com", role: "Member" },
  { name: "Arun Kiet", email: "arun@example.com", role: "Member" },
];
const mockGroups: Group[] = [
  {
    id: "1",
    enterpriseName: "Enterprise A",
    name: "Group 1",
    role: "Owner",
    members: mockMembers,
    files: 4,
  },
  {
    id: "2",
    enterpriseName: "Enterprise A",
    name: "Group 2",
    role: "Member",
    members: mockMembers.slice(0, 2),
    files: 1,
  },
  {
    id: "3",
    enterpriseName: "Enterprise A",
    name: "Group 3",
    role: "Admin",
    members: [
      { ...mockMembers[1], role: "Owner" },
      { ...mockMembers[0], role: "Admin" },
      mockMembers[2],
    ],
    files: 2,
  },
  {
    id: "enterprise-b-group",
    name: "Product team",
    enterpriseName: "Enterprise B",
    role: "Member",
    members: [
      { ...mockMembers[1], role: "Owner" },
      { ...mockMembers[0], role: "Member" },
    ],
    files: 2,
  },
  {
    id: "independent-group",
    name: "Research group",
    enterpriseName: null,
    role: "Owner",
    members: [mockMembers[0]],
    files: 1,
  },
];
const mockInvites = ["Group 4", "Group 5", "Group 6"];
const mockAudit = [
  "2 Mar 2026 · Test User · updated enterprise monthly budget",
  "28 Feb 2026 · Test User · appointed Pim Suri as enterprise Admin",
];

const mockWorkspaces: import("@/types/workspace").WorkspaceOption[] = [
  {
    id: "enterprise-a",
    name: "Enterprise A",
    type: "enterprise",
    role: "Owner",
  },
];

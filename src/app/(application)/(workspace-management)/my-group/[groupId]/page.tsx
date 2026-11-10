"use client";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Panel } from "@/components/ui/panel";
import { DetailRows } from "@/components/ui/detail-rows";
import { Tabs } from "@/components/ui/tabs";
import { GroupSettingsForm } from "@/features/workspaces/components/group-settings-form";
import { MemberList } from "@/features/workspaces/components/member-list";
import { WorkspaceDialogs } from "@/features/workspaces/components/workspace-dialogs";
import { useWorkspaceManagement } from "@/features/workspaces/hooks/use-workspace-management";
import { api, backendEnabled } from "@/lib/api/backend-api";
import type { Group } from "@/types/workspace";
import type { Member } from "@/types/workspace";
import { useParams } from "next/navigation";
export default function GroupDetailsPage() {
  const { groupId } = useParams<{
    groupId: string;
  }>();
  const workspace = useWorkspaceManagement({
    view: "group",
    groupId,
    fixtures: {
      groups: mockGroups,
      workspaces: mockWorkspaces,
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
    enterprise,
    audit,
    list,
    group,
    owner,
    admin,
    persist,
    invite,
    title,
  } = workspace;
  const memberRows = (
    items: Member[],
    scope: "enterprise" | "group",
    readOnly = false,
  ) => (
    <MemberList
      items={items}
      scope={scope}
      workspace={workspace}
      readOnly={readOnly}
    />
  );
  return (
    <PageShell
      title={title}
      description={"รายละเอียดกลุ่มและสมาชิก · " + (group?.name || "")}
      section="Workspace"
      action={undefined}
    >
      {source.error && <p className="cepp-alert">{source.error}</p>}

      {group && (
        <>
          <p className="cepp-muted cepp-mono">
            Workspace / My Group / {enterprise ? `${enterprise} / ` : ""}
            {group.name}
          </p>
          <Tabs
            items={["Overview", "Settings"]}
            value={tab === "All" ? "Overview" : tab}
            onChange={setTab}
          />
          {tab !== "Settings" ? (
            <>
              <Panel title={group.name}>
                <p className="cepp-muted">
                  {enterprise || "Independent group"}
                </p>
                <div className="cepp-row">
                  <p className="cepp-muted">
                    {group.members.length} Members · {group.files} Files
                  </p>
                  <Badge
                    tone={
                      owner
                        ? "green"
                        : group.role === "Admin"
                          ? "amber"
                          : "cyan"
                    }
                  >
                    {group.role}
                  </Badge>
                </div>
              </Panel>
              <Panel title={"Members · " + group.members.length}>
                <div className="cepp-row wrap">
                  <p className="cepp-muted">
                    Signed in as {model.name || "Test User"} · Group{" "}
                    {group.role}
                  </p>
                  {admin && (
                    <Button onClick={() => invite("Invite member")}>
                      Invite member
                    </Button>
                  )}
                </div>
                {memberRows(group.members, "group", true)}
              </Panel>
              <Panel title="Role permissions">
                <DetailRows
                  rows={[
                    ["Owner only", "Assign / revoke Admin; transfer ownership"],
                    [
                      "Group Admin",
                      "Add / remove Members; manage group billing",
                    ],
                    ["Member", "Access shared jobs and files"],
                  ]}
                />
                <Notice title="No peer appointment by Admins">
                  Admin cannot appoint another Admin, revoke an Admin, or
                  transfer ownership. These controls are available only to the
                  Owner.
                </Notice>
              </Panel>
              <Panel title={"Shared work · " + group.files + " Files"}>
                <strong>batch_result_001.enc</strong>
                <p className="cepp-muted">
                  12.4 MB · 28 Feb 2026 · Batch 1 / 24 images
                </p>
                <strong>group1_review.enc</strong>
                <p className="cepp-muted">8.6 MB · 26 Feb 2026</p>
                <div className="cepp-row start wrap">
                  <Button secondary onClick={() => router.push("/my-file")}>
                    View files
                  </Button>
                  {admin && (
                    <Button secondary onClick={() => router.push("/billing")}>
                      Manage group billing
                    </Button>
                  )}
                </div>
              </Panel>
            </>
          ) : (
            <>
              <GroupSettingsForm
                key={group.id}
                group={group}
                authorized={admin}
                onSave={async (settings) => {
                  if (!admin)
                    throw new Error(
                      "Only Owner or Admin can edit group settings",
                    );
                  const saved = backendEnabled
                    ? await api.updateGroup(group.id, settings)
                    : { ...group, ...settings };
                  if (!saved || saved.id !== group.id)
                    throw new Error("Unable to confirm saved group settings");
                  persist(
                    list.map((item) => (item.id === group.id ? saved : item)),
                  );
                }}
              />
              {/* <Panel title={"Key policy · " + group.name}>
                <DetailRows
                  rows={[
                    [
                      "Allowed storage methods",
                      "Local Storage / Cloud KMS / BYOK",
                    ],
                    ["Default method", "Cloud KMS"],
                    ["Rotation reminder", "Every 90 days"],
                    ["Policy editor", "Owner / authorized Admin"],
                  ]}
                />
                <Notice title="Key access is not role inheritance">
                  An Admin role does not supply a local secret. Local jobs still
                  require the matching device or original backup.
                </Notice>
                <Button
                  secondary
                  onClick={() => router.push("/key-management")}
                >
                  Key Management
                </Button>
              </Panel> */}
              <Panel title="Membership and role controls">
                <p className="cepp-muted">
                  Group Admin can invite/remove Members and manage this group’s
                  billing.
                </p>
                {memberRows(group.members, "group")}
                <Notice title="Owner-only role management" warning>
                  Only the Group Owner can assign/revoke Admins or transfer
                  ownership.
                </Notice>
              </Panel>
              <Panel title="Audit trail">
                {[...audit, ...mockAudit].map((a, i) => (
                  <p key={i} className="cepp-muted">
                    {a}
                  </p>
                ))}
              </Panel>
            </>
          )}
        </>
      )}
      {!group && (
        <Notice title="Group not found">
          Return to My Group to choose an available group.
          <Button secondary onClick={() => router.push("/my-group")}>
            My Group
          </Button>
        </Notice>
      )}
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

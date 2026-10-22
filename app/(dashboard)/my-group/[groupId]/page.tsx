"use client";
import { Shell } from "@/components/layout/page-shell";
import {
  Badge,
  Button,
  Check,
  Field,
  Notice,
  Panel,
  Rows,
  Tabs,
} from "@/components/ui/cepp";
import { MemberList } from "@/features/workspaces/components/member-list";
import { WorkspaceDialogs } from "@/features/workspaces/components/workspace-dialogs";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";
import { api, backendEnabled } from "@/lib/api/cepp";
import { type Group, type Member } from "@/types/cepp";
import { useParams } from "next/navigation";
import { toast } from "sonner";
export default function GroupDetailsPage() {
  const { groupId } = useParams<{
    groupId: string;
  }>();
  const workspace = useWorkspace({
    view: "group",
    groupId,
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
    name,
    setName,
    enterprise,
    share,
    setShare,
    description,
    setDescription,
    audit,
    list,
    group,
    owner,
    admin,
    persist,
    invite,
    title,
  } = workspace;
  const memberRows = (items: Member[], scope: "enterprise" | "group") => (
    <MemberList items={items} scope={scope} workspace={workspace} />
  );
  return (
    <Shell
      title={title}
      description={"รายละเอียดกลุ่มและสมาชิก · " + (group?.name || "")}
      section="Workspace"
      action={undefined}
    >
      {source.error && <p className="cepp-alert">{source.error}</p>}

      {group && (
        <>
          <p className="cepp-muted cepp-mono">
            Workspace / {enterprise} / My Group / {group.name}
          </p>
          <Tabs
            items={["Overview", "Settings"]}
            value={tab === "All" ? "Overview" : tab}
            onChange={setTab}
          />
          {tab !== "Settings" ? (
            <>
              <Panel title={group.name}>
                <div className="cepp-row">
                  <p className="cepp-muted">
                    {group.members.length} Members · {group.files} Files
                  </p>
                  <Badge tone={owner ? "green" : "amber"}>{group.role}</Badge>
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
                {memberRows(group.members, "group")}
              </Panel>
              <Panel title="Role permissions">
                <Rows
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
              <Panel title="Group settings">
                <Field
                  label="Group name"
                  defaultValue={group.name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Field
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Check checked={share} onChange={setShare}>
                  Allow Members to publish encrypted previews to the group
                </Check>
                <div>
                  <Button
                    disabled={!admin}
                    onClick={async () => {
                      try {
                        if (backendEnabled)
                          await api.updateGroup(group.id, {
                            name: name || group.name,
                            description,
                            share,
                          });
                        persist(
                          list.map((g) =>
                            g.id === group.id
                              ? { ...g, name: name || g.name }
                              : g,
                          ),
                        );
                      } catch {
                        toast.error("Unable to save group");
                      }
                    }}
                  >
                    Save group settings
                  </Button>
                </div>
              </Panel>
              <Panel title={"Key policy · " + group.name}>
                <Rows
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
              </Panel>
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

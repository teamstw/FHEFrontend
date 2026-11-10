"use client";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "@/components/ui/text-field";
import { Notice } from "@/components/ui/notice";
import { Panel } from "@/components/ui/panel";
import { DetailRows } from "@/components/ui/detail-rows";
import { notifySaved } from "@/lib/save-feedback";
import { WorkspaceDialogs } from "@/features/workspaces/components/workspace-dialogs";
import { useWorkspaceManagement } from "@/features/workspaces/hooks/use-workspace-management";
import type { Group } from "@/types/workspace";
import type { Member } from "@/types/workspace";
export default function PersonalWorkspacePage() {
  const workspace = useWorkspaceManagement({
    view: "personal",
    fixtures: {
      groups: mockGroups,
      workspaces: mockWorkspaces,
      members: mockMembers,
      invites: mockInvites,
    },
  });
  const { update, router, source, label, setLabel, notify, setNotify, title } =
    workspace;
  return (
    <PageShell
      title={title}
      description={"พื้นที่ส่วนตัวของ Test User · สำหรับคุณคนเดียว"}
      section="Workspace"
      action=<Button onClick={() => router.push("/upload")}>
        Upload files
      </Button>
    >
      {source.error && <p className="cepp-alert">{source.error}</p>}

      <>
        <p className="cepp-muted cepp-mono">Workspace / Personal</p>
        <div className="cepp-grid three">
          {[
            ["Encrypted files", "3", "217.4 MB stored"],
            ["Jobs", "3", "2 completed · 1 in progress"],
            [
              "Key inventory",
              "2",
              "1 local · 1 cloud · metadata scoped to Personal",
            ],
          ].map(([name, n, text]) => (
            <Panel key={name}>
              <h3>{name}</h3>
              <strong style={{ fontSize: 30 }}>{n}</strong>
              <p className="cepp-muted">{text}</p>
            </Panel>
          ))}
        </div>
        <Panel title="Recent personal jobs">
          {mockPersonalJobs.map((j) => (
            <div className="cepp-row" key={j.title}>
              <div>
                <strong>{j.title}</strong>
                <p className="cepp-muted">{j.detail}</p>
              </div>
              <Badge tone={j.status === "Processing" ? "cyan" : "green"}>
                {j.status}
              </Badge>
            </div>
          ))}
          <div className="cepp-row start">
            <Button secondary onClick={() => router.push("/history")}>
              History
            </Button>
            <Button secondary onClick={() => router.push("/my-file")}>
              My File
            </Button>
          </div>
        </Panel>
        <Panel title="Personal keys">
          <DetailRows
            rows={[
              ["Personal local", "loc_••••4B10 / v1 · active"],
              ["Personal cloud", "kms_••••6D02 / v1 · active · IPFS"],
            ]}
          />
          <p className="cepp-muted">
            Accessible on Test User’s current device. Metadata only on the
            server; backup remains your responsibility.
          </p>
          <div>
            <Button
              secondary
              onClick={() => router.push("/key-management?scope=Personal")}
            >
              Manage personal keys
            </Button>
          </div>
        </Panel>
        <Panel title="Personal settings">
          <TextField
            label="Workspace label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <Checkbox checked={notify} onChange={setNotify}>
            Notify me when a job completes
          </Checkbox>
          <Notice title="No team controls">
            พื้นที่นี้มีผู้ใช้เพียงคนเดียว ไม่มีสมาชิกทีม การเชิญ
            หรือการจัดการบทบาท Enterprise and group membership settings are
            separate.
          </Notice>
          <div>
            <Button
              onClick={() => {
                update((m) => ({ ...m, personalLabel: label }));
                notifySaved();
              }}
            >
              Save personal settings
            </Button>
          </div>
        </Panel>
        <Panel title="Personal billing">
          <DetailRows
            rows={[
              ["Plan", "Starter · demo ฿0/month · 100 images included"],
              ["Usage", "32 / 100 images · ฿0 projected"],
              ["Saved payment", "Visa ••••4242 · default"],
            ]}
          />
          <div className="cepp-row start wrap">
            <Button secondary onClick={() => router.push("/billing")}>
              Personal billing
            </Button>
            <Button secondary onClick={() => router.push("/credit-cards")}>
              My Credit Card
            </Button>
          </div>
        </Panel>
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
const mockPersonalJobs = [
  {
    title: "Drone Footage",
    detail: "ORD-2026-003 · 12 files",
    status: "Processing",
  },
  {
    title: "Portrait study",
    detail: "12 images · 27 Feb 2026",
    status: "Completed",
  },
  {
    title: "Camera sample",
    detail: "8 images · 25 Feb 2026",
    status: "Completed",
  },
];

const mockWorkspaces: import("@/types/workspace").WorkspaceOption[] = [
  {
    id: "enterprise-a",
    name: "Enterprise A",
    type: "enterprise",
    role: "Owner",
  },
];

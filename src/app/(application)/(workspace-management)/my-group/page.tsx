"use client";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Panel } from "@/components/ui/panel";
import { Tabs } from "@/components/ui/tabs";
import { GroupCard } from "@/features/workspaces/components/group-card";
import { WorkspaceDialogs } from "@/features/workspaces/components/workspace-dialogs";
import { useWorkspaceManagement } from "@/features/workspaces/hooks/use-workspace-management";
import type { Group } from "@/types/workspace";
import type { Member } from "@/types/workspace";
import { useState } from "react";

export default function MyGroupsPage() {
  const workspace = useWorkspaceManagement({
    view: "groups",
    fixtures: {
      groups: mockGroups,
      workspaces: mockWorkspaces,
      members: mockMembers,
      invites: mockInvites,
    },
  });
  const {
    model,
    source,
    setModal,
    setName,
    setGroupEnterprise,
    invites,
    list,
    title,
  } = workspace;
  const [filter, setFilter] = useState("All groups");
  const enterprises = new Set(
    list.flatMap((group) =>
      group.enterpriseName ? [group.enterpriseName] : [],
    ),
  );
  const independent = list.filter((group) => group.enterpriseName === null);
  const visibleGroups = list.filter(
    (group) =>
      filter === "All groups" ||
      (filter === "Enterprise groups"
        ? group.enterpriseName !== null
        : group.enterpriseName === null),
  );

  return (
    <PageShell
      title={title}
      description="ทุกกลุ่มที่คุณเข้าร่วม ทั้งใน Enterprise และกลุ่มอิสระ"
      section="Workspace"
      action={
        workspace.authorization.canCreateGroup(null) && (
          <Button
            onClick={() => {
              setName("");
              setGroupEnterprise(null);
              setModal("group");
            }}
          >
            Create group
          </Button>
        )
      }
    >
      <p className="cepp-muted cepp-mono">Workspace / My Group</p>
      <div className="cepp-row start wrap cepp-group-toolbar">
        <Badge>
          {list.length} {list.length === 1 ? "group" : "groups"}
        </Badge>
        <Badge>
          {enterprises.size}{" "}
          {enterprises.size === 1 ? "enterprise" : "enterprises"}
        </Badge>
        <Badge>
          {independent.length} independent{" "}
          {independent.length === 1 ? "group" : "groups"}
        </Badge>
        <Button secondary onClick={() => setModal("invited")}>
          Invited <Badge>{invites.length}</Badge>
        </Button>
      </div>
      <p className="cepp-muted">
        Signed in as {model.name || "Test User"} ·
        สิทธิ์ของคุณอาจแตกต่างกันในแต่ละกลุ่ม
      </p>
      <Tabs
        items={["All groups", "Enterprise groups", "Independent groups"]}
        value={filter}
        onChange={setFilter}
      />
      {source.loading && (
        <p className="cepp-muted" role="status">
          Loading your groups…
        </p>
      )}
      {source.error && (
        <Notice
          title="Unable to load groups"
          action={
            <Button secondary onClick={() => source.refresh()}>
              Retry
            </Button>
          }
        >
          {source.error}
        </Notice>
      )}
      <Panel title={filter}>
        {visibleGroups.map((group) => (
          <GroupCard key={group.id} group={group} workspace={workspace} />
        ))}
        {!source.loading && !source.error && !visibleGroups.length && (
          <Notice title="No groups found">
            กลุ่มที่คุณสร้างหรือได้รับคำเชิญเข้าร่วมจะแสดงที่นี่
          </Notice>
        )}
      </Panel>
      <Notice title="Roles are scoped to each group">
        แต่ละกลุ่มมี Owner, Admin และ Member ของตัวเอง การเป็นสมาชิก Enterprise
        หนึ่งไม่ได้ให้สิทธิ์ในกลุ่มของ Enterprise อื่นหรือกลุ่มอิสระ
      </Notice>
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

const mockWorkspaces: import("@/types/workspace").WorkspaceOption[] = [
  {
    id: "enterprise-a",
    name: "Enterprise A",
    type: "enterprise",
    role: "Owner",
  },
];

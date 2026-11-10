"use client";
import { canChangeMember } from "@/lib/authorization";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type WorkspaceState } from "@/features/workspaces/hooks/use-workspace-management";
import { backendEnabled } from "@/lib/api/backend-api";
import type { Member } from "@/types/workspace";
import { toast } from "sonner";
export function MemberList({
  items,
  scope,
  workspace,
  readOnly = false,
}: {
  items: Member[];
  scope: "enterprise" | "group";
  workspace: WorkspaceState;
  readOnly?: boolean;
}) {
  const { setMembers, list, group, owner, persist, log } = workspace;
  const actor = readOnly
    ? null
    : scope === "enterprise"
      ? workspace.enterpriseRole
      : workspace.admin
        ? group?.role
        : null;
  const hasActions = items.some((member) =>
    canChangeMember(actor, member.role),
  );
  return items.map((member) => (
    <div
      className={`cepp-member cepp-member-row${!hasActions ? " cepp-member-readonly" : member.role === "Owner" ? " cepp-member-owner" : ""}`}
      key={member.email}
    >
      <span className="cepp-avatar">
        {member.name
          .split(" ")
          .map((s) => s[0])
          .join("")}
      </span>
      <div className="cepp-member-info">
        <strong>{member.name}</strong>
        {member.email.toLowerCase() ===
          workspace.currentUser.email.toLowerCase() && (
          <small className="cepp-member-you"> · You</small>
        )}
        <br />
        <small>{member.email}</small>
      </div>
      <div className="cepp-member-role">
        <Badge
          tone={
            member.role === "Owner"
              ? "green"
              : member.role === "Admin"
                ? "amber"
                : "cyan"
          }
        >
          {member.role}
        </Badge>
      </div>
      <div className="cepp-member-action">
        {canChangeMember(actor, member.role) && (
          <Button
            small
            secondary
            danger={member.role === "Member" && !owner && scope === "group"}
            onClick={() => {
              if (!canChangeMember(actor, member.role)) return;
              if (backendEnabled) {
                toast.info(
                  "Connect the member-role endpoint before changing access",
                );
                return;
              }
              const role: Member["role"] =
                member.role === "Admin" ? "Member" : "Admin";
              if (scope === "enterprise") {
                setMembers((prev) =>
                  actor === "Owner"
                    ? prev.map((m) =>
                        m.email === member.email ? { ...m, role } : m,
                      )
                    : prev.filter((m) => m.email !== member.email),
                );
                log(`${member.name}: ${role}`);
              } else if (owner && group) {
                persist(
                  list.map((g) =>
                    g.id === group.id
                      ? {
                          ...g,
                          members: g.members.map((m) =>
                            m.email === member.email ? { ...m, role } : m,
                          ),
                        }
                      : g,
                  ),
                );
                log(`${member.name}: ${role}`);
              } else if (group) {
                persist(
                  list.map((g) =>
                    g.id === group.id
                      ? {
                          ...g,
                          members: g.members.filter(
                            (m) => m.email !== member.email,
                          ),
                        }
                      : g,
                  ),
                );
                log("Removed " + member.name);
              }
            }}
          >
            {member.role === "Admin"
              ? "Revoke Admin"
              : actor === "Owner"
                ? "Assign Admin"
                : "Remove member"}
          </Button>
        )}
      </div>
    </div>
  ));
}

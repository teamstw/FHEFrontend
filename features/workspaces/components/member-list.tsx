"use client";
import { Badge, Button } from "@/components/ui/cepp";
import { type WorkspaceState } from "@/features/workspaces/hooks/use-workspace";
import { backendEnabled } from "@/lib/api/cepp";
import { type Member } from "@/types/cepp";
import { toast } from "sonner";
export function MemberList({
  items,
  scope,
  workspace,
}: {
  items: Member[];
  scope: "enterprise" | "group";
  workspace: WorkspaceState;
}) {
  const { setMembers, list, group, owner, admin, persist, log } = workspace;
  return items.map((member) => (
    <div
      className={`cepp-member cepp-member-row${member.role === "Owner" ? " cepp-member-owner" : ""}`}
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
        {member.role !== "Owner" &&
          (scope === "enterprise" ||
            owner ||
            (admin && member.role === "Member")) && (
            <Button
              small
              secondary
              danger={member.role === "Member" && !owner && scope === "group"}
              onClick={() => {
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
                    prev.map((m) =>
                      m.email === member.email ? { ...m, role } : m,
                    ),
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
                : scope === "enterprise" || owner
                  ? "Assign Admin"
                  : "Remove member"}
            </Button>
          )}
      </div>
    </div>
  ));
}

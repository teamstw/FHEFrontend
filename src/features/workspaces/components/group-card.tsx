"use client";
import { AppIcon } from "@/components/ui/app-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { type WorkspaceState } from "@/features/workspaces/hooks/use-workspace-management";
import type { Group } from "@/types/workspace";
export function GroupCard({
  group: g,
  workspace,
}: {
  group: Group;
  workspace: WorkspaceState;
}) {
  const { view, router, setModal, setPending } = workspace;
  return (
    <Panel key={g.id} className="cepp-group-card">
      <div className="cepp-row wrap">
        <div className="cepp-row cepp-group-card-identity">
          <AppIcon name="group" />
          <div className="cepp-group-card-copy">
            <div className="cepp-row start wrap">
              <h3>{g.name}</h3>
              <Badge
                tone={
                  g.role === "Owner"
                    ? "green"
                    : g.role === "Admin"
                      ? "amber"
                      : "cyan"
                }
              >
                {g.role}
              </Badge>
            </div>
            {view === "groups" && (
              <p className="cepp-group-affiliation">
                {g.enterpriseName || "Independent group"}
              </p>
            )}
            <p className="cepp-muted">
              {g.members.length} Members · {g.files} Files
            </p>
            <div className="cepp-row start" style={{ gap: 6, marginTop: 8 }}>
              {g.members.map((m) => (
                <span key={m.email} className="cepp-avatar">
                  {m.name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="cepp-stack">
          <Button
            secondary
            small
            onClick={() => router.push("/my-group/" + g.id)}
          >
            View
          </Button>
          {view === "enterprise" && workspace.enterpriseAdmin && (
            <Button
              danger
              secondary
              small
              onClick={() => {
                setPending(g);
                setModal("delete");
              }}
            >
              Delete group
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}

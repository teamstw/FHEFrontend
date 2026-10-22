"use client";
import { Icon } from "@/components/ui/brand-icon";
import { Badge, Button, Panel } from "@/components/ui/cepp";
import { type WorkspaceState } from "@/features/workspaces/hooks/use-workspace";
import { type Group } from "@/types/cepp";
export function GroupCard({
  group: g,
  workspace,
}: {
  group: Group;
  workspace: WorkspaceState;
}) {
  const { view, router, setModal, setPending } = workspace;
  return (
    <Panel key={g.id}>
      <div className="cepp-row wrap">
        <div className="cepp-row">
          <Icon name="group" />
          <div>
            <div className="cepp-row start">
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
          {view === "enterprise" && (
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

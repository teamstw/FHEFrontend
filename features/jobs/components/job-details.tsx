"use client";
import { Badge, Button, Panel, Rows } from "@/components/ui/cepp";
import { type JobCollectionState } from "@/features/jobs/hooks/use-job-collection";
export function JobDetails({ state }: { state: JobCollectionState }) {
  const { files, store, router, selected, setDecrypt } = state;
  return (
    <>
      {selected && !files && (
        <Panel title={"Detail · " + selected.name}>
          <div>
            <Badge tone={selected.status === "Completed" ? "green" : "cyan"}>
              {selected.status === "Completed"
                ? "Completed · encrypted result"
                : "Processing · encrypted data"}
            </Badge>
          </div>
          <Rows
            rows={[
              ["Order / date", `${selected.id} / ${selected.date}`],
              ["Result", `${selected.result} · ${selected.size}`],
              ["Original key", `${selected.keyId} / v${selected.version}`],
              ["Workspace", selected.scope],
            ]}
          />
          <p className="cepp-muted">
            {selected.count} files · encrypted throughout processing. Detail
            shows job status, result metadata, workspace and the required key.
          </p>
          <div className="cepp-row start wrap cepp-job-actions">
            <Button
              disabled={selected.status !== "Completed"}
              onClick={() => setDecrypt(true)}
            >
              Decrypt result
            </Button>
            <Button
              secondary
              onClick={() => {
                store.setActiveJob(selected);
                router.push(
                  selected.status === "Processing" ? "/progress" : "/my-file",
                );
              }}
            >
              {selected.status === "Processing"
                ? "View progress"
                : "View in My File"}
            </Button>
          </div>
        </Panel>
      )}
    </>
  );
}

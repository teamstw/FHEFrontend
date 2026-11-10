"use client";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { AppIcon } from "@/components/ui/app-icon";
import type { Job } from "@/types/job";

export function JobDetails({ job }: { job: Job }) {
  return (
    <Panel className="cepp-job-overview">
      <div className="cepp-job-overview-heading">
        <div className="cepp-job-identity">
          <span className="cepp-job-emblem">
            <AppIcon name="shield" size={24} />
          </span>
          <div>
            <p className="cepp-mono cepp-muted">{job.id}</p>
            <h2>{job.name}</h2>
          </div>
        </div>
        <Badge tone={job.status === "Completed" ? "green" : "cyan"}>
          {job.status}
        </Badge>
      </div>
      <dl className="cepp-job-summary">
        <div>
          <dt>Submitted</dt>
          <dd>{job.date || "—"}</dd>
        </div>
        <div>
          <dt>Input files</dt>
          <dd>{job.count} files</dd>
        </div>
        <div>
          <dt>Total size</dt>
          <dd>{job.size || "—"}</dd>
        </div>
      </dl>
    </Panel>
  );
}

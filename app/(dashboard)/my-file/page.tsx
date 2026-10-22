"use client";
import { Shell } from "@/components/layout/page-shell";
import { Button, Field, Notice, Select } from "@/components/ui/cepp";
import { JobDialogs } from "@/features/jobs/components/job-dialogs";
import { JobList } from "@/features/jobs/components/job-list";
import { useJobCollection } from "@/features/jobs/hooks/use-job-collection";
import { type Job } from "@/types/cepp";
export default function MyFilesPage() {
  const files = true;
  const state = useJobCollection({ files, mockJobs });
  const { router, source, search, setSearch, scope, setScope, filtered } =
    state;
  return (
    <Shell title={"My File"} description={"ไฟล์ผลลัพธ์ทั้งหมดของคุณ"}>
      <div className="cepp-grid">
        <Field
          label={"Search files"}
          placeholder={"Search by file name"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          label="Workspace"
          value={scope}
          onChange={setScope}
          options={["All workspaces", "Personal", "Enterprise A"]}
        />
      </div>

      <div className="cepp-row start">
        <span className="cepp-muted">
          {filtered.length} {"files"}
        </span>
        {source.loading && <span>Loading…</span>}
      </div>
      {source.error && (
        <Notice title="Unable to load data">
          {source.error}
          <Button secondary onClick={() => source.refresh()}>
            Retry
          </Button>
        </Notice>
      )}
      <JobList state={state} />
      {filtered.length === 0 && !source.loading && !source.error && (
        <Notice title={"No files found"}>
          Try another search or upload a new batch.
          <Button secondary onClick={() => router.push("/upload")}>
            Upload files
          </Button>
        </Notice>
      )}

      <JobDialogs state={state} />
    </Shell>
  );
}
const mockJobs: Job[] = [
  {
    id: "ORD-2026-001",
    name: "Face Detection - Batch 1",
    files: [],
    count: 24,
    size: "12.4 MB",
    scope: "Enterprise A / Group 1",
    keyId: "loc_7A2F",
    version: 1,
    status: "Completed",
    date: "28 Feb 2026",
    result: "batch_result_001.enc",
    demo: true,
  },
  {
    id: "ORD-2026-002",
    name: "Face Detection - Surveillance Set",
    files: [],
    count: 3,
    size: "48.2 MB",
    scope: "Enterprise A / Group 3",
    keyId: "kms_8C91",
    version: 1,
    status: "Completed",
    date: "25 Feb 2026",
    result: "surveillance_analysis.enc",
    demo: true,
  },
  {
    id: "ORD-2026-003",
    name: "Face Detection - Drone Footage",
    files: [],
    count: 12,
    size: "156.8 MB",
    scope: "Personal",
    keyId: "",
    version: 1,
    status: "Processing",
    date: "2 Mar 2026",
    result: "drone_footage_raw.enc",
    demo: true,
  },
];

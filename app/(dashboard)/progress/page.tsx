"use client";
import { Shell } from "@/components/layout/page-shell";
import { Badge, Button } from "@/components/ui/cepp";
import { Steps } from "@/features/jobs/components/workflow-steps";
import { useCepp } from "@/hooks/use-cepp";
import { api, backendEnabled } from "@/lib/api/cepp";
import { type Job } from "@/types/cepp";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function ProgressPage() {
  const { activeJob, setActiveJob, update } = useCepp(),
    router = useRouter(),
    [progress, setProgress] = useState(0),
    [error, setError] = useState("");
  const job = activeJob || mockJob;
  useEffect(() => {
    if (backendEnabled) {
      if (!activeJob) {
        setError("No active job. Upload a batch first.");
        return;
      }
      let stopped = false;
      let timer: ReturnType<typeof setTimeout>;
      const poll = async () => {
        try {
          const next = await api.job(activeJob.id);
          if (stopped) return;
          setActiveJob(next);
          if (next.status === "Completed") {
            router.replace("/completed");
            return;
          }
          timer = setTimeout(poll, 2500);
        } catch {
          if (!stopped) setError("Unable to load job status. Reload to retry.");
        }
      };
      void poll();
      return () => {
        stopped = true;
        clearTimeout(timer);
      };
    }
    if (!activeJob) return;
    const timer = setInterval(
      () => setProgress((p) => Math.min(100, p + 5)),
      160,
    );
    return () => clearInterval(timer);
  }, [activeJob?.id, router, setActiveJob]);
  useEffect(() => {
    if (
      progress === 100 &&
      activeJob?.status === "Processing" &&
      !backendEnabled
    ) {
      const completed = { ...activeJob, status: "Completed" as const };
      update((m) => ({
        ...m,
        jobs: m.jobs.map((j) => (j.id === completed.id ? completed : j)),
      }));
      setActiveJob(completed);
      router.replace("/completed");
    }
  }, [progress, activeJob, update, setActiveJob, router]);
  return (
    <Shell
      title="In Progress"
      description="กำลังประมวลผลด้วยเทคโนโลยี FHE บนข้อมูลที่เข้ารหัส"
      section="Processing"
    >
      <Steps step={2} />
      <div className="cepp-result">
        <div className="cepp-spinner" />
        <h1>
          {backendEnabled
            ? "Processing…"
            : activeJob
              ? "Processing…"
              : "In Progress"}
        </h1>
        <p>
          {job.name} · {job.count} files
        </p>
        <div
          className="cepp-progress"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: progress + "%" }} />
        </div>
        <strong>{progress}%</strong>
        <div className="cepp-row">
          <Badge>ข้อมูลยังคงเข้ารหัสอยู่</Badge>
          <Badge>Zero Trust Mode</Badge>
        </div>

        {!activeJob && (
          <Button onClick={() => router.push("/upload")}>Upload files</Button>
        )}
        {error && <p className="cepp-alert">{error}</p>}
      </div>
    </Shell>
  );
}
const mockJob: Job = {
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
};

"use client";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { WorkflowSteps } from "@/features/jobs/components/workflow-steps";
import { useAppState } from "@/hooks/use-app-state";
import { api, backendEnabled } from "@/lib/api/backend-api";
import type { Job } from "@/types/job";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProgressPage() {
  const { activeJob, setActiveJob, update, ready } = useAppState();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const job = activeJob || mockJob;
  const complete = job.status === "Completed";
  const percent = complete
    ? 100
    : backendEnabled
      ? typeof job.progress === "number" && Number.isFinite(job.progress)
        ? Math.max(0, Math.min(99, Math.round(job.progress)))
        : undefined
      : progress;

  useEffect(() => {
    if (!ready || !activeJob || activeJob.status === "Completed") return;
    setError("");
    if (!backendEnabled) {
      setProgress(0);
      const timer = setInterval(
        () => setProgress((value) => Math.min(100, value + 5)),
        160,
      );
      return () => clearInterval(timer);
    }
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const next = await api.job(activeJob!.id);
        if (stopped) return;
        if (next.id !== activeJob!.id) throw new Error("Job does not match");
        setActiveJob(next);
        if (next.status !== "Completed") timer = setTimeout(poll, 2500);
      } catch {
        if (!stopped) setError("Unable to load job status. Please try again.");
      }
    }
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [ready, activeJob?.id, activeJob?.status, attempt, setActiveJob]);

  useEffect(() => {
    if (
      backendEnabled ||
      progress !== 100 ||
      activeJob?.status !== "Processing"
    )
      return;
    const completed = {
      ...activeJob,
      status: "Completed" as const,
      resultFileId: activeJob.resultFileId || "result_" + crypto.randomUUID(),
    };
    update((current) => ({
      ...current,
      jobs: current.jobs.map((item) =>
        item.id === completed.id ? completed : item,
      ),
    }));
    setActiveJob(completed);
  }, [progress, activeJob, setActiveJob, update]);

  useEffect(() => {
    if (!ready || activeJob?.status !== "Completed") return;
    // Let the finished state remain visible before continuing the existing flow.
    const timer = setTimeout(() => router.replace("/completed"), 1000);
    return () => clearTimeout(timer);
  }, [ready, activeJob?.id, activeJob?.status, router]);

  return (
    <main className="cepp-processing-page">
      <WorkflowSteps step={2} />
      {!ready ? (
        <p className="cepp-muted" role="status">
          Loading…
        </p>
      ) : backendEnabled && !activeJob ? (
        <Notice
          title="No active job"
          action={
            <Button onClick={() => router.push("/choose-workspace")}>
              Get Started
            </Button>
          }
        >
          เลือกไฟล์เพื่อเริ่มประมวลผลก่อน
        </Notice>
      ) : (
        <section
          className={
            "cepp-processing-status" +
            (!complete && !error ? " is-running" : "")
          }
          aria-label="FHE processing status"
        >
          <div className="cepp-processing-orbit" aria-hidden="true">
            <div className="cepp-processing-face">
              <AppIcon name="face" size={40} />
            </div>
          </div>
          <div className="cepp-processing-copy">
            <h1 aria-live="polite">
              {error
                ? "Processing paused"
                : complete
                  ? "Complete!"
                  : "Processing…"}
            </h1>
            <p>กำลังประมวลผลด้วยเทคโนโลยี FHE บนข้อมูลที่เข้ารหัส</p>
          </div>
          <strong className="cepp-processing-percent">
            {percent === undefined ? "…" : `${percent}%`}
          </strong>
          <div
            className={
              "cepp-processing-bar" +
              (percent === undefined ? " indeterminate" : "")
            }
            role="progressbar"
            aria-label="FHE processing progress"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={
              percent === undefined ? "Processing" : `${percent}%`
            }
          >
            <span
              style={{ width: percent === undefined ? "35%" : `${percent}%` }}
            />
          </div>
          <div className="cepp-processing-security">
            <span>
              <AppIcon name="shield" size={14} />
              ข้อมูลยังคงเข้ารหัสอยู่
            </span>
            <span>
              <AppIcon name="lock" size={14} />
              Zero Trust Mode
            </span>
          </div>
          {error && (
            <div className="cepp-processing-error" role="alert">
              <p>{error}</p>
              <Button
                secondary
                small
                onClick={() => setAttempt((value) => value + 1)}
              >
                Retry
              </Button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

// Page-local preview; real jobs use the shared workflow state and backend polling.
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

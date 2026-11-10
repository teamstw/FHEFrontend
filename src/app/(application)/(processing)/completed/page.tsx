"use client";
import { AppIcon } from "@/components/ui/app-icon";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { WorkflowSteps } from "@/features/jobs/components/workflow-steps";
import { DecryptionDialog } from "@/features/keys/components/decryption-dialog";
import { useJobDownload } from "@/features/jobs/hooks/use-job-download";
import { useAppState } from "@/hooks/use-app-state";
import { backendEnabled } from "@/lib/api/backend-api";
import type { Job } from "@/types/job";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompletedPage() {
  const { activeJob, model, ready } = useAppState();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [doneJobId, setDoneJobId] = useState<string | null>(null);
  const job =
    activeJob ||
    (!backendEnabled && model.jobs.find((item) => item.id === mockJob.id)) ||
    mockJob;
  const decrypted = job.decrypted === true || doneJobId === job.id;
  const fileDownload = useJobDownload();

  return (
    <main className="cepp-processing-page cepp-completed-page">
      <WorkflowSteps step={3} />
      {!ready ? (
        <p role="status" className="cepp-muted">
          Loading…
        </p>
      ) : backendEnabled && !activeJob ? (
        <Notice
          title="No completed job"
          action={
            <Button onClick={() => router.push("/choose-workspace")}>
              Get Started
            </Button>
          }
        >
          เลือกไฟล์เพื่อเริ่มประมวลผลก่อน
        </Notice>
      ) : job.status !== "Completed" ? (
        <Notice
          title="Job is still processing"
          action={
            <Button onClick={() => router.push("/progress")}>
              View progress
            </Button>
          }
        >
          รอให้งานประมวลผลเสร็จสิ้นก่อนเปิดผลลัพธ์
        </Notice>
      ) : (
        <section
          className="cepp-processing-status"
          aria-label="Completed job result"
        >
          <div className="cepp-processing-orbit" aria-hidden="true">
            <div className="cepp-completed-emblem">
              <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
                <circle
                  cx="24"
                  cy="24"
                  r="17"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  d="m17 24 5 5 10-10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="cepp-processing-copy">
            <h1>ประมวลผลเสร็จสิ้น!</h1>
            <p>
              {decrypted
                ? "ถอดรหัสผลลัพธ์เรียบร้อยแล้ว สามารถดาวน์โหลดไฟล์หรือดูได้ใน My File"
                : "การตรวจจับใบหน้าบนข้อมูลที่เข้ารหัสเสร็จสมบูรณ์ ข้อมูลของคุณยังคงปลอดภัยตลอดกระบวนการ"}
            </p>
          </div>
          <div className="cepp-completed-security" aria-live="polite">
            <AppIcon name="shield" size={14} />
            <span>
              {decrypted
                ? "ถอดรหัสผลลัพธ์แล้ว"
                : "ข้อมูลไม่ถูกถอดรหัสในทุกขั้นตอน"}
            </span>
          </div>
          <div className="cepp-completed-actions">
            <Button
              disabled={!!fileDownload.downloadingId}
              onClick={() =>
                decrypted
                  ? void fileDownload.downloadJob({ ...job, decrypted: true })
                  : setOpen(true)
              }
            >
              {fileDownload.downloadingId
                ? "กำลังดาวน์โหลด…"
                : decrypted
                  ? "ดาวน์โหลดผลลัพธ์"
                  : "Decrypt"}
            </Button>
            <Button secondary onClick={() => router.push("/my-file")}>
              ดูไฟล์ของฉัน <AppIcon name="arrow" size={16} />
            </Button>
          </div>
          {fileDownload.error && (
            <div className="cepp-completed-error" role="alert">
              <Notice title="Unable to download file" warning>
                {fileDownload.error}
              </Notice>
            </div>
          )}
        </section>
      )}
      <DecryptionDialog
        key={job.id}
        open={open && ready && job.status === "Completed"}
        job={job}
        onClose={() => setOpen(false)}
        onDone={() => setDoneJobId(job.id)}
      />
    </main>
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

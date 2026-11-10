"use client";
import { PageShell } from "@/components/layout/page-shell";
import { AppIcon } from "@/components/ui/app-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DetailRows } from "@/components/ui/detail-rows";
import { Notice } from "@/components/ui/notice";
import { Panel } from "@/components/ui/panel";
import { JobDetails } from "@/features/jobs/components/job-details";
import { useJobDownload } from "@/features/jobs/hooks/use-job-download";
import { useJobDetails } from "@/features/jobs/hooks/use-job-details";
import { DecryptionDialog } from "@/features/keys/components/decryption-dialog";
import { useAppState } from "@/hooks/use-app-state";
import { backendEnabled } from "@/lib/api/backend-api";
import type { Job } from "@/types/job";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function JobDetailsPage() {
  const { jobId: routeJobId } = useParams<{ jobId: string }>();
  let jobId = routeJobId;
  try {
    jobId = decodeURIComponent(routeJobId);
  } catch {
    /* Keep malformed IDs readable in the not-found state. */
  }
  const { job, loading, error, notFound, refresh } = useJobDetails(
    jobId,
    mockJobs,
  );
  const { setActiveJob } = useAppState();
  const fileDownload = useJobDownload();
  const router = useRouter();
  const [decryptingJobId, setDecryptingJobId] = useState<string | null>(null);
  const [decryptedJobId, setDecryptedJobId] = useState<string | null>(null);
  const completed = job?.status === "Completed";
  const workspaceParts = job?.scope.split(" / ") || [];
  const groups = job?.groupNames?.length
    ? job.groupNames
    : workspaceParts.slice(1);
  const decrypted = job?.decrypted === true || decryptedJobId === job?.id;
  const canDecrypt = !!(completed && job?.result && job.keyId && !decrypted);

  return (
    <PageShell
      title="Job details"
      description="รายละเอียดงานประมวลผลและไฟล์ผลลัพธ์"
      action={
        <Link href="/history" className="cepp-button secondary">
          Back to History
        </Link>
      }
      wide
    >
      <nav className="cepp-job-breadcrumb cepp-muted" aria-label="Breadcrumb">
        <Link href="/history">History</Link>
        <span aria-hidden="true">/</span>
        <span className="cepp-mono" aria-current="page">
          {jobId}
        </span>
      </nav>

      {loading && (
        <div className="cepp-job-loading" role="status">
          Loading job details…
        </div>
      )}
      {error && (
        <div role="alert">
          <Notice
            title="Unable to load job details"
            warning
            action={
              <Button secondary onClick={refresh}>
                Retry
              </Button>
            }
          >
            {error}
          </Notice>
        </div>
      )}
      {fileDownload.error && (
        <div role="alert">
          <Notice title="Unable to download file" warning>
            {fileDownload.error}
          </Notice>
        </div>
      )}
      {notFound && (
        <Notice
          title="Job not found"
          action={
            <Link href="/history" className="cepp-button secondary">
              View History
            </Link>
          }
        >
          ไม่พบงานนี้ งานอาจถูกลบหรือไม่อยู่ในประวัติของบัญชีนี้
        </Notice>
      )}

      {job && !loading && !error && (
        <>
          <JobDetails job={job} />
          <div className="cepp-job-detail-grid">
            <div className="cepp-stack">
              <Panel title="Result">
                <div>
                  <Badge tone={completed ? "green" : "cyan"}>
                    {completed
                      ? decrypted
                        ? "Result ready"
                        : "Encrypted result"
                      : "Processing"}
                  </Badge>
                </div>
                {completed ? (
                  <>
                    <p className="cepp-job-result-name">
                      {job.result || "Result not available"}
                    </p>
                    <p className="cepp-muted">
                      {decrypted
                        ? "ถอดรหัสแล้ว พร้อมดาวน์โหลด"
                        : "ผลลัพธ์ถูกเข้ารหัส ใช้ Key ที่ตรงกับงานเพื่อถอดรหัส"}
                    </p>
                    <div className="cepp-row start wrap cepp-job-actions">
                      {decrypted ? (
                        <Button
                          disabled={!!fileDownload.downloadingId || !job.result}
                          onClick={() =>
                            void fileDownload.downloadJob({
                              ...job,
                              decrypted: true,
                            })
                          }
                        >
                          {fileDownload.downloadingId
                            ? "Downloading…"
                            : "Download"}
                        </Button>
                      ) : (
                        <Button
                          disabled={!canDecrypt}
                          onClick={() => setDecryptingJobId(job.id)}
                        >
                          Decrypt result
                        </Button>
                      )}
                      <Link href="/my-file" className="cepp-button secondary">
                        View in My File
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="cepp-muted">
                      งานกำลังประมวลผล ไฟล์ผลลัพธ์จะพร้อมใช้งานเมื่อเสร็จสิ้น
                    </p>
                    <div className="cepp-row start wrap cepp-job-actions">
                      <Button
                        onClick={() => {
                          setActiveJob(job);
                          router.push("/progress");
                        }}
                      >
                        View progress
                      </Button>
                      {backendEnabled && (
                        <Button secondary onClick={refresh}>
                          Refresh status
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </Panel>

              <Panel title={"Input files · " + job.count}>
                {job.files.length > 0 ? (
                  <ul className="cepp-job-input-files">
                    {job.files.map((name, index) => (
                      <li key={index + "-" + name}>
                        <AppIcon name="upload" size={18} />
                        <span>{name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="cepp-muted">
                    มีไฟล์ในงานนี้ {job.count} ไฟล์
                    ยังไม่มีรายการชื่อไฟล์ให้แสดง
                  </p>
                )}
              </Panel>
            </div>

            <div className="cepp-stack">
              <Panel title="Workspace">
                <DetailRows
                  rows={[
                    ["Workspace", workspaceParts[0] || "—"],
                    ["Groups", groups.length ? groups.join(", ") : "—"],
                  ]}
                />
              </Panel>
              <Panel title="Encryption key">
                <DetailRows
                  rows={[
                    ["Key ID", job.keyId || "ยังไม่มีข้อมูล Key"],
                    ["Key version", job.keyId ? "v" + job.version : "—"],
                  ]}
                />
                <p className="cepp-muted">
                  ใช้ Key และเวอร์ชันเดิมของงานนี้เพื่อถอดรหัสผลลัพธ์
                </p>
                {job.keyId && (
                  <Link
                    className="cepp-job-text-link"
                    href={
                      "/key-management?scope=" + encodeURIComponent(job.scope)
                    }
                  >
                    Manage keys
                  </Link>
                )}
              </Panel>
            </div>
          </div>
          {canDecrypt && (
            <DecryptionDialog
              key={job.id}
              job={job}
              open={decryptingJobId === job.id}
              onClose={() => setDecryptingJobId(null)}
              onDone={() => {
                setDecryptedJobId(job.id);
                if (backendEnabled) refresh();
              }}
            />
          )}
        </>
      )}
    </PageShell>
  );
}

const mockJobs: Job[] = [
  {
    id: "ORD-2026-001",
    decrypted: true,
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

"use client";
import { AppIcon } from "@/components/ui/app-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { type JobCollectionState } from "@/features/jobs/hooks/use-job-collection";
import Link from "next/link";
export function JobList({
  state,
  onMove,
  canMove,
}: {
  state: JobCollectionState;
  canMove?: (job: import("@/types/job").Job) => boolean;
  onMove?: (job: import("@/types/job").Job) => void;
}) {
  const { files, setView, filtered, startDecrypt, fileDownload } = state;
  return (
    <>
      {filtered.map((job) => (
        <Panel key={job.id}>
          <div className="cepp-row wrap">
            <div className="cepp-row start wrap">
              <AppIcon name={files ? "upload" : "shield"} size={20} />
              <h2>{files ? job.result : job.name}</h2>
              {(!files || !job.decrypted) && (
                <Badge tone={job.status === "Completed" ? "green" : "cyan"}>
                  {files ? "Encrypted" : job.status}
                </Badge>
              )}
            </div>
            <div className="cepp-row wrap cepp-job-card-actions">
              {files ? (
                <>
                  <Button small secondary onClick={() => setView(job)}>
                    View
                  </Button>
                  {job.decrypted ? (
                    <Button
                      small
                      secondary
                      disabled={!!fileDownload.downloadingId || !job.result}
                      onClick={() => void fileDownload.downloadJob(job)}
                    >
                      {fileDownload.downloadingId === job.id
                        ? "Downloading…"
                        : "Download"}
                    </Button>
                  ) : job.status === "Completed" ? (
                    <Button small secondary onClick={() => startDecrypt(job)}>
                      Decrypt
                    </Button>
                  ) : null}
                </>
              ) : (
                <Link
                  className="cepp-button small secondary"
                  href={"/history/" + encodeURIComponent(job.id)}
                  aria-label={"Detail: " + job.name}
                >
                  Detail →
                </Link>
              )}
            </div>
          </div>
          <p className="cepp-muted">
            {files
              ? "ผลลัพธ์จาก " + job.name
              : job.name === "Face Detection - Batch 1"
                ? "ประมวลผลภาพ 24 รูป ด้วยระบบ FHE Face Detection สำเร็จ ข้อมูลผ่านการเข้ารหัสตลอดกระบวนการ"
                : job.status === "Processing"
                  ? "กำลังประมวลผลภาพถ่ายทางอากาศจากโดรน ด้วยระบบ Zero Trust Face Detection"
                  : "ผลวิเคราะห์วิดีโอ CCTV ด้วย Zero Trust Face Detection"}
          </p>
          <p className="cepp-mono cepp-muted">
            {files ? job.size : job.id} · {job.date} · {job.count} files
          </p>
          <p className="cepp-muted">
            {job.scope}
            {job.groupNames?.length ? ` / ${job.groupNames.join(", ")}` : ""}
          </p>
          {onMove && (
            <div className="cepp-library-file-footer">
              <Link
                className="cepp-job-text-link"
                href={"/history/" + encodeURIComponent(job.id)}
              >
                Job details
              </Link>
              {(!canMove || canMove(job)) && (
                <Button small secondary onClick={() => onMove(job)}>
                  Move
                </Button>
              )}
            </div>
          )}
        </Panel>
      ))}
    </>
  );
}

"use client";
import { Icon } from "@/components/ui/brand-icon";
import { Badge, Button, Panel } from "@/components/ui/cepp";
import { type JobCollectionState } from "@/features/jobs/hooks/use-job-collection";
import { download } from "@/lib/download";
export function JobList({ state }: { state: JobCollectionState }) {
  const { files, setSelected, setView, decrypted, filtered, startDecrypt } =
    state;
  return (
    <>
      {filtered.map((job) => (
        <Panel key={job.id}>
          <div className="cepp-row wrap">
            <div className="cepp-row start wrap">
              <Icon name={files ? "upload" : "shield"} size={20} />
              <h2>{files ? job.result : job.name}</h2>
              <Badge tone={job.status === "Completed" ? "green" : "cyan"}>
                {files
                  ? decrypted.includes(job.id)
                    ? "Decrypted"
                    : "Encrypted"
                  : job.status}
              </Badge>
            </div>
            <div className="cepp-row wrap">
              {files ? (
                <>
                  <Button small secondary onClick={() => setView(job)}>
                    View
                  </Button>
                  {job.status === "Completed" && (
                    <Button
                      small
                      secondary
                      onClick={() =>
                        decrypted.includes(job.id)
                          ? download(
                              "demo-result-metadata.json",
                              JSON.stringify(job, null, 2),
                            )
                          : startDecrypt(job)
                      }
                    >
                      {decrypted.includes(job.id) ? "Download" : "Decrypt"}
                    </Button>
                  )}
                </>
              ) : (
                <Button small secondary onClick={() => setSelected(job)}>
                  Detail →
                </Button>
              )}
            </div>
          </div>
          <p className="cepp-muted">
            {job.name === "Face Detection - Batch 1"
              ? "ประมวลผลภาพ 24 รูป ด้วยระบบ FHE Face Detection สำเร็จ ข้อมูลผ่านการเข้ารหัสตลอดกระบวนการ"
              : job.status === "Processing"
                ? "กำลังประมวลผลภาพถ่ายทางอากาศจากโดรน ด้วยระบบ Zero Trust Face Detection"
                : "ผลวิเคราะห์วิดีโอ CCTV ด้วย Zero Trust Face Detection"}
          </p>
          <p className="cepp-mono cepp-muted">
            {files ? job.size : job.id} · {job.date} · {job.count} files
          </p>
          <p className="cepp-muted">{job.scope}</p>
        </Panel>
      ))}
    </>
  );
}

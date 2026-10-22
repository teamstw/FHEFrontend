"use client";
import { Shell } from "@/components/layout/page-shell";
import { Badge, Button } from "@/components/ui/cepp";
import { Steps } from "@/features/jobs/components/workflow-steps";
import { DecryptFlow } from "@/features/keys/components/decryption-dialog";
import { useCepp } from "@/hooks/use-cepp";
import { download } from "@/lib/download";
import { type Job } from "@/types/cepp";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function CompletedPage() {
  const { activeJob } = useCepp(),
    router = useRouter(),
    [open, setOpen] = useState(false),
    [done, setDone] = useState(false);
  const job = activeJob || mockJob;
  return (
    <Shell
      title="Completed"
      description="ประมวลผลเสร็จสิ้น"
      section="Processing"
    >
      <Steps step={3} />
      <div className="cepp-result">
        <div
          className="cepp-feature-icon"
          style={{ width: 80, height: 80, fontSize: 40, color: "#009576" }}
        >
          ✓
        </div>
        <h1>ประมวลผลเสร็จสิ้น!</h1>
        <p>
          การตรวจจับใบหน้าบนข้อมูลที่เข้ารหัสเสร็จสมบูรณ์
          ข้อมูลของคุณยังคงปลอดภัยตลอดกระบวนการ
        </p>
        <Badge tone="green">ข้อมูลไม่ถูกถอดรหัสในทุกขั้นตอน</Badge>

        <div className="cepp-row wrap">
          <Button
            onClick={() =>
              done
                ? download(
                    "demo-result-metadata.json",
                    JSON.stringify(job, null, 2),
                  )
                : setOpen(true)
            }
          >
            {done ? "ดาวน์โหลดผลลัพธ์" : "Decrypt"}
          </Button>
          <Button secondary onClick={() => router.push("/my-file")}>
            ดูไฟล์ของฉัน
          </Button>
        </div>
      </div>
      <DecryptFlow
        open={open}
        job={job}
        onClose={() => setOpen(false)}
        onDone={() => setDone(true)}
      />
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

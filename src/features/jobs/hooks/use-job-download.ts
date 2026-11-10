"use client";
import { api, backendEnabled } from "@/lib/api/backend-api";
import { download, downloadFromUrl } from "@/lib/file-download";
import type { Job } from "@/types/job";
import { useRef, useState } from "react";

export function useJobDownload() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const downloadJob = async (job: Job) => {
    if (busy.current) return;
    setError("");
    if (job.decrypted !== true || !job.result) {
      setError("กรุณาถอดรหัสไฟล์ก่อนดาวน์โหลด");
      return;
    }
    busy.current = true;
    setDownloadingId(job.id);
    try {
      if (backendEnabled) {
        const { downloadUrl } = await api.downloadFile(
          job.resultFileId || job.id,
        );
        downloadFromUrl(job.result, downloadUrl);
      } else {
        download(
          "result-" + job.id.replace(/[^a-z0-9_-]/gi, "_") + "-metadata.json",
          JSON.stringify({ ...job, demo: true }, null, 2),
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to download this file. Please try again.",
      );
    } finally {
      busy.current = false;
      setDownloadingId(null);
    }
  };
  return { downloadJob, downloadingId, error };
}

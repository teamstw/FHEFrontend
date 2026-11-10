"use client";
import { useAppState } from "@/hooks/use-app-state";
import { api, ApiError, backendEnabled } from "@/lib/api/backend-api";
import type { Job } from "@/types/job";
import { useEffect, useReducer, useState } from "react";

type JobRequest = {
  id: string;
  job: Job | null;
  loading: boolean;
  error: string;
  notFound: boolean;
};

export function useJobDetails(jobId: string, mockJobs: Job[]) {
  const { model, ready } = useAppState();
  const [revision, refresh] = useReducer((value: number) => value + 1, 0);
  const [request, setRequest] = useState<JobRequest>({
    id: "",
    job: null,
    loading: true,
    error: "",
    notFound: false,
  });

  useEffect(() => {
    if (!backendEnabled) return;
    let cancelled = false;
    setRequest({
      id: jobId,
      job: null,
      loading: true,
      error: "",
      notFound: false,
    });
    api
      .job(jobId)
      .then((job) => {
        if (cancelled) return;
        if (job && job.id !== jobId)
          throw new Error("Job details do not match the requested job.");
        setRequest({
          id: jobId,
          job,
          loading: false,
          error: "",
          notFound: !job,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const notFound = error instanceof ApiError && error.status === 404;
        setRequest({
          id: jobId,
          job: null,
          loading: false,
          notFound,
          error: notFound
            ? ""
            : error instanceof ApiError && [401, 403].includes(error.status)
              ? "คุณไม่มีสิทธิ์ดูงานนี้ กรุณาตรวจสอบบัญชีที่เข้าสู่ระบบ"
              : error instanceof Error
                ? error.message
                : "Unable to load job details",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [jobId, revision]);

  if (backendEnabled) {
    const current = request.id === jobId;
    return {
      job: current ? request.job : null,
      loading: !current || request.loading,
      error: current ? request.error : "",
      notFound: current && request.notFound,
      refresh,
    };
  }
  const job =
    model.jobs.find((item) => item.id === jobId) ||
    mockJobs.find((item) => item.id === jobId) ||
    null;
  return {
    job: ready ? job : null,
    loading: !ready,
    error: "",
    notFound: ready && !job,
    refresh,
  };
}

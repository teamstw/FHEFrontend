"use client";
import { useApiData } from "@/hooks/use-api-data";
import { useJobDownload } from "@/features/jobs/hooks/use-job-download";
import { useAppState } from "@/hooks/use-app-state";
import { api, backendEnabled } from "@/lib/api/backend-api";
import type { Job } from "@/types/job";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function useJobCollection({
  files,
  mockJobs,
}: {
  files: boolean;
  mockJobs: Job[];
}) {
  const store = useAppState(),
    router = useRouter(),
    source = useApiData(files ? api.files : api.jobs, mockJobs);
  const fileDownload = useJobDownload();
  const [tab, setTabState] = useState("All"),
    [search, setSearchState] = useState(""),
    [scope, setScopeState] = useState("All workspaces"),
    [selected, setSelected] = useState<Job | null>(null),
    [decrypt, setDecrypt] = useState(false),
    [view, setView] = useState<Job | null>(null);
  const jobs = (
    backendEnabled
      ? source.data || []
      : [...store.model.jobs, ...(source.data || [])]
  ).filter((j, i, arr) => arr.findIndex((x) => x.id === j.id) === i);
  const filtered = jobs.filter(
    (j) =>
      (!files || j.status === "Completed") &&
      (tab === "All" ||
        j.status === (tab === "In progress" ? "Processing" : "Completed")) &&
      (scope === "All workspaces" ||
        j.scope === scope ||
        j.scope.startsWith(scope + " / ")) &&
      `${j.name} ${j.id} ${j.result}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const clearSelection = () => {
    setSelected(null);
    setDecrypt(false);
    setView(null);
  };
  const setTab = (value: string) => {
    setTabState(value);
    clearSelection();
  };
  const setSearch = (value: string) => {
    setSearchState(value);
    clearSelection();
  };
  const setScope = (value: string) => {
    setScopeState(value);
    clearSelection();
  };
  const startDecrypt = (job: Job) => {
    setSelected(job);
    setDecrypt(true);
  };
  return {
    fileDownload,
    files,
    store,
    router,
    source,
    tab,
    setTab,
    search,
    setSearch,
    scope,
    setScope,
    selected: filtered.find((job) => job.id === selected?.id) ?? null,
    setSelected,
    decrypt,
    setDecrypt,
    view,
    setView,
    jobs,
    filtered,
    startDecrypt,
  };
}
export type JobCollectionState = ReturnType<typeof useJobCollection>;

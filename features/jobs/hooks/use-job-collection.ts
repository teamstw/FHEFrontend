"use client";
import { useData } from "@/hooks/use-api-data";
import { useCepp } from "@/hooks/use-cepp";
import { api } from "@/lib/api/cepp";
import { type Job } from "@/types/cepp";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function useJobCollection({
  files,
  mockJobs,
}: {
  files: boolean;
  mockJobs: Job[];
}) {
  const store = useCepp(),
    router = useRouter(),
    source = useData(files ? api.files : api.jobs, mockJobs);
  const [tab, setTabState] = useState("All"),
    [search, setSearchState] = useState(""),
    [scope, setScopeState] = useState("All workspaces"),
    [selected, setSelected] = useState<Job | null>(null),
    [decrypt, setDecrypt] = useState(false),
    [view, setView] = useState<Job | null>(null),
    [decrypted, setDecrypted] = useState<string[]>([]);
  const jobs = [...store.model.jobs, ...(source.data || [])].filter(
    (j, i, arr) => arr.findIndex((x) => x.id === j.id) === i,
  );
  const filtered = jobs.filter(
    (j) =>
      (tab === "All" ||
        j.status === (tab === "In progress" ? "Processing" : "Completed")) &&
      (scope === "All workspaces" || j.scope.startsWith(scope)) &&
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
    decrypted,
    setDecrypted,
    jobs,
    filtered,
    startDecrypt,
  };
}
export type JobCollectionState = ReturnType<typeof useJobCollection>;

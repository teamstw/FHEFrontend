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
  const [tab, setTab] = useState("All"),
    [search, setSearch] = useState(""),
    [scope, setScope] = useState("All workspaces"),
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
    selected,
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

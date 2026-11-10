"use client";
import type { StoredFile } from "@/types/file-storage";
import { loadStoredAvatar } from "@/lib/avatar-image";
import { api, backendEnabled } from "@/lib/api/backend-api";
import { useSession } from "next-auth/react";
import type { GroupSelection } from "@/types/workspace";
import type { Job } from "@/types/job";
import type { AppState } from "@/types/app-state";
import type { AppStore } from "@/types/app-state";
import {
  createContext,
  startTransition,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
const initial: AppState = {
  storedFiles: [],
  fileFolders: [],
  avatarUrl: "",
  billingSettings: {},
  name: "",
  signedIn: false,
  privacy: false,
  personalLabel: "",
  enterprise: "",
  unread: -1,
  invites: [],
  budget: "",
  threshold: "",
  plan: "",
  audit: [],
  groups: [],
  groupsLoaded: false,
  cardsLoaded: false,
  activeJobId: "",
  keys: [],
  jobs: [],
  cards: [],
};
export const AppStateContext = createContext<AppStore | null>(null);
export function AppStateProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [model, setModel] = useState(initial),
    [ready, setReady] = useState(false),
    [files, setFiles] = useState<File[]>([]),
    [scope, setScopeState] = useState(""),
    [activeJob, setActiveJobState] = useState<Job | null>(null);
  const [sourceFiles, setSourceFiles] = useState<StoredFile[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<GroupSelection[]>([]);
  const setScope = useCallback(
    (nextScope: string) => {
      setScopeState(nextScope);
      if (nextScope !== scope) setSelectedGroups([]);
    },
    [scope],
  );
  const setActiveJob = useCallback((job: Job) => {
    setActiveJobState(job);
    setModel((m) => ({ ...m, activeJobId: job.id }));
  }, []);
  const markJobDecrypted = useCallback((job: Job) => {
    const decryptedJob = { ...job, decrypted: true };
    setModel((current) => ({
      ...current,
      jobs: current.jobs.some((item) => item.id === job.id)
        ? current.jobs.map((item) =>
            item.id === job.id ? { ...item, decrypted: true } : item,
          )
        : [decryptedJob, ...current.jobs],
    }));
    setActiveJobState((current) =>
      current?.id === job.id ? { ...current, decrypted: true } : current,
    );
  }, []);
  useEffect(() => {
    let restored = initial;
    try {
      const data = localStorage.getItem("cepp-ui-v2");
      if (data) restored = { ...initial, ...JSON.parse(data) };
    } catch {}
    // Let streamed page boundaries finish hydrating before applying browser data.
    startTransition(() => {
      setModel({ ...restored, name: "", signedIn: false, avatarUrl: "" });
      setActiveJobState(
        restored.jobs.find((job: Job) => job.id === restored.activeJobId) ||
          null,
      );
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (!ready || status === "loading") return;
    let cancelled = false;
    const account = session?.user?.email || "";
    setModel((m) => ({
      ...m,
      signedIn: status === "authenticated",
      name: session?.user?.name || session?.user?.email || "",
      avatarUrl: !backendEnabled ? loadStoredAvatar(account) : "",
    }));
    if (backendEnabled && status === "authenticated") {
      api
        .profile()
        .then((profile) => {
          if (!cancelled)
            setModel((m) => ({ ...m, avatarUrl: profile.avatarUrl || "" }));
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [ready, status, session]);
  useEffect(() => {
    if (ready && !backendEnabled)
      try {
        localStorage.setItem(
          "cepp-ui-v2",
          JSON.stringify({
            ...model,
            name: "",
            signedIn: false,
            avatarUrl: "",
          }),
        );
      } catch {}
  }, [model, ready]);
  return (
    <AppStateContext.Provider
      value={{
        model,
        update: setModel,
        files,
        setFiles,
        sourceFiles,
        setSourceFiles,
        scope,
        setScope,
        selectedGroups,
        setSelectedGroups,
        activeJob,
        setActiveJob,
        markJobDecrypted,
        ready: ready && status !== "loading",
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

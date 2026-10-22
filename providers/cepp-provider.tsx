"use client";
import { api, backendEnabled } from "@/lib/api/cepp";
import type { Job, Model, Store } from "@/types/cepp";
import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
const initial: Model = {
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
export const CeppContext = createContext<Store | null>(null);
export function CeppProvider({ children }: { children: ReactNode }) {
  const [model, setModel] = useState(initial),
    [ready, setReady] = useState(false),
    [files, setFiles] = useState<File[]>([]),
    [scope, setScope] = useState(""),
    [activeJob, setActiveJobState] = useState<Job | null>(null);
  const setActiveJob = useCallback((job: Job) => {
    setActiveJobState(job);
    setModel((m) => ({ ...m, activeJobId: job.id }));
  }, []);
  useEffect(() => {
    if (backendEnabled) {
      api
        .session()
        .then((session) =>
          setModel((m) => ({ ...m, name: session.name, signedIn: true })),
        )
        .catch(() => {});
      setReady(true);
      return;
    }
    try {
      const data = localStorage.getItem("cepp-ui-v2");
      if (data) {
        const restored = { ...initial, ...JSON.parse(data) };
        setModel(restored);
        setActiveJobState(
          restored.jobs.find((j: Job) => j.id === restored.activeJobId) || null,
        );
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready && !backendEnabled)
      try {
        localStorage.setItem("cepp-ui-v2", JSON.stringify(model));
      } catch {}
  }, [model, ready]);
  return (
    <CeppContext.Provider
      value={{
        model,
        update: setModel,
        files,
        setFiles,
        scope,
        setScope,
        activeJob,
        setActiveJob,
        ready,
      }}
    >
      {children}
    </CeppContext.Provider>
  );
}

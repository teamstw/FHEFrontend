"use client";
import { Shell } from "@/components/layout/page-shell";
import { Icon } from "@/components/ui/brand-icon";
import { Button, Notice, Panel, Select } from "@/components/ui/cepp";
import { Steps } from "@/features/jobs/components/workflow-steps";
import { KeyFlow } from "@/features/keys/components/key-generation-dialog";
import { useData } from "@/hooks/use-api-data";
import { useCepp } from "@/hooks/use-cepp";
import { api, backendEnabled } from "@/lib/api/cepp";
import { type Job, type KeyRecord } from "@/types/cepp";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
export default function UploadPage() {
  const { files, setFiles, scope, setScope, update, setActiveJob } = useCepp(),
    router = useRouter(),
    input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [all, setAll] = useState(false),
    [error, setError] = useState("");
  const workspace = useData(api.workspaces, mockWorkspaces);
  function add(incoming: File[]) {
    const valid = incoming.filter(
      (f) => /\.(jpe?g|png|mp4)$/i.test(f.name) && f.size > 0,
    );
    if (valid.length !== incoming.length)
      setError("รองรับไฟล์ .jpg, .png และ .mp4 ที่ไม่ว่างเท่านั้น");
    else setError("");
    setFiles([
      ...files,
      ...valid.filter(
        (f) =>
          !files.some(
            (old) =>
              old.name === f.name &&
              old.size === f.size &&
              old.lastModified === f.lastModified,
          ),
      ),
    ]);
    if (input.current) input.current.value = "";
  }
  const total = files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024;
  async function start(key: KeyRecord) {
    setBusy(true);
    try {
      let job: Job;
      if (backendEnabled) {
        const form = new FormData();
        files.forEach((f) => form.append("files", f));
        form.append("scope", scope);
        form.append("keyId", key.id);
        form.append("version", String(key.version));
        job = await api.createJob(form);
      } else
        job = {
          id: "LOCAL-" + Date.now(),
          name: "Face Detection - Batch " + new Date().toLocaleTimeString(),
          files: files.map((f) => f.name),
          count: files.length,
          size: total.toFixed(1) + " MB",
          scope,
          keyId: key.id,
          version: key.version,
          status: "Processing",
          date: new Date().toLocaleDateString("en-GB"),
          result: "demo_batch_metadata.json",
          demo: true,
        };
      update((m) => ({ ...m, jobs: [job, ...m.jobs] }));
      setActiveJob(job);
      router.push("/progress");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create job");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Shell
      title={files.length && scope ? "Ready to generate a key" : "Upload"}
      description={
        files.length
          ? "ตรวจสอบไฟล์และพื้นที่ทำงานก่อนเริ่มประมวลผล"
          : "นำเข้าไฟล์เพื่อประมวลผล Face Detection อย่างปลอดภัย"
      }
      section="Upload"
    >
      <Steps step={1} />
      <input
        ref={input}
        hidden
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.mp4"
        onChange={(e) => add(Array.from(e.target.files || []))}
      />
      {files.length === 0 ? (
        <button
          className={"cepp-dropzone " + (drag ? "drag" : "")}
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            add(Array.from(e.dataTransfer.files));
          }}
        >
          <Icon name="upload" size={24} />
          <strong>Drag &amp; Drop ไฟล์ หรือ คลิกเพื่อเลือก</strong>
          <p className="cepp-muted">รองรับไฟล์ภาพ, วิดีโอ (.jpg, .png, .mp4)</p>
        </button>
      ) : (
        <Panel title={`Batch / ${files.length} files`}>
          <div className="cepp-row">
            <p className="cepp-muted">
              JPG / PNG / MP4 · {total.toFixed(1)} MB total
            </p>
            <Button secondary small onClick={() => setFiles([])}>
              Clear all
            </Button>
          </div>
          {files.slice(0, all ? files.length : 3).map((f, i) => (
            <div className="cepp-file-row" key={f.name + i}>
              <Icon name="upload" />
              <div>
                <p>{f.name}</p>
                <small>
                  {f.name.split(".").pop()?.toUpperCase()} ·{" "}
                  {(f.size / 1024 / 1024).toFixed(1)} MB
                </small>
              </div>
              <Button
                secondary
                small
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
              >
                Remove
              </Button>
            </div>
          ))}
          {files.length > 3 && !all && (
            <button className="cepp-muted" onClick={() => setAll(true)}>
              + {files.length - 3} files · View all files
            </button>
          )}
          <div>
            <Button secondary onClick={() => input.current?.click()}>
              Add files
            </Button>
          </div>
        </Panel>
      )}
      {error && (
        <p className="cepp-alert" role="alert">
          {error}
        </p>
      )}
      {workspace.error ? (
        <Notice title="Unable to load workspaces">
          {workspace.error}
          <Button secondary small onClick={() => workspace.refresh()}>
            Retry
          </Button>
        </Notice>
      ) : (
        <Select
          label="Group"
          value={scope}
          onChange={setScope}
          options={[
            {
              value: "",
              label: workspace.loading
                ? "Loading workspaces…"
                : "Choose a group",
            },
            ...(workspace.data || []).map((w) => ({
              value: w.name,
              label: w.name,
            })),
          ]}
        />
      )}
      <p className="cepp-muted">
        Personal เป็นพื้นที่ของคุณคนเดียว · Enterprises มีหลายกลุ่ม
        ให้เลือกกลุ่มก่อนสร้าง Key
      </p>
      {files.length > 0 && scope && (
        <Notice title={`Ready · Batch / ${files.length} files`}>
          Files validated. This job belongs to {scope}. The selected key and
          version will be recorded with the job.
        </Notice>
      )}
      <div className="cepp-row start wrap">
        <Button
          disabled={!files.length || !scope || busy}
          onClick={() => setOpen(true)}
        >
          Generate Key
        </Button>
        {files.length > 0 && scope ? (
          <Button
            secondary
            onClick={() => {
              setFiles([]);
              setScope("");
            }}
          >
            Clear batch
          </Button>
        ) : (
          <span className="cepp-muted">
            Choose a valid file and workspace to continue.
          </span>
        )}
      </div>
      {open && (
        <KeyFlow open={open} onClose={() => setOpen(false)} onReady={start} />
      )}
    </Shell>
  );
}
const mockWorkspaces = [
  { id: "personal", name: "Personal", type: "personal" },
  { id: "group-1", name: "Enterprise A / Group 1", type: "group" },
  { id: "group-2", name: "Enterprise A / Group 2", type: "group" },
  { id: "group-3", name: "Enterprise A / Group 3", type: "group" },
];

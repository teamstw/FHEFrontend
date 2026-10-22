"use client";
import {
  Button,
  Modal,
  Notice,
  Panel,
  Rows,
  Select,
} from "@/components/ui/cepp";
import { useCepp } from "@/hooks/use-cepp";
import { api, backendEnabled } from "@/lib/api/cepp";
import { fingerprint, masked } from "@/lib/keys";
import { type Job } from "@/types/cepp";
import { useRef, useState } from "react";
import { toast } from "sonner";
export function DecryptFlow({
  job,
  open,
  onClose,
  onDone,
}: {
  job: Job;
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const { model } = useCepp(),
    [path, setPath] = useState(""),
    [step, setStep] = useState(0),
    [file, setFile] = useState<File | null>(null),
    [cloud, setCloud] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    input = useRef<HTMLInputElement>(null);
  const original = model.keys.find((k) => k.id === job.keyId);
  const close = () => {
    setStep(0);
    setPath("");
    setFile(null);
    setError("");
    onClose();
  };
  const decrypt = async () => {
    setBusy(true);
    setError("");
    try {
      if (backendEnabled) {
        const form = new FormData();
        if (file) form.append("file", file);
        form.append("keyId", cloud);
        form.append("version", String(job.version));
        const result = await api.decrypt(job.id, form);
        window.location.assign(result.downloadUrl);
        onDone();
        close();
        return;
      }
      if (!original || !original.fingerprint)
        throw new Error(
          "This Figma fixture has no real key or result. Upload a new batch to test the local demo flow.",
        );
      if (original.revoked) throw new Error("This key has been revoked.");
      if (path === "cloud") {
        if (cloud !== job.keyId || original.scope !== job.scope)
          throw new Error(
            "The key, version and workspace must match this job.",
          );
      } else if (!file || (await fingerprint(file)) !== original.fingerprint)
        throw new Error(
          "The file does not match the original job key. Select the matching backup.",
        );
      if (job.version !== original.version && path !== "cloud")
        throw new Error("The key version does not match this job.");
      toast.success("Key validated.");
      onDone();
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to decrypt");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={close}
      title={
        step === 0
          ? "Enter Secret key to decrypt"
          : path === "cloud"
            ? "Decrypt · Cloud KMS"
            : "Decrypt · Local Storage / BYOK"
      }
      eyebrow="Decryption / CEPP"
      description={
        step === 0
          ? "เลือก Key ที่ตรงกับงานเพื่อถอดรหัส · เลือกวิธีเดียว"
          : "ระบบตรวจสอบ Key ก่อนถอดรหัส · ไม่แสดงค่าลับ"
      }
      wide={step === 0}
    >
      <Panel>
        <strong>
          {job.name} / {job.count} files
        </strong>
        <p className="cepp-muted">
          {job.scope} · {job.id}
        </p>
      </Panel>
      {step === 0 ? (
        <>
          {[
            [
              "file",
              "Upload key · Local Storage / BYOK",
              "Upload the original .txt key backup from your device. Local Storage and BYOK share this path.",
            ],
            [
              "cloud",
              "Select Cloud KMS key",
              "Choose an authorized key from the job’s workspace inventory. No file upload is required.",
            ],
          ].map(([value, title, desc]) => (
            <button
              key={value}
              className={"cepp-choice " + (path === value ? "selected" : "")}
              onClick={() => setPath(value)}
            >
              <div className="cepp-row">
                <strong>{title}</strong>
                <span>{path === value ? "◉" : "○"}</span>
              </div>
              <p>{desc}</p>
            </button>
          ))}
          <Notice title="Job + version + workspace must match">
            A different key, version, or workspace is rejected. You do not need
            to paste a raw secret.
          </Notice>
        </>
      ) : (
        <>
          {path === "file" ? (
            <>
              <input
                ref={input}
                hidden
                type="file"
                accept=".txt"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setError("");
                }}
              />
              <button
                className="cepp-dropzone"
                onClick={() => input.current?.click()}
              >
                <strong>{file?.name || "Upload original key_sec.txt"}</strong>
                <p className="cepp-muted">TXT · secret concealed</p>
              </button>
              {file && (
                <Button
                  secondary
                  onClick={() => {
                    setFile(null);
                    if (input.current) input.current.value = "";
                  }}
                >
                  Replace / remove
                </Button>
              )}
            </>
          ) : (
            <Select
              label="Key inventory scope"
              value={cloud}
              onChange={(v) => {
                setCloud(v);
                setError("");
              }}
              options={[
                { value: "", label: "Select a cloud key and original version" },
                ...model.keys
                  .filter(
                    (k) =>
                      k.method === "Cloud KMS" &&
                      k.scope === job.scope &&
                      !k.revoked,
                  )
                  .map((k) => ({
                    value: k.id,
                    label: `${k.name} / v${job.version} · ${masked(k)}`,
                  })),
              ]}
            />
          )}
          <Panel title="Validation">
            <Rows
              rows={[
                ["Job", job.id],
                ["Key / version", `${job.keyId} / v${job.version}`],
                ["Workspace", job.scope],
              ]}
            />
          </Panel>
          <Notice title="Only the original key works">
            Invalid format, a mismatched fingerprint/version, or another
            workspace blocks decryption.
          </Notice>
        </>
      )}
      {error && (
        <p role="alert" className="cepp-alert">
          {error}
        </p>
      )}
      <div className="cepp-row">
        <Button secondary onClick={close}>
          Cancel
        </Button>
        {step === 0 ? (
          <Button disabled={!path} onClick={() => setStep(1)}>
            Continue
          </Button>
        ) : (
          <Button
            disabled={busy || (path === "file" ? !file : !cloud)}
            onClick={decrypt}
          >
            {busy ? "Validating…" : "Decrypt"}
          </Button>
        )}
      </div>
    </Modal>
  );
}

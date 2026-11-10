"use client";
import { useAuthorization } from "@/hooks/use-authorization";
import { canManageRole } from "@/lib/authorization";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "@/components/ui/text-field";
import { Modal } from "@/components/ui/modal";
import { Notice } from "@/components/ui/notice";
import { Panel } from "@/components/ui/panel";
import { DetailRows } from "@/components/ui/detail-rows";
import { Select } from "@/components/ui/select";
import { useAppState } from "@/hooks/use-app-state";
import { api, backendEnabled } from "@/lib/api/backend-api";
import { download } from "@/lib/file-download";
import { fingerprint, masked } from "@/lib/key-metadata";
import type { GroupSelection } from "@/types/workspace";
import type { KeyMethod } from "@/types/key";
import type { KeyRecord } from "@/types/key";
import { useRef, useState } from "react";
import { toast } from "sonner";
export function KeyGenerationDialog({
  open,
  onClose,
  onReady,
  register = false,
  groups = [],
  fixtureWorkspaces = [],
  fixtureGroups = [],
}: {
  open: boolean;
  onClose: () => void;
  onReady: (k: KeyRecord) => void;
  register?: boolean;
  groups?: GroupSelection[];
  fixtureWorkspaces?: import("@/types/workspace").WorkspaceOption[];
  fixtureGroups?: import("@/types/workspace").Group[];
}) {
  const { scope, files, sourceFiles, model, update } = useAppState(),
    [method, setMethod] = useState<KeyMethod | null>(register ? "BYOK" : null),
    [step, setStep] = useState(register ? 1 : 0),
    [name, setName] = useState(""),
    [ack, setAck] = useState(false),
    [backup, setBackup] = useState(false),
    [key, setKey] = useState<KeyRecord | null>(null),
    [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    [existing, setExisting] = useState("");
  const input = useRef<HTMLInputElement>(null),
    secret = useRef("");
  const batchFileCount = files.length + sourceFiles.length;
  const selectedScope = scope || "Enterprise A / Group 1";
  const authorization = useAuthorization({
    groups: fixtureGroups,
    workspaces: fixtureWorkspaces,
  });
  const canManage =
    authorization.canManage(selectedScope) &&
    groups.every((selected) =>
      canManageRole(
        authorization.groups.find(
          (group) =>
            group.id === selected.id && group.enterpriseName === selectedScope,
        )?.role,
      ),
    );
  const keys = model.keys.filter(
    (k) => k.method === "Cloud KMS" && k.scope === selectedScope && !k.revoked,
  );
  const reset = () => {
    setStep(0);
    setMethod(null);
    setKey(null);
    setAck(false);
    setBackup(false);
    setName("");
    setFile(null);
    secret.current = "";
    onClose();
  };
  const create = async () => {
    if (!canManage) return;
    if (!name.trim()) {
      toast.error("Enter a key name");
      return;
    }
    if (method === "BYOK" && (!file || !ack)) {
      toast.error("Select a .txt key file and acknowledge registration");
      return;
    }
    setBusy(true);
    try {
      let record: KeyRecord;
      if (backendEnabled) {
        const form = new FormData();
        form.append("name", name);
        form.append("method", method!);
        form.append("scope", selectedScope);
        if (groups.length)
          form.append(
            "groupIds",
            JSON.stringify(groups.map((group) => group.id)),
          );
        if (file) form.append("file", file);
        record = await api.createKey(form);
      } else {
        const id =
          (method === "Local Storage"
            ? "loc"
            : method === "Cloud KMS"
              ? "kms"
              : "byok") +
          "_" +
          crypto.randomUUID().replaceAll("-", "").slice(-8).toUpperCase();
        secret.current = JSON.stringify({
          demo: true,
          keyId: id,
          scope: selectedScope,
          version: 1,
          token: crypto.randomUUID(),
        });
        record = {
          id,
          name: name.trim(),
          method: method!,
          version: 1,
          scope: selectedScope,
          ...(groups.length
            ? {
                groupIds: groups.map((group) => group.id),
                groupNames: groups.map((group) => group.name),
              }
            : {}),
          fingerprint:
            method === "BYOK" && file
              ? await fingerprint(file)
              : await fingerprint(new File([secret.current], "key_sec.txt")),
        };
      }
      setKey(record);
      update((m) => ({ ...m, keys: [...m.keys, record] }));
      setStep(3);
      setAck(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to create key");
    } finally {
      setBusy(false);
    }
  };
  const exportBackup = () => {
    if (backendEnabled) {
      toast.info(
        "Connect the authorized key-backup endpoint before exporting a real key.",
      );
      return;
    }
    download("key_sec.txt", secret.current, "text/plain");
    setBackup(true);
  };
  const canFinish =
    method === "Local Storage"
      ? step === 4 && ack
      : method === "BYOK"
        ? ack
        : true;
  const finish = () => {
    if (!canManage || !key || !canFinish) return;
    onReady(key);
    reset();
  };
  const heading =
    step === 0
      ? "Choose a key storage method"
      : method === "Local Storage"
        ? [
            "",
            "Local Storage",
            "Local Storage · Name your key",
            "Local Storage · Key generated",
            "Local Storage · Backup acknowledged",
          ][step]
        : method === "BYOK"
          ? step === 3
            ? "BYOK · Key registered"
            : "BYOK · Upload your existing key"
          : [
              "",
              "Cloud KMS",
              "Cloud KMS · Name your key",
              "Cloud KMS · Key created",
            ][step];
  return (
    <Modal
      open={open && canManage}
      onClose={reset}
      title={heading || "Choose a key storage method"}
      eyebrow="Key generation / CEPP"
      description={
        step === 0
          ? "เลือกวิธีการจัดเก็บ Key · ใครเป็นผู้เก็บ และต้องใช้อะไรเพื่อถอดรหัส"
          : step === 3
            ? "สร้างและจัดเก็บ Key สำเร็จ"
            : "จัดเก็บ Key สำหรับพื้นที่ทำงานที่เลือก"
      }
      wide={step === 0}
    >
      <Panel>
        <strong className="cepp-mono">
          {batchFileCount
            ? `Batch / ${batchFileCount} files`
            : "Batch 1 / 24 images"}
        </strong>
        <p className="cepp-muted">{selectedScope}</p>
        {groups.length > 0 && (
          <p className="cepp-muted">
            Groups: {groups.map((group) => group.name).join(", ")}
          </p>
        )}
      </Panel>
      {step === 0 ? (
        <>
          {methods.map((item) => (
            <button
              key={item.name}
              className={
                "cepp-choice " + (method === item.name ? "selected" : "")
              }
              onClick={() => setMethod(item.name)}
            >
              <div className="cepp-row">
                <img
                  alt=""
                  src={"/figma/" + methodIcons[item.name].file}
                  width={methodIcons[item.name].width}
                  height={methodIcons[item.name].height}
                />
                <strong style={{ flex: 1 }}>
                  {item.name === "BYOK"
                    ? "BYOK · Bring your own key"
                    : item.name}
                </strong>
                <span>{method === item.name ? "◉" : "○"}</span>
              </div>
              <p>{item.description}</p>
              <span>{item.decrypt}</span>
            </button>
          ))}
          <Notice title="System context">
            GCP KMS protects the system with a non-exportable KEK. Key backups
            refer to job keys, not a downloadable GCP KEK.
          </Notice>
          <div className="cepp-row">
            <Button secondary onClick={reset}>
              Cancel
            </Button>
            <Button
              disabled={!method}
              onClick={() => {
                setStep(1);
                setAck(false);
              }}
            >
              Continue
            </Button>
          </div>
        </>
      ) : (
        <>
          {step === 1 && method !== "BYOK" && (
            <>
              <button className="cepp-choice selected">
                <strong>{method}</strong>
                <p>{methods.find((m) => m.name === method)?.description}</p>
                <span>{methods.find((m) => m.name === method)?.decrypt}</span>
              </button>
              {method === "Cloud KMS" && keys.length > 0 && (
                <Select
                  label="Select existing key"
                  value={existing}
                  onChange={setExisting}
                  options={[
                    { value: "", label: "Generate a new cloud key" },
                    ...keys.map((k) => ({
                      value: k.id,
                      label: `${k.name} / v${k.version}`,
                    })),
                  ]}
                />
              )}
              <DetailRows
                rows={[
                  [
                    "Custody",
                    method === "Local Storage"
                      ? "Your device"
                      : "Server-managed IPFS key storage",
                  ],
                  ["Access scope", selectedScope],
                ]}
              />
              <Notice
                title={
                  method === "Local Storage"
                    ? "Keep your device and backup"
                    : "Protected system key"
                }
                warning={method === "Local Storage"}
              >
                {method === "Local Storage"
                  ? "หากอุปกรณ์หรือ Key สูญหาย ระบบไม่รับประกันการกู้คืน Save a backup before processing."
                  : "The GCP KMS KEK is non-exportable. Workspace authorization is required to select cloud job keys."}
              </Notice>
            </>
          )}
          {(step === 2 || (method === "BYOK" && step === 1)) && (
            <>
              {method === "BYOK" && (
                <>
                  <input
                    ref={input}
                    type="file"
                    accept=".txt"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && !f.name.toLowerCase().endsWith(".txt")) {
                        toast.error("Choose a .txt key file");
                        return;
                      }
                      setFile(f || null);
                    }}
                  />
                  <button
                    className="cepp-dropzone"
                    onClick={() => input.current?.click()}
                  >
                    <strong>
                      {file ? file.name : "Upload original .txt key"}
                    </strong>
                    <small>
                      {file
                        ? `${file.size} bytes · secret concealed`
                        : "Click to choose a file"}
                    </small>
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
              )}
              <TextField
                label="Key name / ชื่อ Key"
                placeholder={method === "BYOK" ? "Partner key" : "Key 1"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                hint="A descriptive name helps identify the correct backup. Names are not secrets."
              />
              <TextField
                label="Workspace scope"
                value={selectedScope}
                readOnly
              />
              <Notice
                title={
                  method === "BYOK"
                    ? "Keep the SAME original key"
                    : method === "Local Storage"
                      ? "Local custody"
                      : "Server IPFS storage"
                }
              >
                {method === "BYOK"
                  ? "Later decryption requires the SAME original .txt key file. A replacement key or a different version cannot decrypt this job."
                  : method === "Local Storage"
                    ? "The job key stays on this device. The server retains metadata only; you are responsible for its backup."
                    : "The selected key ID and version will be linked to this batch."}
              </Notice>
              {method === "BYOK" && (
                <Checkbox checked={ack} onChange={setAck}>
                  I am authorized to use this key and acknowledge server
                  registration/storage.
                </Checkbox>
              )}
            </>
          )}
          {step >= 3 && key && (
            <>
              <Panel title={key.name}>
                <DetailRows
                  rows={[
                    ["Key ID / version", `${masked(key)} / v${key.version}`],
                    ["Workspace", key.scope],
                    ["Created by", model.name || "Test User"],
                    ["Private key", "Concealed · never displayed"],
                    ...(method === "Cloud KMS"
                      ? [
                          ["Storage", "Server IPFS · job-key metadata"] as [
                            string,
                            string,
                          ],
                        ]
                      : []),
                  ]}
                />
              </Panel>
              {method === "Local Storage" ? (
                step === 3 ? (
                  <>
                    <Notice title="Download a private backup">
                      Your private key is concealed. Download key_sec.txt and
                      keep it offline in a secure location. This is the job key,
                      not the GCP KMS KEK.
                    </Notice>
                    <Button secondary onClick={exportBackup}>
                      Download key backup
                    </Button>
                  </>
                ) : (
                  <>
                    <Checkbox checked={ack} onChange={setAck}>
                      I have saved key_sec.txt in a secure location.
                    </Checkbox>
                    <Notice title="Retain this device and key" warning>
                      Losing both may make your past results inaccessible;
                      server metadata cannot restore the secret.
                    </Notice>
                  </>
                )
              ) : method === "BYOK" ? (
                <>
                  <Notice title="Retain your original backup">
                    To decrypt this batch, upload the SAME original key file
                    matching this key and version.
                  </Notice>
                  <Checkbox checked={ack} onChange={setAck}>
                    I have retained the original key and understand the
                    decryption requirement.
                  </Checkbox>
                </>
              ) : (
                <Notice title="No key-file upload needed">
                  For decryption, select {key.name} / v{key.version} in{" "}
                  {key.scope}. The GCP KMS KEK remains non-exportable.
                </Notice>
              )}
            </>
          )}

          <div className="cepp-row">
            <Button
              secondary
              onClick={() => {
                setStep(Math.max(0, step - 1));
                setAck(false);
              }}
            >
              {step === 1 ? "Change method" : "Back"}
            </Button>
            {step === 1 && method !== "BYOK" ? (
              <Button
                onClick={() => {
                  if (existing) {
                    const k = keys.find((k) => k.id === existing);
                    if (k) {
                      setKey(k);
                      setStep(3);
                    }
                  } else setStep(2);
                }}
              >
                Continue
              </Button>
            ) : step === 2 || (method === "BYOK" && step === 1) ? (
              <Button
                disabled={
                  busy || !name.trim() || (method === "BYOK" && (!file || !ack))
                }
                onClick={create}
              >
                {busy
                  ? "Creating…"
                  : method === "BYOK"
                    ? "Register key"
                    : method === "Local Storage"
                      ? "Generate local key"
                      : "Create cloud key"}
              </Button>
            ) : method === "Local Storage" && step === 3 ? (
              <Button disabled={!backup} onClick={() => setStep(4)}>
                Continue
              </Button>
            ) : (
              <Button disabled={!canFinish} onClick={finish}>
                Start processing
              </Button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
const methodIcons: Record<
  KeyMethod,
  { file: string; width: number; height: number }
> = {
  "Local Storage": { file: "1167b.svg", width: 19.75, height: 19.7501 },
  "Cloud KMS": { file: "49bcd.svg", width: 20, height: 20 },
  BYOK: { file: "448cc.svg", width: 18.6654, height: 18.6651 },
};
const methods: { name: KeyMethod; description: string; decrypt: string }[] = [
  {
    name: "Local Storage",
    description:
      "KMS generates the job key. It is stored locally on your device; the server keeps metadata only.",
    decrypt: "To decrypt: this device or the matching downloaded key backup.",
  },
  {
    name: "Cloud KMS",
    description:
      "KMS generates the job key. It is saved to server-managed IPFS key storage.",
    decrypt:
      "To decrypt: select the matching cloud key and version in this workspace.",
  },
  {
    name: "BYOK",
    description:
      "Import an existing .txt key. The server registers and stores that key.",
    decrypt: "To decrypt: upload the SAME original key file used for this job.",
  },
];

"use client";
import { Shell } from "@/components/layout/page-shell";
import {
  Badge,
  Button,
  Check,
  Modal,
  Notice,
  Panel,
  Rows,
  Select,
  Tabs,
  saved,
} from "@/components/ui/cepp";
import { KeyFlow } from "@/features/keys/components/key-generation-dialog";
import { useData } from "@/hooks/use-api-data";
import { useCepp } from "@/hooks/use-cepp";
import { api, backendEnabled } from "@/lib/api/cepp";
import { fingerprint, masked } from "@/lib/keys";
import { type KeyRecord } from "@/types/cepp";
import { useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
export default function KeysPage() {
  const { model, update, setScope } = useCepp(),
    params = useSearchParams(),
    [scope, chooseScope] = useState(
      params.get("scope") || "Enterprise A / Group 1",
    ),
    [tab, setTab] = useState("All types"),
    [open, setOpen] = useState(false),
    [byok, setByok] = useState(false),
    [confirm, setConfirm] = useState<KeyRecord | null>(null),
    [record, setRecord] = useState(true),
    [backup, setBackup] = useState(true),
    [reminder, setReminder] = useState(
      "Every 90 days — next review 31 May 2026",
    ),
    [restored, setRestored] = useState(false),
    file = useRef<HTMLInputElement>(null);
  const load = useCallback(() => api.keys(scope), [scope]),
    source = useData(load, mockKeys),
    keys = [...model.keys, ...(source.data || [])]
      .filter((k, i, a) => a.findIndex((x) => x.id === k.id) === i)
      .filter((k) => k.scope === scope),
    filtered = keys.filter((k) => tab === "All types" || k.method === tab);
  const cloud = keys.find((k) => k.method === "Cloud KMS"),
    local = keys.find((k) => k.method === "Local Storage"),
    partner = keys.find((k) => k.method === "BYOK");
  const change = async (k: KeyRecord, action: string) => {
    try {
      let next: KeyRecord;
      if (backendEnabled) next = await api.keyAction(k.id, action);
      else
        next = {
          ...k,
          ...(action === "rotate"
            ? { version: k.version + 1 }
            : action === "revoke"
              ? { revoked: true }
              : { version: 1 }),
        };
      update((m) => ({
        ...m,
        keys: [...m.keys.filter((x) => x.id !== k.id), next],
      }));
      saved();
    } catch {
      toast.error("Unable to update key");
    }
  };
  return (
    <Shell
      title="Key Management"
      description="จัดการ Key และเวอร์ชันตามพื้นที่ทำงาน · ไม่แสดงค่าลับ"
      section="Workspace"
      wide
    >
      <div className="cepp-row wrap">
        <div style={{ flex: 1, minWidth: 220 }}>
          <Select
            label="Workspace scope"
            value={scope}
            onChange={chooseScope}
            options={[
              "Enterprise A / Group 1",
              "Enterprise A / Group 3",
              "Personal",
            ]}
          />
        </div>
        <Badge tone="green">Owner · privileged actions enabled</Badge>
        <Button
          onClick={() => {
            setScope(scope);
            setByok(false);
            setOpen(true);
          }}
        >
          Generate key
        </Button>
        <Button
          secondary
          onClick={() => {
            setScope(scope);
            setByok(true);
            setOpen(true);
          }}
        >
          Register BYOK
        </Button>
      </div>
      <Tabs
        items={["All types", "Local Storage", "Cloud KMS", "BYOK"]}
        value={tab}
        onChange={setTab}
      />
      {source.error && <p className="cepp-alert">{source.error}</p>}
      <Panel title="Workspace key inventory">
        <div className="cepp-table-wrap">
          <table className="cepp-table">
            <thead>
              <tr>
                {[
                  "Name / type",
                  "Masked ID",
                  "Active version",
                  "Created",
                  "Last rotation",
                  "Custody / access",
                ].map((v) => (
                  <th key={v}>{v}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((k) => (
                <tr key={k.id}>
                  <td>
                    {k.name}
                    <br />
                    <Badge>{k.method}</Badge>
                  </td>
                  <td>{masked(k)}</td>
                  <td>
                    v{k.version} · {k.revoked ? "Revoked" : "Active"}
                  </td>
                  <td>28 Feb 2026</td>
                  <td>{k.version > 1 ? "2 Mar 2026" : "Not rotated"}</td>
                  <td>
                    {k.method === "Local Storage"
                      ? "Test User’s device · metadata only"
                      : k.method === "Cloud KMS"
                        ? "Server IPFS · v1 retained for past jobs"
                        : "Server registered/stored · original file required"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="cepp-muted">
            No keys in this scope. Generate a key or register BYOK.
          </p>
        )}
        <p className="cepp-muted">
          Members can view permitted metadata. Only workspace Owner/Admin may
          generate/register, rotate, revoke or set active versions. Access to a
          local secret is separate.
        </p>
      </Panel>
      <div className="cepp-grid">
        <Panel title="Local key · backup and restore">
          <Rows
            rows={[
              [
                "Selected key",
                local
                  ? `${masked(local)} / v${local.version} · ${local.name}`
                  : "No local key",
              ],
              ["Storage", "Local device · server metadata only"],
              [
                "Backup",
                restored
                  ? "Matching backup validated"
                  : "Acknowledged · key_sec.txt · 28 Feb 2026",
              ],
            ]}
          />
          <div className="cepp-row start wrap">
            <Button
              secondary
              onClick={() =>
                toast.info(
                  "The secret is not available in this browser. Use the original downloaded backup. No secret is reconstructed from metadata.",
                )
              }
            >
              Export key backup
            </Button>
            <Button secondary onClick={() => file.current?.click()}>
              Import backup / restore
            </Button>
            <input
              type="file"
              hidden
              ref={file}
              accept=".txt"
              onChange={async (e) => {
                const selected = e.target.files?.[0];
                if (!selected) return;
                try {
                  if (
                    !local?.fingerprint ||
                    (await fingerprint(selected)) !== local.fingerprint
                  ) {
                    toast.error(
                      "No matching local key fingerprint. Choose the original backup.",
                    );
                    return;
                  }
                  setRestored(true);
                  toast.success("Matching demo backup validated");
                } catch {
                  toast.error("Unable to read backup");
                } finally {
                  e.target.value = "";
                }
              }}
            />
          </div>
          <Notice title="No automatic recovery guarantee" warning>
            Export requires the local key to be available. Restore requires its
            matching backup. Metadata on the server cannot recreate a lost local
            secret.
          </Notice>
        </Panel>
        <Panel title="Who has local access">
          <div className="cepp-member">
            <span className="cepp-avatar">TU</span>
            <div>
              <strong>{model.name || "Test User"}</strong>
              <p className="cepp-muted">Current browser / device</p>
            </div>
            <Badge>Local custodian</Badge>
          </div>
          <p className="cepp-muted">
            Pim Suri · Group Admin · no local key on this device
          </p>
          <p className="cepp-muted">
            Narin Chai and Arun Kiet · Members · no local access recorded
          </p>
          <Notice title="Metadata is not proof of possession">
            Access records cannot guarantee that a user still holds a backup. A
            matching key must be supplied at decryption.
          </Notice>
        </Panel>
      </div>
      {cloud && (
        <Panel title="Cloud Key 1 · version history">
          <Rows
            rows={[["Key ID / storage", masked(cloud) + " · server IPFS"]]}
          />
          <div className="cepp-row wrap">
            <div className="cepp-row">
              <Badge tone="green">
                v{cloud.version} · {cloud.revoked ? "Revoked" : "Active"}
              </Badge>
              <span className="cepp-muted cepp-mono">
                2 Mar 2026 · rotated by Test User
              </span>
            </div>
            <Button
              secondary
              disabled={cloud.revoked}
              onClick={() => change(cloud, "rotate")}
            >
              Rotate key
            </Button>
          </div>
          <div className="cepp-row wrap">
            <div className="cepp-row">
              <Badge>v1 · Retained</Badge>
              <span className="cepp-muted cepp-mono">
                28 Feb 2026 · original Batch 1 version
              </span>
            </div>
            <div className="cepp-row wrap">
              <Button
                secondary
                small
                onClick={() => change(cloud, "activate-v1")}
              >
                Set active v1
              </Button>
              <Button danger secondary small onClick={() => setConfirm(cloud)}>
                Revoke v1
              </Button>
            </div>
          </div>
          <Rows
            rows={[["Job binding", "Batch 1 / 24 images · v1 · ORD-2026-001"]]}
          />
          <p className="cepp-muted">
            Changing the active version affects new jobs only. Past jobs remain
            bound to their original key version. The non-exportable GCP KEK is
            never offered for download.
          </p>
          <Notice title="Revocation can affect past jobs" warning>
            Revoking or deleting a required version may make older results
            impossible to decrypt. Review dependent jobs and retain necessary
            backups before revocation.
          </Notice>
        </Panel>
      )}
      <div className="cepp-grid">
        <Panel title="BYOK · registration and continuity">
          <Rows
            rows={[
              [
                "Registered key",
                partner
                  ? `${partner.name} · ${masked(partner)} / v${partner.version}`
                  : "No BYOK key",
              ],
              ["Registered by", "Test User · 28 Feb 2026"],
            ]}
          />
          <p className="cepp-muted">
            The server registers/stores the imported key. Decryption still
            requires the SAME original key file, not a newly generated
            replacement.
          </p>
          <div className="cepp-row wrap">
            <Button
              secondary
              onClick={() => {
                setScope(scope);
                setByok(true);
                setOpen(true);
              }}
            >
              Register replacement version
            </Button>
            <Button
              secondary
              onClick={() =>
                toast.info(
                  partner
                    ? `${partner.name} / v${partner.version} · ${masked(partner)}`
                    : "No BYOK key registered",
                )
              }
            >
              View version history
            </Button>
          </div>
        </Panel>
        <Panel title="Workspace key policy">
          <Check checked={record} onChange={setRecord}>
            Record the exact key version on every job
          </Check>
          <Check checked={backup} onChange={setBackup}>
            Require backup acknowledgment for Local Storage
          </Check>
          <Select
            label="Rotation reminder"
            value={reminder}
            onChange={setReminder}
            options={[
              "Every 30 days",
              "Every 90 days — next review 31 May 2026",
              "Every 180 days",
            ]}
          />
          <div>
            <Button
              onClick={() =>
                backendEnabled
                  ? toast.info("Connect workspace key-policy endpoint")
                  : saved()
              }
            >
              Save policy
            </Button>
          </div>
        </Panel>
      </div>
      {open && (
        <KeyFlow
          register={byok}
          open={open}
          onClose={() => setOpen(false)}
          onReady={() => {
            setOpen(false);
            saved();
          }}
        />
      )}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Revoke original key version?"
        description="Older results may become impossible to decrypt."
      >
        <Notice title="Review dependent jobs first" warning>
          Batch 1 remains bound to v1. This preview changes only local metadata.
        </Notice>
        <div className="cepp-row">
          <Button secondary onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            danger
            onClick={() => {
              if (confirm) void change(confirm, "revoke");
              setConfirm(null);
            }}
          >
            Revoke v1
          </Button>
        </div>
      </Modal>
    </Shell>
  );
}
const mockKeys: KeyRecord[] = [
  {
    id: "loc_7A2F",
    name: "Key 1",
    method: "Local Storage",
    version: 1,
    scope: "Enterprise A / Group 1",
  },
  {
    id: "kms_8C91",
    name: "Key 1",
    method: "Cloud KMS",
    version: 2,
    scope: "Enterprise A / Group 1",
  },
  {
    id: "byok_9E40",
    name: "Partner key",
    method: "BYOK",
    version: 1,
    scope: "Enterprise A / Group 1",
  },
  {
    id: "loc_4B10",
    name: "Personal local",
    method: "Local Storage",
    version: 1,
    scope: "Personal",
  },
  {
    id: "kms_6D02",
    name: "Personal cloud",
    method: "Cloud KMS",
    version: 1,
    scope: "Personal",
  },
];

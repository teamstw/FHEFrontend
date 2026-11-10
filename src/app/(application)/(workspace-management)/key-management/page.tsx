"use client";
import { useAuthorization } from "@/hooks/use-authorization";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { KeyDetailsDialog } from "@/features/keys/components/key-details-dialog";
import { applyLocalKeyAction } from "@/lib/local-key-actions";
import { Notice } from "@/components/ui/notice";
import { Panel } from "@/components/ui/panel";
import { DetailRows } from "@/components/ui/detail-rows";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { notifySaved } from "@/lib/save-feedback";
import { KeyGenerationDialog } from "@/features/keys/components/key-generation-dialog";
import { useApiData } from "@/hooks/use-api-data";
import { useAppState } from "@/hooks/use-app-state";
import { api, backendEnabled } from "@/lib/api/backend-api";
import { masked } from "@/lib/key-metadata";
import type { KeyRecord } from "@/types/key";
import { useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
export default function KeyManagementPage() {
  const { model, update, setScope } = useAppState(),
    params = useSearchParams(),
    [scope, chooseScope] = useState(
      params.get("scope") || "Enterprise A / Group 1",
    ),
    [tab, setTab] = useState("All types"),
    [open, setOpen] = useState(false),
    [byok, setByok] = useState(false),
    [selectedId, setSelectedId] = useState<string | null>(null),
    [record, setRecord] = useState(true),
    [backup, setBackup] = useState(true),
    [reminder, setReminder] = useState(
      "Every 90 days — next review 31 May 2026",
    );
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const authorization = useAuthorization({
    groups: mockGroups,
    workspaces: mockWorkspaces,
  });
  const canManage = authorization.canManage(scope);
  const role = authorization.role(scope);
  const load = useCallback(() => api.keys(scope), [scope]),
    source = useApiData(load, mockKeys),
    keys = (
      backendEnabled
        ? source.data || []
        : [...model.keys, ...(source.data || [])]
    )
      .filter((k, i, a) => a.findIndex((x) => x.id === k.id) === i)
      .filter((k) => k.scope === scope),
    filtered = keys.filter((k) => tab === "All types" || k.method === tab);
  const selectedKey = keys.find((key) => key.id === selectedId) || null;
  const change = async (key: KeyRecord, action: string, version?: number) => {
    if (!canManage || key.scope !== scope)
      throw new Error("Only Owner or Admin of this workspace can manage keys");
    const next = backendEnabled
      ? await api.keyAction(key.id, action, version)
      : applyLocalKeyAction(key, action, version);
    if (!next || next.id !== key.id || next.scope !== key.scope)
      throw new Error("Unable to confirm the updated key");
    if (backendEnabled) {
      if (scopeRef.current === key.scope)
        source.setData((current) =>
          current.map((item) => (item.id === next.id ? next : item)),
        );
    } else
      update((current) => ({
        ...current,
        keys: [...current.keys.filter((item) => item.id !== key.id), next],
      }));
    notifySaved();
  };
  return (
    <PageShell
      title="Key Management"
      description="จัดการ Key และเวอร์ชันตามพื้นที่ทำงาน · ไม่แสดงค่าลับ"
      section="Workspace"
      wide
    >
      <div className="cepp-row wrap cepp-key-toolbar">
        <div style={{ flex: 1, minWidth: 220 }}>
          <Select
            label="Workspace scope"
            value={scope}
            onChange={(next) => {
              chooseScope(next);
              setOpen(false);
              setSelectedId(null);
            }}
            options={Array.from(
              new Set([
                scope,
                "Personal",
                ...authorization.workspaces
                  .filter((w) => w.type === "enterprise")
                  .map((w) => w.name),
                ...authorization.groups.map((g) =>
                  g.enterpriseName
                    ? g.enterpriseName + " / " + g.name
                    : "Independent / " + g.name,
                ),
              ]),
            )}
          />
        </div>
        <div className="cepp-key-actions">
          <Badge tone={canManage ? "green" : "cyan"}>
            {role || "Access unavailable"}
            {canManage ? " · privileged actions enabled" : " · view only"}
          </Badge>
          {canManage && (
            <>
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
            </>
          )}
        </div>
      </div>
      <Tabs
        items={["All types", "Local Storage", "Cloud KMS", "BYOK"]}
        value={tab}
        onChange={setTab}
      />
      {source.error && <p className="cepp-alert">{source.error}</p>}
      <Panel title="Workspace key inventory">
        <div className="cepp-table-wrap">
          <table className="cepp-table cepp-key-table">
            <thead>
              <tr>
                {[
                  "Name / type",
                  "Masked ID",
                  "Active version",
                  "Created",
                  "Last rotation",
                  "Custody / access",
                  "Actions",
                ].map((v) => (
                  <th key={v}>{v}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((k) => (
                <tr key={k.id}>
                  <td>
                    <div className="cepp-key-identity">
                      <span className="cepp-key-name">{k.name}</span>
                      <Badge>{k.method}</Badge>
                    </div>
                  </td>
                  <td>{masked(k)}</td>
                  <td>
                    v{k.version} · {k.revoked ? "Revoked" : "Active"}
                  </td>
                  <td>{k.createdAt || "—"}</td>
                  <td>{k.lastRotatedAt || "Not rotated"}</td>
                  <td>
                    {k.custody ||
                      (k.method === "Local Storage"
                        ? "Test User’s device · metadata only"
                        : k.method === "Cloud KMS"
                          ? "Server IPFS · v1 retained for past jobs"
                          : "Server registered/stored · original file required")}
                  </td>
                  <td className="cepp-key-view-cell">
                    <Button
                      small
                      secondary
                      aria-label={"View " + k.name + " (" + masked(k) + ")"}
                      onClick={() => setSelectedId(k.id)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="cepp-muted">
            No keys in this scope.
            {canManage ? " Generate a key or register BYOK." : ""}
          </p>
        )}
        <p className="cepp-muted">
          Members can view permitted metadata. Only workspace Owner/Admin may
          generate/register, rotate, revoke or set active versions. Access to a
          local secret is separate.
        </p>
      </Panel>
      <Panel title="Workspace key policy">
        {canManage ? (
          <>
            <Checkbox checked={record} onChange={setRecord}>
              Record the exact key version on every job
            </Checkbox>
            <Checkbox checked={backup} onChange={setBackup}>
              Require backup acknowledgment for Local Storage
            </Checkbox>
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
                    : notifySaved()
                }
              >
                Save policy
              </Button>
            </div>
          </>
        ) : (
          <DetailRows
            rows={[
              [
                "Record exact key version",
                record ? "Required" : "Not required",
              ],
              [
                "Local backup acknowledgment",
                backup ? "Required" : "Not required",
              ],
              ["Rotation reminder", reminder],
            ]}
          />
        )}
      </Panel>
      {selectedKey && (
        <KeyDetailsDialog
          key={scope + ":" + selectedKey.id}
          keyRecord={selectedKey}
          canManage={canManage}
          onClose={() => setSelectedId(null)}
          onAction={change}
          onRegisterReplacement={() => {
            if (!canManage) return;
            setSelectedId(null);
            setScope(scope);
            setByok(true);
            setOpen(true);
          }}
        />
      )}
      {open && canManage && (
        <KeyGenerationDialog
          fixtureWorkspaces={mockWorkspaces}
          fixtureGroups={mockGroups}
          register={byok}
          open={open}
          onClose={() => setOpen(false)}
          onReady={() => {
            setOpen(false);
            notifySaved();
          }}
        />
      )}
    </PageShell>
  );
}
const mockKeys: KeyRecord[] = [
  {
    id: "loc_7A2F",
    createdAt: "28 Feb 2026",
    custody: "Test User’s device · metadata only",
    name: "Key 1",
    method: "Local Storage",
    version: 1,
    scope: "Enterprise A / Group 1",
  },
  {
    id: "kms_8C91",
    createdAt: "28 Feb 2026",
    lastRotatedAt: "2 Mar 2026",
    custody: "Server IPFS · v1 retained for past jobs",
    versions: [
      {
        version: 2,
        status: "Active",
        createdAt: "2 Mar 2026",
        actor: "Test User",
      },
      {
        version: 1,
        status: "Retained",
        createdAt: "28 Feb 2026",
        note: "Original Batch 1 version",
      },
    ],
    jobBindings: [
      { jobId: "ORD-2026-001", label: "Batch 1 / 24 images", version: 1 },
    ],
    name: "Key 1",
    method: "Cloud KMS",
    version: 2,
    scope: "Enterprise A / Group 1",
  },
  {
    id: "byok_9E40",
    createdAt: "28 Feb 2026",
    registeredBy: "Test User · 28 Feb 2026",
    name: "Partner key",
    method: "BYOK",
    version: 1,
    scope: "Enterprise A / Group 1",
  },
  {
    id: "loc_4B10",
    createdAt: "28 Feb 2026",
    name: "Personal local",
    method: "Local Storage",
    version: 1,
    scope: "Personal",
  },
  {
    id: "kms_6D02",
    createdAt: "28 Feb 2026",
    name: "Personal cloud",
    method: "Cloud KMS",
    version: 1,
    scope: "Personal",
  },
];

const mockWorkspaces: import("@/types/workspace").WorkspaceOption[] = [
  {
    id: "enterprise-a",
    name: "Enterprise A",
    type: "enterprise",
    role: "Owner",
  },
];
const mockGroups: import("@/types/workspace").Group[] = [
  {
    id: "1",
    name: "Group 1",
    enterpriseName: "Enterprise A",
    role: "Owner",
    members: [],
    files: 4,
  },
  {
    id: "3",
    name: "Group 3",
    enterpriseName: "Enterprise A",
    role: "Admin",
    members: [],
    files: 2,
  },
];

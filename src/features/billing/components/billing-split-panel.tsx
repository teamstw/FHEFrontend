"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Notice } from "@/components/ui/notice";
import { Panel } from "@/components/ui/panel";
import type { BillingSplit } from "@/types/billing";
import type { Group } from "@/types/workspace";
import { useState } from "react";

export function BillingSplitPanel({
  canEdit,
  scope,
  total,
  groups,
  name,
  saved,
  loading,
  error,
  onRetry,
  onSave,
}: {
  canEdit: boolean;
  scope: string;
  total: number;
  groups: Group[];
  name: string;
  saved?: BillingSplit;
  loading: boolean;
  error: string;
  onRetry: () => void;
  onSave: (split: BillingSplit) => Promise<void>;
}) {
  const [drafts, setDrafts] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const enterprise = scope === "Personal" ? null : scope.split(" / ")[0];
  const candidates = [
    {
      key: "personal",
      label: `ตัวเอง · ${name}`,
      detail: "Personal account",
      participant: { type: "personal" } as const,
    },
    ...groups
      .filter((group) => enterprise && group.enterpriseName === enterprise)
      .filter(
        (group, index, all) =>
          all.findIndex((item) => item.id === group.id) === index,
      )
      .map((group) => ({
        key: "group:" + group.id,
        label: group.name,
        detail: enterprise || "",
        participant: { type: "group", groupId: group.id } as const,
      })),
  ];
  const savedKeys = (saved?.participants || []).map((party) =>
    party.type === "personal" ? "personal" : "group:" + party.groupId,
  );
  const requested = drafts[scope] ?? savedKeys;
  const selected = candidates.filter((candidate) =>
    requested.includes(candidate.key),
  );
  const stale =
    !loading &&
    !error &&
    requested.some(
      (key) => !candidates.some((candidate) => candidate.key === key),
    );
  const cents = Number.isFinite(total)
    ? Math.max(0, Math.round(total * 100))
    : 0;
  const base = selected.length ? Math.floor(cents / selected.length) : 0;
  const remainder = selected.length ? cents % selected.length : 0;
  const money = (amount: number) =>
    new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount / 100);
  const blocked = !canEdit || loading || !!error || saving;
  function toggle(key: string, checked: boolean) {
    if (!canEdit) return;
    setSaveError("");
    setDrafts((current) => ({
      ...current,
      [scope]: checked
        ? [...new Set([...requested, key])]
        : requested.filter((item) => item !== key),
    }));
  }
  async function save() {
    if (blocked || !selected.length) return;
    setSaving(true);
    setSaveError("");
    try {
      await onSave({
        method: "equal",
        participants: selected.map((item) => item.participant),
      });
      setDrafts((current) => {
        const next = { ...current };
        delete next[scope];
        return next;
      });
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Unable to save billing split",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Panel title="Set billing · แบ่งบิล" className="cepp-billing-split">
      <p className="cepp-muted">
        {canEdit
          ? "เลือกตัวเองและกลุ่มที่ต้องการร่วมจ่าย"
          : "ข้อมูลผู้ร่วมจ่ายที่บันทึกไว้"}{" "}
        ยอดของ {scope} จะหารเท่ากันตามรายการที่เลือก
      </p>
      {loading && (
        <p role="status" className="cepp-muted">
          Loading your groups…
        </p>
      )}
      {error && (
        <Notice
          title="Unable to load billing groups"
          warning
          action={
            <Button small secondary onClick={onRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Notice>
      )}
      {canEdit && !loading && !error && (
        <div
          className="cepp-billing-recipients"
          role="group"
          aria-label="Billing participants"
        >
          {candidates.map((candidate) => (
            <div
              key={candidate.key}
              className={
                "cepp-billing-recipient" +
                (requested.includes(candidate.key) ? " selected" : "")
              }
            >
              <Checkbox
                checked={requested.includes(candidate.key)}
                disabled={saving}
                onChange={(checked) => toggle(candidate.key, checked)}
              >
                <span>
                  <strong>{candidate.label}</strong>
                  <small>{candidate.detail}</small>
                </span>
              </Checkbox>
            </div>
          ))}
        </div>
      )}
      {stale && (
        <p className="cepp-muted" role="status">
          รายชื่อกลุ่มเปลี่ยนแปลง กรุณาตรวจสอบผู้ร่วมจ่ายและบันทึกใหม่
        </p>
      )}
      {!loading && !error && (
        <div
          className="cepp-billing-allocation"
          aria-label="Estimated billing split"
        >
          <div className="cepp-row wrap">
            <h3>ยอดประมาณการต่อผู้ร่วมจ่าย</h3>
            <span className="cepp-muted">
              {selected.length} รายการ · หารเท่ากัน
            </span>
          </div>
          {selected.length ? (
            <dl>
              {selected.map((party, index) => (
                <div key={party.key}>
                  <dt>{party.label}</dt>
                  <dd>{money(base + (index < remainder ? 1 : 0))}</dd>
                </div>
              ))}
              <div className="total">
                <dt>รวมยอดประมาณการ</dt>
                <dd>{money(cents)}</dd>
              </div>
            </dl>
          ) : (
            <p className="cepp-muted">
              {canEdit
                ? "เลือกผู้ร่วมจ่ายอย่างน้อย 1 รายการเพื่อดูยอดแบ่งบิล"
                : "ยังไม่มีข้อมูลการแบ่งบิล"}
            </p>
          )}
          <p className="cepp-muted">
            ยอดคำนวณจากแพ็กเกจและการใช้งานของรอบนี้ ก่อนภาษี
            เศษสตางค์จะกระจายให้ยอดรวมตรงกัน
          </p>
        </div>
      )}
      {saveError && (
        <p className="cepp-alert" role="alert">
          {saveError}
        </p>
      )}
      {canEdit && (
        <div>
          <Button
            disabled={blocked || !selected.length}
            onClick={() => void save()}
          >
            {saving ? "Saving…" : "Save billing split"}
          </Button>
        </div>
      )}
    </Panel>
  );
}

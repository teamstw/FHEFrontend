"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "@/components/ui/text-field";
import { DetailRows } from "@/components/ui/detail-rows";
import { canManageRole } from "@/lib/authorization";
import { Panel } from "@/components/ui/panel";
import type { Group } from "@/types/workspace";
import { useEffect, useState, type FormEvent } from "react";

export function GroupSettingsForm({
  group,
  authorized,
  onSave,
}: {
  group: Group;
  authorized: boolean;
  onSave: (settings: {
    name: string;
    description: string;
    share: boolean;
  }) => Promise<void>;
}) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [share, setShare] = useState(group.share || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const canEdit = authorized && canManageRole(group.role);
  useEffect(() => {
    setName(group.name);
    setDescription(group.description || "");
    setShare(group.share || false);
    setError("");
  }, [group.id, group.name, group.description, group.share]);
  const changed =
    name.trim() !== group.name ||
    description.trim() !== (group.description || "") ||
    share !== (group.share || false);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!canEdit || saving || !changed) return;
    if (!name.trim() || name.trim().length > 80) {
      setError("กรอกชื่อกลุ่ม 1–80 ตัวอักษร");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        share,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save group settings",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Panel title="Group settings">
      {canEdit ? (
        <form className="cepp-stack" onSubmit={save}>
          <TextField
            label="Group name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            required
            disabled={!canEdit || saving}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={1000}
            disabled={!canEdit || saving}
          />
          <Checkbox
            checked={share}
            onChange={setShare}
            disabled={!canEdit || saving}
          >
            Allow Members to publish encrypted previews to the group
          </Checkbox>
          {error && (
            <p role="alert" className="cepp-alert">
              {error}
            </p>
          )}
          <div>
            <Button
              type="submit"
              disabled={!canEdit || saving || !changed || !name.trim()}
            >
              {saving ? "Saving…" : "Save group settings"}
            </Button>
          </div>
        </form>
      ) : (
        <DetailRows
          rows={[
            ["Group name", group.name],
            ["Description", group.description || "—"],
            [
              "Members may publish encrypted previews",
              group.share ? "Allowed" : "Not allowed",
            ],
          ]}
        />
      )}
    </Panel>
  );
}

"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DetailRows } from "@/components/ui/detail-rows";
import { Modal } from "@/components/ui/modal";
import { Notice } from "@/components/ui/notice";
import { Panel } from "@/components/ui/panel";
import { fingerprint, masked } from "@/lib/key-metadata";
import type { KeyRecord } from "@/types/key";
import { useEffect, useRef, useState } from "react";

export function KeyDetailsDialog({
  keyRecord,
  canManage,
  onClose,
  onAction,
  onRegisterReplacement,
}: {
  keyRecord: KeyRecord;
  canManage: boolean;
  onClose: () => void;
  onAction: (key: KeyRecord, action: string, version?: number) => Promise<void>;
  onRegisterReplacement: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [restoreStatus, setRestoreStatus] = useState("");
  const [confirmVersion, setConfirmVersion] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const confirmation = useRef<HTMLDivElement>(null);
  const revokeTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (confirmVersion === null) return;
    confirmation.current?.scrollIntoView({
      block: "nearest",
      behavior: "auto",
    });
    confirmation.current
      ?.querySelector<HTMLButtonElement>("button")
      ?.focus({ preventScroll: true });
  }, [confirmVersion]);
  function cancelRevocation() {
    setConfirmVersion(null);
    setError("");
    revokeTrigger.current?.focus({ preventScroll: true });
  }
  const versions = keyRecord.versions || [
    {
      version: keyRecord.version,
      status: keyRecord.revoked ? ("Revoked" as const) : ("Active" as const),
      createdAt: keyRecord.createdAt,
    },
  ];
  async function act(action: string, version?: number) {
    if (!canManage || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      await onAction(keyRecord, action, version);
      setConfirmVersion(null);
      if (action === "revoke")
        (
          revokeTrigger.current?.closest(
            ".cepp-key-version-row",
          ) as HTMLElement | null
        )?.focus({ preventScroll: true });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update key");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  return (
    <Modal
      open
      onClose={onClose}
      title={keyRecord.name + " · Key details"}
      description={keyRecord.method + " · " + keyRecord.scope}
      wide
    >
      <div className="cepp-row start wrap">
        <Badge>{keyRecord.method}</Badge>
        <Badge tone={keyRecord.revoked ? "amber" : "green"}>
          v{keyRecord.version} · {keyRecord.revoked ? "Revoked" : "Active"}
        </Badge>
      </div>
      <DetailRows
        rows={[
          ["Key name", keyRecord.name],
          ["Masked ID", masked(keyRecord)],
          ["Workspace", keyRecord.scope],
          ["Created", keyRecord.createdAt || "—"],
          ["Last rotation", keyRecord.lastRotatedAt || "Not rotated"],
          [
            "Custody / access",
            keyRecord.custody ||
              (keyRecord.method === "Local Storage"
                ? "Local device · server metadata only"
                : keyRecord.method === "Cloud KMS"
                  ? "Cloud-managed key"
                  : "Server registered/stored · original file required"),
          ],
        ]}
      />

      {keyRecord.method === "Local Storage" && (
        <>
          <Panel title="Local key · backup and restore">
            <DetailRows
              rows={[
                [
                  "Selected key",
                  masked(keyRecord) + " / v" + keyRecord.version,
                ],
                [
                  "Backup validation",
                  restoreStatus ||
                    "No matching backup validated in this session",
                ],
              ]}
            />
            {canManage && (
              <div className="cepp-row start wrap">
                <Button
                  secondary
                  onClick={() =>
                    setRestoreStatus(
                      "Export requires the original secret to be available on this device. Metadata cannot recreate the backup.",
                    )
                  }
                >
                  Export key backup
                </Button>
                <Button
                  secondary
                  disabled={busy}
                  onClick={() => input.current?.click()}
                >
                  Import backup / restore
                </Button>
                <input
                  ref={input}
                  hidden
                  type="file"
                  accept=".txt"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file || !canManage || inFlight.current) return;
                    inFlight.current = true;
                    setBusy(true);
                    setError("");
                    setRestoreStatus("");
                    try {
                      if (
                        !keyRecord.fingerprint ||
                        (await fingerprint(file)) !== keyRecord.fingerprint
                      )
                        throw new Error(
                          "No matching local key fingerprint. Choose the original backup for this key.",
                        );
                      setRestoreStatus("Matching backup validated");
                    } catch (error) {
                      setError(
                        error instanceof Error
                          ? error.message
                          : "Unable to read backup",
                      );
                    } finally {
                      inFlight.current = false;
                      setBusy(false);
                    }
                  }}
                />
              </div>
            )}
            <Notice title="No automatic recovery guarantee" warning>
              Export requires the local secret. Restore requires the matching
              original backup. Server metadata cannot recreate a lost local key.
            </Notice>
          </Panel>
          <Panel title="Local access">
            <p className="cepp-muted">
              {keyRecord.custody ||
                "Local access is determined by possession of the original key on a device."}
            </p>
            <Notice title="Metadata is not proof of possession">
              Workspace roles do not supply a local secret. The matching key
              must be supplied at decryption.
            </Notice>
          </Panel>
        </>
      )}

      {keyRecord.method === "Cloud KMS" && (
        <Panel title={keyRecord.name + " · version history"}>
          {versions.map((version) => (
            <div
              className="cepp-key-version-row"
              key={version.version}
              tabIndex={-1}
            >
              <div className="cepp-key-version-copy">
                <Badge
                  tone={
                    version.status === "Active"
                      ? "green"
                      : version.status === "Revoked"
                        ? "amber"
                        : "cyan"
                  }
                >
                  v{version.version} · {version.status}
                </Badge>
                {(version.createdAt || version.actor) && (
                  <span className="cepp-muted">
                    {[version.createdAt, version.actor]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                )}
                {version.note && <p className="cepp-muted">{version.note}</p>}
              </div>
              {canManage && version.status !== "Revoked" && (
                <div className="cepp-row start wrap">
                  {version.status === "Active" ? (
                    <Button
                      secondary
                      disabled={busy || keyRecord.revoked}
                      onClick={() => void act("rotate")}
                    >
                      Rotate key
                    </Button>
                  ) : (
                    <>
                      <Button
                        secondary
                        small
                        disabled={busy}
                        onClick={() =>
                          void act(
                            "activate-v" + version.version,
                            version.version,
                          )
                        }
                      >
                        Set active v{version.version}
                      </Button>
                      <Button
                        danger
                        secondary
                        small
                        disabled={busy}
                        onClick={(event) => {
                          revokeTrigger.current = event.currentTarget;
                          setError("");
                          setConfirmVersion(version.version);
                        }}
                      >
                        Revoke v{version.version}
                      </Button>
                    </>
                  )}
                </div>
              )}
              {canManage && confirmVersion === version.version && (
                <div
                  ref={confirmation}
                  className="cepp-key-revoke-confirm"
                  role="group"
                  aria-label="Confirm key version revocation"
                >
                  <strong>
                    Revoke v{confirmVersion} of {keyRecord.name}?
                  </strong>
                  <p className="cepp-muted">
                    Older results that use this version may become impossible to
                    decrypt.
                  </p>
                  {error && (
                    <p className="cepp-alert" role="alert">
                      {error}
                    </p>
                  )}
                  <div className="cepp-row start wrap">
                    <Button
                      secondary
                      disabled={busy}
                      onClick={cancelRevocation}
                    >
                      Cancel
                    </Button>
                    <Button
                      danger
                      disabled={busy}
                      onClick={() => void act("revoke", confirmVersion)}
                    >
                      {busy ? "Revoking…" : "Confirm revoke v" + confirmVersion}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!!keyRecord.jobBindings?.length && (
            <DetailRows
              rows={keyRecord.jobBindings.map((binding) => [
                "Job binding",
                binding.label +
                  " · v" +
                  binding.version +
                  " · " +
                  binding.jobId,
              ])}
            />
          )}
          <p className="cepp-muted">
            Changing the active version affects new jobs only. Past jobs remain
            bound to their original key version. The non-exportable GCP KEK is
            never offered for download.
          </p>
          <Notice title="Revocation can affect past jobs" warning>
            Revoking a required version may make older results impossible to
            decrypt. Review dependent jobs and retain necessary backups before
            revocation.
          </Notice>
        </Panel>
      )}

      {keyRecord.method === "BYOK" && (
        <Panel title="BYOK · registration and continuity">
          <DetailRows
            rows={[
              [
                "Registered key",
                keyRecord.name +
                  " · " +
                  masked(keyRecord) +
                  " / v" +
                  keyRecord.version,
              ],
              ["Registered by", keyRecord.registeredBy || "—"],
            ]}
          />
          <p className="cepp-muted">
            The server registers/stores the imported key. Decryption requires
            the same original key file, not a newly generated replacement.
          </p>
          {canManage && (
            <div>
              <Button secondary onClick={onRegisterReplacement}>
                Register replacement version
              </Button>
            </div>
          )}
        </Panel>
      )}
      {error && confirmVersion === null && (
        <p className="cepp-alert" role="alert">
          {error}
        </p>
      )}
      <div className="cepp-row cepp-key-details-footer">
        <Button secondary onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}

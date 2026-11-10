import type { KeyRecord, KeyVersion } from "@/types/key";

// Local fixture updates only. Real key actions are always authorized by the API.
export function applyLocalKeyAction(
  key: KeyRecord,
  action: string,
  version?: number,
): KeyRecord {
  const versions: KeyVersion[] = key.versions || [
    {
      version: key.version,
      status: key.revoked ? "Revoked" : "Active",
      createdAt: key.createdAt,
    },
  ];
  if (action === "rotate") {
    if (key.revoked) throw new Error("A revoked key cannot be rotated");
    const nextVersion =
      Math.max(key.version, ...versions.map((item) => item.version)) + 1;
    const date = new Date().toLocaleDateString("en-GB");
    return {
      ...key,
      version: nextVersion,
      lastRotatedAt: date,
      versions: [
        { version: nextVersion, status: "Active", createdAt: date },
        ...versions.map((item) =>
          item.status === "Active"
            ? { ...item, status: "Retained" as const }
            : item,
        ),
      ],
    };
  }
  const target =
    version ??
    (action.startsWith("activate-v") ? Number(action.slice(10)) : key.version);
  const selected = versions.find((item) => item.version === target);
  if (!selected) throw new Error("Key version not found");
  if (action === "revoke")
    return {
      ...key,
      revoked: key.version === target ? true : key.revoked,
      versions: versions.map((item) =>
        item.version === target ? { ...item, status: "Revoked" } : item,
      ),
    };
  if (action === "activate-v" + target) {
    if (selected.status === "Revoked")
      throw new Error("A revoked version cannot be activated");
    return {
      ...key,
      version: target,
      revoked: false,
      versions: versions.map((item) =>
        item.version === target
          ? { ...item, status: "Active" }
          : item.status === "Active"
            ? { ...item, status: "Retained" }
            : item,
      ),
    };
  }
  throw new Error("Unknown key action");
}

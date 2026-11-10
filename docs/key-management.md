# Key Management details

The main `/key-management` page contains workspace selection, generation/registration actions, type filters, Workspace key inventory and the workspace-wide key policy. Every inventory row has a View button at its far right.

View opens `src/features/keys/components/key-details-dialog.tsx` for the selected key ID in the current scope. It reads that record from the live inventory, so actions update both the detail and its row. Selection resets when the scope changes. Details are not selected by the first key matching a storage method.

- Local Storage: selected-key metadata, fingerprint validation against the selected key, backup/restore information and local-access information. No secret is reconstructed from metadata. Validation state resets between keys.
- Cloud KMS: selected-key version history and job bindings. Owner/Admin controls act on that key and version. A revocation confirmation is shown before submitting.
- BYOK: registration metadata and the existing registration workflow.
- Members can View permitted metadata without seeing management actions. Workspace Owner/Admin gates remain in effect.

## Backend metadata contract

`GET /keys?scope=...` continues to return `KeyRecord[]`. Each record may supply these optional fields:

```ts
createdAt?: string;
lastRotatedAt?: string;
custody?: string;
registeredBy?: string;
versions?: {
  version: number;
  status: "Active" | "Retained" | "Revoked";
  createdAt?: string;
  actor?: string;
  note?: string;
}[];
jobBindings?: { jobId: string; label: string; version: number }[];
```

Absent history is not replaced with another key's versions or job bindings. The current version is shown when detailed version data is absent. Figma fixture metadata lives alongside `mockKeys` at the bottom of the page.

Version actions use the existing `POST /keys/:id/:action` endpoints. Rotation uses `rotate`; activation uses `activate-vN`; revocation uses `revoke`. Version-targeted calls include JSON `{ "version": N }`. The backend must authorize the user and selected key/version, enforce dependencies and return the complete updated `KeyRecord` with the same ID and scope. In API mode, server inventory is authoritative. Local action helpers only update development fixtures and perform no cryptographic operation.

## Verification — 2026-11-07

- 45 isolated-browser checks pass at 375/768/1440px for Owner, Admin and Member.
- Each key has View; local, cloud and BYOK details remain separate. Two local keys validate their own backup fingerprints. Cloud actions update only the selected key/version and preserve job bindings.
- BYOK registration flow, scope resets, responsive dialogs, read-only Member controls and absence of client exceptions were verified.
- `npm test`: 36 tests pass, including 8 version-action regressions.
- Production build including TypeScript passes.
- [Browser report](previews/key-details-report.json).

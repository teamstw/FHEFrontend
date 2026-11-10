# Frontend verification

## Per-key View details — 2026-11-07

- 45 isolated browser checks pass for Owner/Admin/Member at 375/768/1440px.
- Selected-key details, backup fingerprints, version actions, BYOK flow,
  scope resets and Member read-only behavior verified.
- 36 unit tests and production build including TypeScript pass.
- [Details](key-management.md); [report](previews/key-details-report.json).


## Authorization and Enterprise layout — 2026-11-07

- 28 policy tests and 82 isolated browser checks pass.
- Owner/Admin/Member checked at 375/768/1440px. Upload, restricted folders,
  direct URLs and anonymous access checked.
- Member roles align; Enterprise badges center with Enterprise billing.
- Production build including TypeScript passes.
- [Policy](authorization.md); [report](previews/authorization-report.json).


## Group roles and settings — 2026-11-07

- 9 local browser checks pass for Owner/Admin/Member at 375/768/1440px.
- The current OAuth-email member row is marked You and matches Group.role.
  A Member is never promoted from an unrelated Test User Owner fixture row.
- Owner/Admin can save name, description and preview-sharing preference; title,
  fields and checkbox restore after reload. Member fields and Save are disabled
  with an explicit explanation. No client exceptions/overflow in checked layouts.
- Production build and standard typecheck pass. API authorization remains server
  responsibility; these role tests use isolated fixtures, not live privilege changes.
- [Report](previews/group-settings-report.json).


## Billing participant split — 2026-11-07

- 9 fixture-browser checks pass at 375/768/1440px: Enterprise membership and personal
  selection, exact cent totals, per-context/reload persistence, plan-change
  preservation, Personal isolation, stale membership exclusion and empty-selection gating.
- No client exceptions or horizontal overflow in these checks. Backend requests
  reuse PATCH /billing with a typed equal/participants configuration. No live billing
  service or payment was exercised.
- Standard typecheck passes. The optional unused-symbol audit reports existing
  Profile symbols (Checkbox, setPrivacy, router); Profile was left untouched.
- [Report](previews/billing-split-report.json).


## Completed and decrypted reference layout — 2026-11-07

- Completed uses the focused centered workflow frame with completed steps, green
  check/rings, centered caption/security badge, Decrypt and My File actions.
- Successful decryption changes the primary action to Download and updates the
  caption/badge to the decrypted state. Existing key validation remains in its dialog.
- 375/768/1440px checks pass for both layouts, Cancel, successful decryption,
  metadata download, reload persistence and My File's no-badge/Download state.
- No browser exceptions or horizontal overflow in the exercised fixture flows.
- Backend/no-job and still-processing states do not present a fake completed result.
- [Browser report](previews/completed-layout-report.json).


## Processing reference layout — 2026-11-07

- /progress uses a dedicated centered layout with workflow steps, face icon and
  circular rings, percentage above a compact bar and encryption/security badges.
- 375/768/1440px reference previews pass with one navbar and no horizontal overflow.
- Active local processing reaches 100%, records the distinct resultFileId while
  retaining folder/source metadata, displays Complete! for one second, then continues
  to /completed. Leaving the page cancels polling/navigation timers.
- Reduced-motion preference disables ring and indeterminate progress animation.
- Backend Job may supply progress (0–100). Processing values are clamped below 100;
  Completed displays 100. Without a reported percentage, the bar is indeterminate;
  no simulated percentage is generated for a configured backend. Poll errors offer Retry.
- Report: [processing-layout-report.json](previews/processing-layout-report.json).


## Upload My File picker and Enterprise group filter — 2026-11-06

- 9 focused browser checks pass at 375/768/1440px, with synthetic session/storage.
- Picker excludes FHE outputs, other workspaces, unsupported/empty originals.
- Multi-selection survives search/folder filters; Cancel preserves the batch,
  existing selections cannot duplicate, device files coexist and Clear removes both.
- Explicit Enterprise parent filtering excludes other Enterprises, independent
  groups and missing parents; switching Enterprise clears previous group choices.
- Key dialog receives only the selected Enterprise's eligible group selection.
- No browser exceptions or page/dialog horizontal overflow in the checked layouts.
- [Browser report](previews/upload-picker-report.json). Build/typecheck and unused
  checks run after implementation; no commit or push.


## My File library and folders — 2026-11-06

- Originals and completed FHE results are separate sections on one page. Old and
  backend Processing jobs are excluded from My File while remaining in History.
- 13 local browser checks pass at 375/768/1440px: section separation, nested folders,
  duplicate validation, original uploads, byte-preserving downloads after refresh,
  moving originals/results, workspace isolation and folder-scoped search.
- Reprocessing one stored source twice produces two different job/result IDs,
  preserves the source metadata/bytes, and puts both outputs in FHE results.
- 6 API-mode checks pass with fixture responses: no fallback after a failed folder
  read, Retry, folder/upload payloads, original downloads, scope-restricted moves,
  output artifact IDs, sourceFileIds without byte reupload and result Decrypt/Download.
- No client exceptions or page overflow in the exercised viewport checks. Build,
  typecheck and noUnusedLocals/noUnusedParameters checks pass.
- API-mode test URL existed only in a subprocess environment. No user .env or live
  browser storage was changed. Test servers were stopped; no commit or push.
- These tests validate frontend behavior with synthetic API responses. Real DB
  transactions, authorization and FHE output generation remain backend responsibilities.
- [Local report](previews/file-library-report.json),
  [API report](previews/file-library-backend-report.json),
  [integration guide](file-library.md).


## My File decryption-state correction — 2026-11-06

- Decrypted files have no encryption badge and show View + Download. Encrypted
  completed files keep Encrypted + View + Decrypt. Other encrypted processing
  files retain View only. Download availability depends on decrypted, not Completed.
- Decrypt success updates shared job metadata from My File, Completed and History
  detail. Reload and navigation retain local success; invalid-key attempts do not.
- 8 focused browser checks pass at 375/768/1440px, including wrong/correct key,
  persistence, a decrypted record with a separate Processing status and cross-page
  decryption entry points. No client errors or page overflow in these checks.
- Backend integration expects the explicit decrypted boolean and an authorized
  decrypted-result download URL; the backend contract documents the corrected flow.
- Report: [decrypted-file-report.json](previews/decrypted-file-report.json).


## History details and My File downloads — 2026-11-06

- Detail links in History open /history/[jobId], with correct completed/processing
  information, source filenames, workspace/groups and immutable key/version metadata.
- Page-local fixtures and restored local jobs open directly and survive refresh.
  URL-encoded IDs and long job/file names are covered.
- The original download behavior below was superseded by the decrypted-state
  correction: only decrypted files show Download; encrypted files keep their badge
  and View/Decrypt actions.
- The existing Decrypt dialog remains a separate action.
- 13 browser flow checks pass, including desktop/tablet/mobile at 375/768/1440px.
  No client errors, broken rendered images or horizontal overflow in these checks.
- 8 backend-mode checks pass with synthetic API responses: authoritative server
  metadata, 404 without mock fallback, 403, mismatched ID, Retry, encoded IDs,
  processing-status refresh and an actual local HTTP attachment download.
- API-mode testing used a subprocess-only base URL. The .env files and live user
  browser context were not changed. The temporary server was stopped afterward.
- These checks verify frontend behavior; production endpoints and real encrypted
  result contents remain the backend integration responsibility.
- Reports: [job-details-report.json](previews/job-details-report.json),
  [job-download-backend-report.json](previews/job-download-backend-report.json).


## Source structure refactor — 2026-11-02

Target: C:/Users/gigabyte/Documents/FHEFrontend. Local edits only; no commit or push.

- Production build passes with source under src/ and no (dashboard) route group.
- npm run typecheck and TypeScript noUnusedLocals/noUnusedParameters checks pass.
- The original 24 page routes are preserved. Browser checks cover every route at
  375, 768 and 1440px (72 route/viewport checks).
- Each page has one navbar, no horizontal overflow, no broken rendered images
  and no client exceptions in the isolated browser contexts.
- Authenticated Get Started -> workspace selection -> Upload works at all widths.
- Enterprise group checkbox multi-selection, valid-file gating and the key
  generation dialog work. Personal upload has no group selector.
- Dynamic group routes work for Enterprise A and Enterprise B memberships.
- Google-session avatar defaults, image preview/save and reload persistence work
  with a synthetic OAuth session and synthetic image (no real account modified).
- Existing compatibility redirects and native 404 behavior pass.
- OAuth handler, package files and application CSS are preserved from the
  pre-migration snapshot. Only the Tailwind import explicitly adds src discovery.
- Browser report: [source-structure-report.json](previews/source-structure-report.json).

See [architecture.md](architecture.md) for the current tree, naming rules and
page responsibilities. Older reports below describe the UI at their recorded
revision. Live Google sign-in, backend FHE processing, database writes and billing
services are outside this structural regression test.

## Historical UI checks (before source relocation)

- `npm run build` passes, including TypeScript and static page generation.
- 16 routes checked at 375, 768 and 1440px: 48 route/viewport checks.
- No page-level horizontal overflow, broken rendered images or client exceptions.
- Local Storage flow: upload, workspace selection, key naming, backup download,
  acknowledgement, processing state, reload, rejection of a mismatched backup,
  and acceptance of the original backup.
- Cloud KMS and BYOK UI flows pass on a 375px viewport. Dialogs fit the viewport.
- Group Admin cannot appoint or revoke peer Admins in the group member UI.
- Home navigation animates both down and up over 550ms without document reload.
- Sticky navbar stays at viewport top. Anchor headings retain a 105px offset.
- Signed-in and signed-out navigation checked at 320, 375, 768 and 1440px.
- Reduced-motion preferences skip the scrolling animation.
- No custom cursor images or CSS cursor URLs are applied.

These are frontend and fixture-flow checks, not verification of a live FHE,
Google OAuth, KMS/IPFS, database or payment service. Integration contracts and
pending backend writes are documented in `backend-integration.md`.

## App Router restructuring (2026-10-22)

- Production webpack build passes with native App Router pages and layouts.
- TypeScript passes with noUnusedLocals and noUnusedParameters enabled for the check.
- 21 application routes checked at 375, 768 and 1440px (63 checks).
- Exactly one navbar per page; no page-level overflow, broken images or client errors.
- Compatibility redirects and native 404 behavior verified.
- Login returns Home. Home anchor navigation scrolls without reloading the document;
  the sticky navbar stays at the top of the viewport.
- History search, dynamic Group 1 / Group 2 routing and group creation verified.
- New groups persist across reload. Local key generation, backup acknowledgement,
  upload processing and completed-job restoration pass after extracting features.
- Report: [refactor-report.json](previews/refactor-report.json). Representative
  screenshots use the refactor- prefix in previews/.

These checks use local fixtures. Existing backend integration boundaries remain unchanged.

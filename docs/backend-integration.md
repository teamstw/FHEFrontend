# CEPP frontend integration

## Key inventory View — 2026-11-07

See [key-management.md](key-management.md) for per-key metadata and version-action request contracts.


## Authorization policy — 2026-11-07

See [authorization.md](authorization.md) for role contracts, scope boundaries,
view-only UI and required backend enforcement.


The frontend follows the CEPP v2 screens in Figma file `10iLKucTJZ6gZYcb4q4QD1`.
All changes are local; no commit or push is performed.

## Preview and backend switch

Run `npm run dev`. Keep `NEXT_PUBLIC_CEPP_API_URL` unset for local previews.
Mock objects live at the **bottom of each page module** in `src/app/(public)/**/page.tsx` and `src/app/(application)/**/page.tsx`.
Shared state in `src/providers/app-state-provider.tsx` contains user edits and batch metadata, not secret keys.
The legacy `/fhe-test` experiment was removed; FHE integration uses the documented backend adapter.

`src/lib/api/backend-api.ts` declares typed requests and proposed endpoint contracts. Set
`NEXT_PUBLIC_CEPP_API_URL` only after the backend agrees with those contracts.
Reads must show loading/error/empty states and must never fall back to mock data
after a backend request fails. All requests include session cookies. The backend
must enforce workspace scope and role permissions; UI controls are not authorization.

## Required contracts

* `/auth/session`, `/auth/google`, `/auth/logout`: Google OAuth and secure session.
* `/profile`: profile reads and PATCH updates, consent and privacy.
* `/jobs`: GET history; multipart POST files, scope, keyId and version. The server
  returns a Job. `/jobs/:id` returns status for polling.
* `/jobs/:id/decrypt`: multipart key file or cloud key ID/version. Validate original
  key fingerprint, retained version and workspace. Return an authorized download URL.
* `/files`: encrypted-result metadata; never return secret material in list responses.
* `/workspaces`, `/groups`: workspace inventory, group creation, membership and roles.
* `/keys?scope=...`, `/keys`: metadata inventory and multipart generation/registration.
  Key export/restore, rotation, per-version revocation and active-version selection
  require authenticated endpoints before real use. Keep immutable job-key bindings.
* `/billing`, `/billing/payment-methods`: plans, usage, budgets, payer scopes, invoices.
  Use Stripe Elements/SetupIntent for real card entry. This preview accepts only four
  demo digits and never collects a full card number or CVC.
* `/notifications`, `/notifications/read`: notification inventory and read state.

Unimplemented write endpoints show an explicit connection message rather than
pretending to change backend data. Pending endpoints: invitation accept/reject,
member administration, ownership transfer, group deletion, payment-method writes,
subscription changes, account export/deletion and key-backup export/restore.

## Security and demo boundaries

Local preview simulates processing only. It does not perform FHE face detection,
create real Cloud KMS keys, contact IPFS, charge cards, send invitations or access
Google services for processing. Authentication itself uses the existing real Google OAuth/NextAuth integration. Demo key files are explicitly marked `demo:true`. Key file content
is kept in memory only, never persisted in localStorage or rendered to the user.
Only a SHA-256 fingerprint is retained to demonstrate original-key validation.
Figma sample jobs have no actual ciphertext or matching private key, so attempting
to decrypt a fixture displays a helpful error. Demo downloads contain metadata.

Real key custody needs browser secure storage/service integration and a deliberate
backup policy. GCP KMS KEKs must remain non-exportable. Backend authorization and
per-version revocation enforcement remain server responsibilities.

## Workspace selection before upload

Get Started routes to /choose-workspace before /upload. Personal and Enterprise
can both continue directly. Enterprise groups are selected on Upload using a
checkbox dropdown: one or more groups are required before key generation.
Personal bypasses group selection. Change workspace retains the current batch
files and clears group selection only when switching to a different workspace.
A direct visit to /upload without an in-memory scope redirects to the chooser.

GET /workspaces returns WorkspaceOption[] (id, name, type and optional
enterpriseName). Prefer personal/enterprise entries; existing group entries can
also supply their parent enterprise name. Fixtures remain at the bottom of
src/app/(application)/(processing)/choose-workspace/page.tsx. Loading/error/empty states disable
Continue, and a failed configured backend request does not fall back to fixtures.

## Multiple Enterprise groups on Upload

- GET /groups?scope=<enterprise-name> returns only groups available to the session
  within that Enterprise. Group may include enterpriseName for explicit scope checks.
- Group fixtures live at the bottom of src/app/(application)/(processing)/upload/page.tsx. Backend
  loading, errors and empty membership cannot be bypassed by fixture data.
- POST /jobs sends multipart scope, groupIds (a JSON array of group IDs), keyId,
  version and files. Personal sends an empty groupIds array.
- POST /keys may include the same JSON groupIds array for keys created from Upload.
- Job and KeyRecord support optional groupIds/groupNames metadata. Job metadata is
  retained across reload and displayed in History/file details. Older records
  without these fields remain supported.
- The backend must validate membership/permission for every requested group and
  ensure all groups belong to the requested Enterprise before creating keys/jobs.

## My Group across Enterprises and independent groups

- GET /groups is the authenticated user's complete group membership inventory,
  across all Enterprises and independent groups. It must not return arbitrary
  groups belonging to other users. Each record's role is this user's group role.
- Group.enterpriseName is the Enterprise name, or explicit null for an independent
  group. Missing values are accepted only for old cached records and assigned to
  the previously selected/default Enterprise for backward compatibility.
- My Group defaults to all memberships, with Enterprise/independent filters and
  per-card affiliation. Its heading and role notice do not imply Enterprise A
  ownership. Group detail breadcrumbs use the group's own affiliation.
- Enterprise pages and GET /groups?scope=... / Upload remain Enterprise-scoped.
  Independent groups are excluded from Enterprise upload checkboxes.
- POST /groups receives { name, enterpriseName }, where enterpriseName may be null.
  The backend must authorize creation in the requested Enterprise. An independent
  group remains a multi-user group; it is separate from the Personal workspace.
- Editing/deleting an Enterprise's groups preserves all other memberships in the
  local model. Renaming an Enterprise retains its group affiliations.
- Page-local fixtures include Enterprise A, Enterprise B and an independent group;
  user-created local records are retained across reload without replacing them
  with fixture records.

## Profile avatar

- The default avatar uses session.user.image supplied by the existing Google
  OAuth/NextAuth session. A saved custom avatar overrides it within CEPP.
- Edit avatar accepts JPG, PNG and WebP up to 5 MB, validates image decoding,
  crops the center to a 256x256 image and shows a preview before saving.
- Without a configured backend, custom images are stored under an account-specific
  browser storage key. The global demo model excludes the image; switching OAuth
  accounts does not reuse another account's custom photo.
- With a backend, POST /profile/avatar receives multipart field avatar containing
  the normalized image and returns { avatarUrl: string }. GET /profile should also
  return optional avatarUrl so Profile and navbar restore it after reload.
- The backend must persist the image/URL and validate the authenticated user,
  content type and file size; browser validation alone is not the upload contract.

## History job details and result download — 2026-11-06

- Detail in History opens /history/:jobId. The page is implemented in
  src/app/(application)/(account)/history/[jobId]/page.tsx, with its fixtures at
  the bottom of that module. Local job metadata is restored before resolving IDs.
- With a configured backend, GET /jobs/:id is authoritative even if the local
  store contains an older job with the same ID. The page handles loading, 404,
  authorization errors, request failures and Retry without falling back to mocks.
- A response must return the requested Job ID. Late responses after changing the
  route are ignored. Processing details can refresh their current status.
- My File uses Job.decrypted independently from the processing status. Decrypted
  results have no encryption badge and show View + Download. Other results retain
  Encrypted + View, with Decrypt added when processing is Completed. Download is
  never offered solely because the job is Completed.
- GET /files/:jobId/download returns { downloadUrl: string }, an absolute HTTP(S)
  authorized URL for a previously decrypted result. It must not silently decrypt
  a result or return ciphertext from the Download action. Enforce job membership,
  permissions and successful decryption on the server, use a short-lived URL, and
  serve Content-Disposition: attachment with the
  result filename. The frontend keeps the application open while requesting it.
- Failed downloads show an error and can be retried. Repeated clicks are blocked
  while a download URL is being requested. A failed API request never downloads
  fixture data. The existing /jobs/:id/decrypt contract is unchanged.
- Without a backend, Download saves a clearly named *-metadata.json fixture;
  it contains metadata with demo:true, not an actual encrypted/decoded result.

## Decrypted file state — correction on 2026-11-06

- GET /files and GET /jobs/:id return optional decrypted: boolean on Job. Missing
  or false means encrypted; Completed and Processing do not imply decryption.
- A successful POST /jobs/:id/decrypt must persist the per-user authorized
  decryption/result state so later reads return decrypted:true. Failed validation
  must not change it. The frontend records success only after the operation passes.
- Local mode persists only this metadata flag on the job, never the key or result
  bytes. Completed, History detail and My File share the same state. Legacy local
  records without a flag are treated as encrypted; no array-index or filename
  heuristic assumes that a file was previously decrypted.
- Backend reads stay authoritative. My File refreshes after decryption, and the
  server must return the updated flag. URLs are not persisted in browser storage;
  a subsequent Download requests a fresh authorized decrypted-result URL.
- This supersedes the earlier direct-ciphertext download behavior. The first
  page-local example is decrypted and the second remains encrypted.

## My File library and independent FHE artifacts

The current My File layout splits original storage from completed FHE results and
supports nested workspace folders. Processing records are excluded without deleting
their History. See [file-library.md](file-library.md) for endpoint payloads and the
sourceFileIds -> new resultFileId database contract. Storage originals, output
artifacts and jobs have separate identities; passing a stored source into FHE never
overwrites or reclassifies that original. The source workspace must match the job.

## Upload original picker and Enterprise groups

Select from My File uses authorized original records from GET /storage/files plus
folder metadata from GET /file-folders, scoped by the currently selected workspace
on the frontend. It does not offer FHE result artifacts, other workspaces, empty
files or unsupported formats. Source IDs are deduplicated before submission.
For GET /groups?scope=..., return explicit enterpriseName on each Enterprise group.
Upload does not infer a missing parent from the requested scope; unknown, foreign
and independent groups are excluded. Backend authorization must enforce the same
source/group/Enterprise relationships during key and job creation.

## Billing allocation: personal account and Enterprise groups — 2026-11-07

Set billing lets the current user select their personal account and their own
groups within the selected Enterprise. Group billing contexts use their parent
Enterprise's membership inventory; Personal offers the personal account only.
GET /groups must return authenticated user memberships with explicit enterpriseName.
Independent groups and other Enterprises are excluded from an Enterprise split.

GET /billing?scope=... may return split: { method: "equal", participants: [...] }.
PATCH /billing accepts { scope, split: { method: "equal", participants: [
  { type: "personal" }, { type: "group", groupId: "3" }, { type: "group", groupId: "5" }
] } }. Personal refers to the authenticated user, not a client-provided user ID.
Only IDs/configuration are sent; client-calculated amounts are previews. The
server must authorize the payer's billing permissions/consent, validate group
membership and Enterprise affiliation, reject duplicate/empty/invalid recipients,
persist the configuration and calculate actual invoice allocations itself.

The preview divides projected total cents equally per selected party, distributing
remainder cents in participant order so displayed shares sum exactly to the total.
Each selected group is one party (not one share per member). Contexts remain
separate and are not summed or charged twice. Saving this setting does not charge
cards. Actual collection and subscription APIs remain separate backend work.

Local allocations persist under billingSettings[scope].split. Plan changes,
cancellation and limit saves preserve the split. Missing memberships are excluded
from the preview and must be reconciled explicitly with Save; no stale group ID is
included in the outgoing payload. Group load errors block Enterprise allocation.

## Group settings and current-account roles — 2026-11-07

Group.role is the authenticated user's membership role, not the group's Owner
member row. GET /groups must return that role and consistent member email/role
records. Configured backend reads use server data rather than old local group roles.
The current account is identified by OAuth email (never display-name matching),
marked You in member lists, and its displayed membership role follows Group.role.
Local fixtures normalize the legacy user1@example.com placeholder only when its
role matches the current membership; otherwise the current mock member is appended
without replacing/promoting the existing Owner. Invitation acceptance stays Member.

PATCH /groups/:id accepts {name, description, share} from Owner/Admin and returns
the full updated Group. Member is read-only in the UI and must be rejected by the
server as well. The frontend saves only after success and validates response ID.
Group now includes optional description and share; local mode persists all three
settings. New groups use the current OAuth email for their owner member.

# CEPP frontend integration

The frontend follows the CEPP v2 screens in Figma file `10iLKucTJZ6gZYcb4q4QD1`.
All changes are local; no commit or push is performed.

## Preview and backend switch

Run `npm run dev`. Keep `NEXT_PUBLIC_CEPP_API_URL` unset for local previews.
Mock objects live at the **bottom of each page module** in `app/(site)/**/page.tsx` and `app/(dashboard)/**/page.tsx`.
Shared state in `providers/cepp-provider.tsx` contains user edits and batch metadata, not secret keys.
The legacy `/fhe-test` experiment was removed; FHE integration uses the documented backend adapter.

`lib/api/cepp.ts` declares typed requests and proposed endpoint contracts. Set
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
Google accounts. Demo key files are explicitly marked `demo:true`. Key file content
is kept in memory only, never persisted in localStorage or rendered to the user.
Only a SHA-256 fingerprint is retained to demonstrate original-key validation.
Figma sample jobs have no actual ciphertext or matching private key, so attempting
to decrypt a fixture displays a helpful error. Demo downloads contain metadata.

Real key custody needs browser secure storage/service integration and a deliberate
backup policy. GCP KMS KEKs must remain non-exportable. Backend authorization and
per-version revocation enforcement remain server responsibilities.

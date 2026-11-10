# Workspace authorization

The frontend uses `src/lib/authorization.ts` and `src/hooks/use-authorization.ts` to determine which tools are shown. The backend must independently authorize each request against the authenticated account and resource ID. Hiding controls is not server-side authorization.

| Area | Owner / Admin of that resource | Member or unavailable role |
| --- | --- | --- |
| Group settings | Edit name, description and preview sharing | Values only; no inputs, checkbox or Save |
| Enterprise | Create/delete groups, invite Members, edit settings | View organization, groups and members |
| Member roles | Owner may assign/revoke Admin; Admin may remove Members | No role or removal actions |
| Ownership transfer | Owner only | Hidden, including for Admin |
| Keys | Generation/registration, replacement, rotation, revocation, activation, backup/restore and policy controls | Permitted metadata, version history and policy values |
| Billing | Plan/payment, split participants and budget settings | Summary, saved split, limits and invoice views |
| Shared file storage | Add files/folders, move files and start processing | View and download permitted files |
| Upload | Owner/Admin of workspace and every selected group | Workspace information only |

Personal profile, personal payment methods and Personal storage remain owned by the authenticated user. Creating a new independent group or enterprise creates a resource owned by that account; it grants no access to an existing organization. Search, filters, navigation and permitted downloads remain available.

## Backend role contract

- `GET /groups`: `Group.role` is the authenticated user's role in that exact group. Valid values are `Owner`, `Admin`, `Member`. The current user's email row must agree with that role.
- `GET /workspaces`: each enterprise entry supplies its authenticated user's `role`, independently of all group roles. An optional `members: Member[]` supplies the organization member list.

```json
{
  "id": "enterprise-a",
  "name": "Enterprise A",
  "type": "enterprise",
  "role": "Member",
  "members": [{"name": "User", "email": "user@example.com", "role": "Member"}]
}
```

- Group Owner does not imply Enterprise Owner; Enterprise Owner does not imply Group Owner. Other enterprises' roles do not apply.
- Missing, loading, failed or unknown role data never enables management. Ambiguous display scopes are denied. Backend mutations should use immutable resource IDs and must not trust UI-provided roles or scope names.
- API mode reads memberships from the backend, ignoring local role fixtures and `model.workspaceMemberships`. Local fixtures stay at the bottom of individual pages for development before integration.
- The backend must enforce the same policies for enterprise/group/member mutations, key creation/actions/policy, billing changes, storage/folder mutations and job creation. Return 403 for insufficient privileges. Obtain identity from the authenticated session and authorize every submitted group/key/file ID.
- Decryption remains a permitted read operation requiring the matching key and authorized access. Owner/Admin status does not supply secret material.

## Verification — 2026-11-07

- `npm test`: 28 policy tests pass.
- 82 isolated browser checks pass, including Owner/Admin/Member at 375/768/1440px, settings persistence, direct URLs, anonymous access, Upload, restricted folders and cross-enterprise boundaries.
- Member Overview role badges align in one column. Enterprise role/count badges share the vertical center of Enterprise billing on desktop and wrap on narrow screens. Screenshots were inspected.
- Production build, including TypeScript, passes. Tests use isolated fixtures; live backend authorization has not been implemented or verified in this frontend repository.
- [Browser report](previews/authorization-report.json).

# Frontend architecture

The application uses the Next.js App Router. Every screen is implemented in its
own page.tsx; layouts own the shared application frame. There is no catch-all page
or client component that switches screens based on the pathname.

```text
app/
  layout.tsx                    # HTML, fonts, metadata and root providers
  providers.tsx                 # Client provider composition
  globals.css                   # Tailwind and global base styles
  (site)/                       # Home and public information pages
    layout.tsx                  # Shared navbar, with Home anchor navigation
    page.tsx                    # Home
    documentation/page.tsx
    contact/page.tsx
    privacy/page.tsx
    terms/page.tsx
  (dashboard)/                  # Workflow, account and workspace pages
    layout.tsx                  # Shared navbar and Suspense boundary
    upload/page.tsx
    progress/page.tsx
    completed/page.tsx
    history/page.tsx
    my-file/page.tsx
    key-management/page.tsx
    profile/page.tsx
    credit-cards/page.tsx
    billing/page.tsx
    notifications/page.tsx
    workspace/page.tsx
    workspace/personal/page.tsx
    workspace/enterprise/page.tsx
    my-group/page.tsx
    my-group/[groupId]/page.tsx  # Native dynamic route
    payment/page.tsx            # Compatibility redirect
    my-credit-card/page.tsx     # Compatibility redirect
    manage-account/page.tsx     # Compatibility redirect
  (development)/fhe-test/page.tsx
components/
  layout/                       # Navbar, page frame and security footer
  ui/                           # Shared visual primitives and shadcn components
features/
  jobs/{components,hooks}/     # Reusable job lists, details and collection state
  keys/components/             # Key generation and decryption dialogs
  workspaces/{components,hooks}/ # Group cards, members, dialogs and actions
hooks/                          # Shared context, API data, mobile and toast hooks
providers/                      # Application state and theme providers
types/                          # Domain models and API response types
lib/
  api/client.ts                 # HTTP transport, credentials and API errors
  api/cepp.ts                   # Typed endpoint methods
  fhe/                          # Original OpenFHE JS/WASM companion files
  download.ts                   # Browser downloads
  keys.ts                       # Key metadata and fingerprint helpers
  utils.ts                      # Generic utility functions
styles/cepp.css                 # Shared CEPP design and responsive rules
public/figma/                   # Design assets
docs/                           # Architecture, backend contracts and QA evidence
```

Parenthesized route groups organize source files without changing URLs. For
example, app/(dashboard)/upload/page.tsx still serves /upload. Unknown paths use
Next.js's 404 behavior. /payment and /my-credit-card redirect to /credit-cards;
/manage-account redirects to /profile.

## Responsibilities

- Pages own the screen markup, page-specific interactions and fixtures at the
  bottom of that page's module. They compose reusable fragments from features.
- Layouts own the navbar, so it renders once and persists between sibling routes.
  The root provider retains state across route groups.
- Components contain shared presentation, rather than complete route screens.
- Features contain reusable domain behavior. Hooks accept fixtures from the page;
  API modules never import mock data or UI components.
- Types do not depend on React providers. The HTTP client is separate from typed
  endpoint declarations and from the in-memory/localStorage state provider.

Client components are used where hooks, browser APIs or interactions are needed.
Static informational pages and compatibility redirects remain server components.
Mock data is active only while NEXT_PUBLIC_CEPP_API_URL is unset. Notification
fixtures used by the shared navbar stay at the bottom of that navbar module.

## Adding a page

1. Add app/(site)/your-route/page.tsx or app/(dashboard)/your-route/page.tsx.
2. Put the screen there. Extract only reusable UI or behavior into components or
   the relevant feature. Keep page fixtures below the page export.
3. Add domain types in types/ and endpoint methods in lib/api/cepp.ts as needed.
4. Run npm run build and check the page on mobile and desktop.

Run locally with npm run dev. Production validation uses
npm run build followed by npm run start. The build deliberately
uses webpack to support the existing OpenFHE WASM module.

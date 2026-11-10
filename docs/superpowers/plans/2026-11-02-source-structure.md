# Source structure implementation plan

Goal: Organize the existing Next.js frontend under src/ and give modules names that describe their actual responsibility.

Scope: User request and reference image from 2026-11-02; preserve behavior, URLs, OAuth, environment values and page-local fixtures. Work locally without commits or pushes.

- [x] Inventory current source and preserve a recoverable snapshot outside the repository.
- [x] Move application source into src/; rename (site) to (public) and replace (dashboard) with (application) organized by processing, account, workspace management and redirects.
- [x] Separate shared UI and domain types into named modules; rename application state hooks/providers and helper files; update all imports, @/ mapping and Tailwind source discovery.
- [x] Rewrite architecture documentation and update current integration paths.
- [x] Verify typecheck, production build, unchanged routes and responsive browser flows.

Review focus: Google OAuth route and session composition; account-specific avatar persistence; upload workspace/group selection; dynamic group routes and existing redirects; CSS discovery and mobile layout after moving styles.

Decisions: Keep existing URL segments to avoid breaking user links; Next.js reserved filenames remain unchanged. Do not add unused placeholder routes/configuration. No dependency changes are required.

Verification: production build, typecheck, unused checks, 72 route/viewport checks and 15 flow checks pass. Original OAuth handler, package files and application stylesheet preserved. Generated old dev types archived with the source backup to remove stale route imports.

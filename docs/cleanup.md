# New frontend cleanup — 2026-10-23

The cleanup was applied to C:/Users/gigabyte/Documents/FHEFrontend on local main.
GitHub origin/main was fetched and verified at 9bcd685 (frontend_draft1).
The update to main was a fast-forward; the current Figma pages were already present.
No Git history was reset or rewritten, and no commit or push was performed.

## Removed legacy source

- 64 files not used by the current Figma application, including the old /fhe-test
  route, its JS/WASM files, unused generated UI components, hooks and theme provider.
- The obsolete shadcn generator configuration and duplicate pnpm lockfile.
- Unused animation classes, theme tokens and the old WASM webpack overrides.
- Unused npm dependencies. package-lock.json is the sole dependency lockfile.
- Conflict markers in .gitignore. The example environment file remains trackable.
- The scaffold lint command, which referenced an uninstalled ESLint executable;
  npm run typecheck now provides a working source check.

All current Figma route screens and their referenced components, features, domain
models, mock fixtures and backend API adapter are retained. /fhe-test now returns 404.

## Verification

- npm ci --ignore-scripts --no-audit --no-fund passes from the cleaned lockfile.
- npm run build and npm run typecheck pass.
- 21 routes checked at 375, 768 and 1440px: 63 route/viewport checks.
- No client exceptions, broken rendered images, duplicate navbars or horizontal overflow.
- Login, sticky/smooth Home navigation, history search, group routing, group creation,
  local key backup, upload processing and state restoration after reload pass.
- [Browser report](previews/cleanup-report.json); screenshots have a cleanup- prefix.

## Recovery and checkout distinction

Before cleanup, the complete committed source and repository history were archived at:
C:/Users/gigabyte/AppData/Local/Temp/FHEFrontend-before-main-cleanup-8228802734d245a98acc0e5dcb07aeef

The source ZIP, Git bundle and cleanup manifest allow recovery of removed material.
The separate checkout at C:/Users/gigabyte/Documents/ChatGPT/Zero Trust Face Detection
still contains older source. It was not the target of this repair. Open FHEFrontend
for the current implementation.

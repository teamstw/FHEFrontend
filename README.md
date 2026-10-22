# CEPP — Zero Trust Face Detection

Next.js frontend based on the CEPP Figma design.

## Local development

```powershell
npm install
npm run dev
```

Open http://localhost:3000. Leave NEXT_PUBLIC_CEPP_API_URL unset for page-local
Figma fixtures; see [.env.example](.env.example) before connecting a backend.

- [Folder structure and responsibilities](docs/architecture.md)
- [Backend integration contracts](docs/backend-integration.md)
- [Verification and preview reports](docs/verification.md)

Build with `npm run build`; serve with `npm run start`.

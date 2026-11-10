# โครงสร้าง Frontend

ใช้ Next.js App Router โดยเก็บ source code ใน src/ ส่วน public/, docs/ และไฟล์ตั้งค่าอยู่ที่ root
หน้าของเว็บไซต์อยู่ใน src/app/ และมี UI ของหน้านั้นใน page.tsx โดยตรง

```text
FHEFrontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx                         # HTML, fonts, metadata, providers
│   │   ├── (public)/                         # หน้าสาธารณะ
│   │   │   ├── layout.tsx                     # Navbar พร้อม Home anchors
│   │   │   ├── page.tsx                       # Home
│   │   │   ├── contact/page.tsx
│   │   │   ├── documentation/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   └── terms/page.tsx
│   │   ├── (application)/                    # หน้าการใช้งานและจัดการบัญชี
│   │   │   ├── layout.tsx                     # Navbar และ Suspense
│   │   │   ├── (processing)/                 # ขั้นตอนประมวลผลไฟล์
│   │   │   │   ├── choose-workspace/page.tsx
│   │   │   │   ├── upload/page.tsx
│   │   │   │   ├── progress/page.tsx
│   │   │   │   └── completed/page.tsx
│   │   │   ├── (account)/                    # ข้อมูลและรายการของผู้ใช้
│   │   │   │   ├── history/page.tsx
│   │   │   │   ├── history/[jobId]/page.tsx  # รายละเอียดงานจาก History
│   │   │   │   ├── my-file/page.tsx
│   │   │   │   ├── profile/page.tsx
│   │   │   │   ├── credit-cards/page.tsx
│   │   │   │   ├── billing/page.tsx
│   │   │   │   └── notifications/page.tsx
│   │   │   ├── (workspace-management)/       # Workspace, กลุ่ม, สมาชิกและ Key
│   │   │   │   ├── workspace/page.tsx
│   │   │   │   ├── workspace/personal/page.tsx
│   │   │   │   ├── workspace/enterprise/page.tsx
│   │   │   │   ├── my-group/page.tsx
│   │   │   │   ├── my-group/[groupId]/page.tsx
│   │   │   │   └── key-management/page.tsx
│   │   │   └── (redirects)/                  # รองรับลิงก์เก่า
│   │   │       ├── manage-account/page.tsx
│   │   │       ├── my-credit-card/page.tsx
│   │   │       └── payment/page.tsx
│   │   └── api/auth/[...nextauth]/route.ts   # NextAuth / Google OAuth
│   ├── components/
│   │   ├── layout/                          # Navbar, PageShell, SecurityFooter
│   │   └── ui/                              # UI กลาง แยกหนึ่งหน้าที่ต่อไฟล์
│   │       ├── app-icon.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── checkbox.tsx
│   │       ├── detail-rows.tsx
│   │       ├── modal.tsx
│   │       ├── notice.tsx
│   │       ├── panel.tsx
│   │       ├── select.tsx
│   │       ├── tabs.tsx
│   │       ├── text-field.tsx
│   │       └── user-avatar.tsx
│   ├── features/
│   │   ├── files/{components,hooks}/        # Original files, folders, library actions
│   │   ├── jobs/{components,hooks}/         # รายการงาน, รายละเอียด, ขั้นตอน
│   │   ├── keys/components/                 # สร้าง Key และถอดรหัส
│   │   └── workspaces/{components,hooks}/   # กลุ่ม, สมาชิก, การเลือกและจัดการ
│   ├── hooks/
│   │   ├── use-api-data.ts                  # useApiData: โหลด backend หรือ fixtures
│   │   └── use-app-state.ts                 # useAppState: อ่าน/แก้ shared state
│   ├── providers/
│   │   ├── app-providers.tsx                # SessionProvider, state, toast
│   │   └── app-state-provider.tsx           # Shared state และ browser persistence
│   ├── lib/
│   │   ├── api/
│   │   │   ├── backend-api.ts               # Typed backend endpoints
│   │   │   └── http-client.ts               # URL, fetch, cookies, API errors
│   │   ├── avatar-image.ts                  # ตรวจ/ย่อรูปและเก็บ avatar
│   │   ├── file-download.ts                 # ดาวน์โหลดผ่าน browser
│   │   ├── group-membership.ts              # Enterprise affiliation ของกลุ่ม
│   │   ├── key-metadata.ts                  # Mask key ID และ fingerprint
│   │   └── save-feedback.ts                 # ข้อความหลังบันทึก
│   ├── styles/
│   │   ├── globals.css                      # Tailwind, tokens, base styles
│   │   └── application.css                  # CEPP UI และ responsive rules
│   └── types/
│       ├── app-state.ts                     # AppState และ AppStore
│       ├── billing.ts                       # บัตร, การเรียกเก็บเงิน
│       ├── file-storage.ts                  # Original file และ Folder contracts
│       ├── job.ts                           # งานประมวลผล
│       ├── key.ts                           # Key และวิธีจัดเก็บ
│       ├── notification.ts                  # การแจ้งเตือน
│       ├── workspace.ts                     # Workspace, Group, Member
│       └── styles.d.ts                      # Type declaration ของ CSS import
├── public/figma/                            # Assets จาก Figma
├── docs/                                    # คู่มือและผลตรวจ
├── .env.example                             # ตัวอย่าง environment
├── .env.local                               # ค่า local รวม OAuth (ไม่ commit)
├── next.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── package.json
└── package-lock.json
```

## กติกาการตั้งชื่อและแบ่งหน้าที่

- ชื่อไฟล์ทั่วไปใช้ kebab-case เช่น user-avatar.tsx และ use-app-state.ts
- React components ใช้ PascalCase เช่น PageShell และ KeyGenerationDialog
- Hooks ขึ้นต้นด้วย use เช่น useApiData และ useWorkspaceManagement
- page.tsx, layout.tsx และ route.ts เป็นชื่อพิเศษของ Next.js จึงคงชื่อนี้
- โฟลเดอร์ในวงเล็บเป็น route group ไม่ปรากฏใน URL เช่น
  src/app/(application)/(processing)/upload/page.tsx ให้บริการที่ /upload
- ชื่อ route เดิม เช่น my-file และ my-group คงไว้เพื่อให้ลิงก์เดิมและ dynamic
  group URL ทำงานต่อ ไม่ได้สร้างหน้า Dashboard หรือ route /dashboard
- Route groups ใช้จัดไฟล์เท่านั้น ไม่ใช่ระบบตรวจสิทธิ์; OAuth ยังใช้ NextAuth เดิม
- @/ ชี้ไปที่ src/ เช่น @/components/ui/button

## เพิ่มหรือแก้หน้าอย่างไร

1. เลือกหมวดใน src/app/ ตามหน้าที่ แล้วสร้างชื่อ-route/page.tsx
2. เขียน UI และ interaction ของหน้านั้นใน page.tsx เก็บ mock ไว้ท้ายไฟล์นั้น
3. UI ที่ใช้ซ้ำทั่วไปอยู่ components/ui/; UI หรือ hooks เฉพาะงานที่ใช้ซ้ำอยู่ features/
4. เพิ่มชนิดข้อมูลใน src/types/ ตาม domain และ endpoint ใน src/lib/api/backend-api.ts
5. ตรวจด้วย npm run typecheck และ npm run build แล้วลอง flow ที่เกี่ยวข้อง

ไม่สร้างไฟล์ loading.tsx, error.tsx, not-found.tsx, db.ts หรือ tailwind.config.ts
เปล่า ๆ เพียงให้เหมือนภาพตัวอย่าง โครงการใช้ Suspense และ 404 ของ Next.js อยู่แล้ว
และใช้ Tailwind 4 ผ่าน PostCSS ซึ่งตั้งค่าใน CSS ได้

## สิ่งที่คงไว้ในการจัดโครงสร้าง

URL เดิมทั้ง 24 หน้ายังเดิม และเพิ่ม /history/[jobId] สำหรับรายละเอียดงาน รวม redirect /payment และ /my-credit-card ไป /credit-cards
และ /manage-account ไป /profile พร้อม Google OAuth callback /api/auth/callback/google
ค่า environment, browser storage keys, สัญญา backend, page-local fixtures และไฟล์ assets
คงเดิม การย้ายโครงสร้างไม่ได้ commit หรือ push

หากมี dev server เปิดอยู่ก่อนย้ายไฟล์ ให้ปิด instance เดิมแล้วรัน npm run dev ใหม่
หลังย้าย root app/ เป็น src/app/ เพื่อให้ Next.js ตรวจพบตำแหน่งใหม่

My File storage and folder behavior: [file-library.md](file-library.md).

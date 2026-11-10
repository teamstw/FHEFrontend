import { PageShell } from "@/components/layout/page-shell";
import { Notice } from "@/components/ui/notice";
export default function ContactPage() {
  return (
    <PageShell title="Contact" description="Zero Trust Face Detection">
      <Notice title="Contact information">
        ยังไม่ได้กำหนดข้อมูลติดต่อจาก backend
      </Notice>
    </PageShell>
  );
}

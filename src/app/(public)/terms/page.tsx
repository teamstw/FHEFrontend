import { PageShell } from "@/components/layout/page-shell";
import { Notice } from "@/components/ui/notice";
export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Service"
      description="CEPP / Zero Trust Face Detection"
    >
      <Notice title="Content awaiting publication">
        เนื้อหานโยบายฉบับจริงยังไม่ถูกกำหนดใน Figma
        กรุณาเพิ่มเอกสารที่ได้รับอนุมัติก่อนเปิดใช้งานจริง
      </Notice>
    </PageShell>
  );
}

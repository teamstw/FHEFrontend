import { Shell } from "@/components/layout/page-shell";
import { Notice } from "@/components/ui/cepp";
export default function Page() {
  return (
    <Shell title="Privacy" description="CEPP / Zero Trust Face Detection">
      <Notice title="Content awaiting publication">
        เนื้อหานโยบายฉบับจริงยังไม่ถูกกำหนดใน Figma
        กรุณาเพิ่มเอกสารที่ได้รับอนุมัติก่อนเปิดใช้งานจริง
      </Notice>
    </Shell>
  );
}

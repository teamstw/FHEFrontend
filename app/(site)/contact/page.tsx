import { Shell } from "@/components/layout/page-shell";
import { Notice } from "@/components/ui/cepp";
export default function Page() {
  return (
    <Shell title="Contact" description="Zero Trust Face Detection">
      <Notice title="Contact information">
        ยังไม่ได้กำหนดข้อมูลติดต่อจาก backend
      </Notice>
    </Shell>
  );
}

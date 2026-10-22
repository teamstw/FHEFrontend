import { Shell } from "@/components/layout/page-shell";
import { Notice } from "@/components/ui/cepp";
export default function Page() {
  return (
    <Shell title="Notifications" description="การแจ้งเตือน">
      <Notice title="Notifications">
        เปิดปุ่มกระดิ่งเพื่อดูงานที่เสร็จแล้ว งานที่กำลังประมวลผล และคำเชิญกลุ่ม
      </Notice>
    </Shell>
  );
}

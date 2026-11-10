import { PageShell } from "@/components/layout/page-shell";
import { Notice } from "@/components/ui/notice";
export default function DocumentationPage() {
  return (
    <PageShell title="Documentation" description="Zero Trust Face Detection">
      <Notice title="Workflow">
        Upload files → choose a workspace → select Local Storage, Cloud KMS or
        BYOK → preview processing → validate the original job key. Configure the
        backend to use real FHE computation.
      </Notice>
    </PageShell>
  );
}

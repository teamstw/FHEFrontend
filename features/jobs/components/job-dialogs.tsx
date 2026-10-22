"use client";
import { Modal, Notice, Rows } from "@/components/ui/cepp";
import { type JobCollectionState } from "@/features/jobs/hooks/use-job-collection";
import { DecryptFlow } from "@/features/keys/components/decryption-dialog";
export function JobDialogs({ state }: { state: JobCollectionState }) {
  const { selected, decrypt, setDecrypt, view, setView, setDecrypted } = state;
  return (
    <>
      {selected && (
        <DecryptFlow
          job={selected}
          open={decrypt}
          onClose={() => setDecrypt(false)}
          onDone={() => setDecrypted((prev) => [...prev, selected.id])}
        />
      )}
      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title={view?.result || "File details"}
        description="Encrypted result metadata"
      >
        <Rows
          rows={[
            ["Size", view?.size],
            ["Workspace", view?.scope],
            ["Key / version", `${view?.keyId} / v${view?.version}`],
            ["Status", view?.status],
          ]}
        />
        <Notice title="Encrypted preview">
          Decrypt using the original key to access result contents. The design
          fixture contains metadata only.
        </Notice>
      </Modal>
    </>
  );
}

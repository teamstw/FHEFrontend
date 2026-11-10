"use client";
import { Modal } from "@/components/ui/modal";
import { Notice } from "@/components/ui/notice";
import { DetailRows } from "@/components/ui/detail-rows";
import { type JobCollectionState } from "@/features/jobs/hooks/use-job-collection";
import { DecryptionDialog } from "@/features/keys/components/decryption-dialog";
export function JobDialogs({ state }: { state: JobCollectionState }) {
  const { selected, decrypt, setDecrypt, view, setView, source } = state;
  return (
    <>
      {selected && (
        <DecryptionDialog
          job={selected}
          open={decrypt}
          onClose={() => setDecrypt(false)}
          onDone={() => void source.refresh()}
        />
      )}
      <Modal
        open={!!view}
        onClose={() => setView(null)}
        title={view?.result || "File details"}
        description={
          view?.decrypted ? "Result metadata" : "Encrypted result metadata"
        }
      >
        <DetailRows
          rows={[
            ["Size", view?.size],
            ["Workspace", view?.scope],
            ...(view?.groupNames?.length
              ? [["Groups", view.groupNames.join(", ")] as [string, string]]
              : []),
            ["Key / version", `${view?.keyId} / v${view?.version}`],
            ["Status", view?.status],
            ["Encryption", view?.decrypted ? "Decrypted" : "Encrypted"],
          ]}
        />
        {!view?.decrypted && (
          <Notice title="Encrypted preview">
            Decrypt using the original key to access result contents.
          </Notice>
        )}
      </Modal>
    </>
  );
}

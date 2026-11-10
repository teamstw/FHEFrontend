"use client";
import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="cepp-overlay" />
        <Dialog.Content
          className={"cepp-modal " + (wide ? "wide" : "")}
          aria-describedby={description ? "modal-description" : undefined}
        >
          <Dialog.Close className="cepp-close" aria-label="Close dialog">
            ×
          </Dialog.Close>
          {eyebrow && <p className="cepp-eyebrow">{eyebrow}</p>}
          <Dialog.Title className="cepp-modal-title">{title}</Dialog.Title>
          {description && (
            <Dialog.Description id="modal-description">
              {description}
            </Dialog.Description>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

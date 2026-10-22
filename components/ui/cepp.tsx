"use client";
import * as Dialog from "@radix-ui/react-dialog";
import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { toast } from "sonner";
export function Button({
  children,
  secondary = false,
  danger = false,
  small = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  secondary?: boolean;
  danger?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      className={`cepp-button ${secondary ? "secondary" : ""} ${danger ? "danger" : ""} ${small ? "small" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function Panel({
  title,
  children,
  className = "",
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={"cepp-panel " + className}>
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}
export function Notice({
  title,
  children,
  warning = false,
  action,
}: {
  title: string;
  children: ReactNode;
  warning?: boolean;
  action?: ReactNode;
}) {
  return (
    <aside className={"cepp-notice " + (warning ? "warning" : "")}>
      <strong>{title}</strong>
      <p>{children}</p>
      {action && <div className="cepp-notice-actions">{action}</div>}
    </aside>
  );
}
export function Badge({
  children,
  tone = "cyan",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={"cepp-badge " + tone}>{children}</span>;
}
export function Field({
  label,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="cepp-field">
      <span>{label}</span>
      <input aria-label={label} {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  options: (string | { value: string; label: string })[];
}) {
  return (
    <label className="cepp-field">
      <span>{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}
export function Check({
  children,
  checked,
  onChange,
  disabled = false,
}: {
  children: ReactNode;
  checked: boolean;
  onChange: (b: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="cepp-check">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span>{children}</span>
    </label>
  );
}
export function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="cepp-rows">
      {rows.map(([name, value], i) => (
        <div key={i}>
          <dt>{name}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <div className="cepp-tabs" role="tablist">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          role="tab"
          aria-selected={value === item}
          className={value === item ? "active" : ""}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
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
export const saved = () => toast.success("Saved on this browser");

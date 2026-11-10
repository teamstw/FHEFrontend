"use client";
import type { ReactNode } from "react";
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

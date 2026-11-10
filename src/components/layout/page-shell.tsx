"use client";
import { SecurityFooter } from "@/components/layout/security-footer";
import { type ReactNode } from "react";
export function PageShell({
  title,
  description,
  section = "Account",
  children,
  action,
  wide = false,
}: {
  title: string;
  description: string;
  section?: string;
  children: ReactNode;
  action?: ReactNode;
  wide?: boolean;
}) {
  return (
    <main className={"cepp-content " + (wide ? "wide" : "")}>
      <p className="cepp-eyebrow">{section} / CEPP</p>
      <div className="cepp-row cepp-heading">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {action}
      </div>
      {children}
      <SecurityFooter />
    </main>
  );
}

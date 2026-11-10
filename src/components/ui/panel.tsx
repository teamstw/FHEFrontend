"use client";
import type { ReactNode } from "react";
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

"use client";
import type { ReactNode } from "react";
export function Badge({
  children,
  tone = "cyan",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={"cepp-badge " + tone}>{children}</span>;
}

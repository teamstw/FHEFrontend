"use client";
import { Navbar } from "@/components/layout/navbar";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
export default function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="cepp-app">
      <Navbar home={pathname === "/"} />
      {children}
    </div>
  );
}

"use client";
import { CeppProvider } from "@/providers/cepp-provider";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CeppProvider>
      {children}
      <Toaster theme="dark" richColors position="bottom-right" />
    </CeppProvider>
  );
}

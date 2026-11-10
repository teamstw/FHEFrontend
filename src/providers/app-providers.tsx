"use client";
import { SessionProvider } from "next-auth/react";
import { AppStateProvider } from "@/providers/app-state-provider";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AppStateProvider>
        {children}
        <Toaster theme="dark" richColors position="bottom-right" />
      </AppStateProvider>
    </SessionProvider>
  );
}

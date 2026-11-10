import { Navbar } from "@/components/layout/navbar";
import { Suspense, type ReactNode } from "react";
export default function ApplicationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="cepp-app">
      <Navbar />
      <Suspense fallback={<main className="cepp-content">Loading…</main>}>
        {children}
      </Suspense>
    </div>
  );
}

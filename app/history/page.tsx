"use client"

import { Clock, ChevronRight, Shield, CheckCircle2, Loader2 } from "lucide-react"
import { AppNavbar } from "@/components/app-navbar"
import { GridBackground } from "@/components/grid-background"

const orders = [
  {
    id: "ORD-2026-001",
    title: "Face Detection - Batch 1",
    description: "ประมวลผลภาพ 24 รูป ด้วยระบบ FHE Face Detection สำเร็จ ข้อมูลผ่านการเข้ารหัสตลอดกระบวนการ",
    status: "completed" as const,
    date: "28 Feb 2026",
    files: 24,
  },
  {
    id: "ORD-2026-002",
    title: "Face Detection - Surveillance Set",
    description: "ประมวลผลวิดีโอจากระบบ CCTV 3 ไฟล์ ด้วยเทคโนโลยี Fully Homomorphic Encryption",
    status: "completed" as const,
    date: "25 Feb 2026",
    files: 3,
  },
  {
    id: "ORD-2026-003",
    title: "Face Detection - Drone Footage",
    description: "กำลังประมวลผลภาพถ่ายทางอากาศจากโดรน ด้วยระบบ Zero Trust Face Detection",
    status: "processing" as const,
    date: "2 Mar 2026",
    files: 12,
  },
]

export default function HistoryPage() {
  return (
    <div className="relative min-h-screen">
      <GridBackground />
      <AppNavbar />

      <main className="relative mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">History</h1>
            <p className="text-sm text-muted-foreground">{'ประวัติการทำรายการทั้งหมด'}</p>
          </div>
        </div>

        {/* Order list */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="group overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/70"
            >
              <div className="flex items-start gap-4 p-5">
                {/* Status icon */}
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  order.status === "completed"
                    ? "bg-accent/10 ring-1 ring-accent/30"
                    : "bg-primary/10 ring-1 ring-primary/30"
                }`}>
                  {order.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-foreground">{order.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      order.status === "completed"
                        ? "bg-accent/10 text-accent ring-1 ring-accent/20"
                        : "bg-primary/10 text-primary ring-1 ring-primary/20"
                    }`}>
                      {order.status === "completed" ? "Completed" : "Processing"}
                    </span>
                  </div>
                  <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
                    {order.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-mono">{order.id}</span>
                    <span>{order.date}</span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3 text-accent" />
                      {order.files} files
                    </span>
                  </div>
                </div>

                {/* Detail button */}
                <button className="flex shrink-0 items-center gap-1 rounded-lg border border-border/50 bg-secondary/50 px-4 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/10 hover:ring-1 hover:ring-primary/30">
                  Detail
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

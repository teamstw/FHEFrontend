"use client"

import { FolderOpen, FileImage, Eye, Download, Shield, Clock } from "lucide-react"
import { AppNavbar } from "@/components/app-navbar"
import { GridBackground } from "@/components/grid-background"

const files = [
  {
    id: 1,
    name: "batch_result_001.enc",
    description: "ผลลัพธ์การตรวจจับใบหน้า Batch 1 - 24 ภาพ ผ่านการเข้ารหัส FHE",
    size: "12.4 MB",
    date: "28 Feb 2026",
    type: "result",
  },
  {
    id: 2,
    name: "surveillance_analysis.enc",
    description: "ผลวิเคราะห์วิดีโอ CCTV 3 ไฟล์ ด้วย Zero Trust Face Detection",
    size: "48.2 MB",
    date: "25 Feb 2026",
    type: "result",
  },
  {
    id: 3,
    name: "drone_footage_raw.enc",
    description: "ไฟล์ภาพถ่ายทางอากาศจากโดรน กำลังรอผลการประมวลผล",
    size: "156.8 MB",
    date: "2 Mar 2026",
    type: "pending",
  },
]

export default function MyFilePage() {
  return (
    <div className="relative min-h-screen">
      <GridBackground />
      <AppNavbar />

      <main className="relative mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My File</h1>
            <p className="text-sm text-muted-foreground">{'ไฟล์ผลลัพธ์ทั้งหมดของคุณ'}</p>
          </div>
        </div>

        {/* File list */}
        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="group overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/70"
            >
              <div className="flex items-start gap-4 p-5">
                {/* File icon */}
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
                  <FileImage className="h-4 w-4 text-primary" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-foreground font-mono">{file.name}</h3>
                    <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent ring-1 ring-accent/20">
                      <Shield className="h-2.5 w-2.5" />
                      Encrypted
                    </span>
                  </div>
                  <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
                    {file.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{file.size}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {file.date}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex shrink-0 gap-2">
                  <button className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/50 px-4 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/10 hover:ring-1 hover:ring-primary/30">
                    <Eye className="h-3 w-3" />
                    View
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/20">
                    <Download className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

"use client"

import { CheckCircle2, Download, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"
import { AppNavbar } from "@/components/app-navbar"
import { StepIndicator } from "@/components/step-indicator"
import { GridBackground } from "@/components/grid-background"

export default function CompletedPage() {
  return (
    <div className="relative min-h-screen">
      <GridBackground />
      <AppNavbar />

      <main className="relative mx-auto max-w-4xl px-6 py-12">
        <div className="mb-16 mt-4">
          <StepIndicator currentStep={4} />
        </div>

        <div className="mx-auto flex max-w-md flex-col items-center">
          {/* Success animation */}
          <div className="relative mb-10">
            {/* Glow behind */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
            </div>
            {/* Rotating rings */}
            <div className="animate-rotate-slow absolute -inset-6 rounded-full border border-dashed border-accent/20" />

            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
              <CheckCircle2 className="h-14 w-14 text-accent" />
            </div>
          </div>

          {/* Text */}
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            {'ประมวลผลเสร็จสิ้น!'}
          </h2>
          <p className="mb-8 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
            {'การตรวจจับใบหน้าบนข้อมูลที่เข้ารหัสเสร็จสมบูรณ์ ข้อมูลของคุณยังคงปลอดภัยตลอดกระบวนการ'}
          </p>

          {/* Security badge */}
          <div className="mb-10 flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-2">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-accent">{'ข้อมูลไม่ถูกถอดรหัสในทุกขั้นตอน'}</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110">
              <Download className="h-4 w-4" />
              {'ดาวน์โหลดผลลัพธ์'}
            </button>
            <Link
              href="/my-file"
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/50 px-8 py-3.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-secondary"
            >
              {'ดูไฟล์ของฉัน'}
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

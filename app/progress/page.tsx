"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ScanFace, Shield, Lock } from "lucide-react"
import { AppNavbar } from "@/components/app-navbar"
import { StepIndicator } from "@/components/step-indicator"
import { GridBackground } from "@/components/grid-background"

export default function ProgressPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => router.push("/completed"), 800)
          return 100
        }
        return prev + Math.random() * 3 + 1
      })
    }, 200)
    return () => clearInterval(interval)
  }, [router])

  const clampedProgress = Math.min(Math.round(progress), 100)

  return (
    <div className="relative min-h-screen">
      <GridBackground />
      <AppNavbar />

      <main className="relative mx-auto max-w-4xl px-6 py-12">
        <div className="mb-16 mt-4">
          <StepIndicator currentStep={3} />
        </div>

        <div className="mx-auto flex max-w-md flex-col items-center">
          {/* Animated processing visual */}
          <div className="relative mb-12">
            {/* Outer rotating ring */}
            <div className="animate-rotate-slow absolute -inset-6 rounded-full border border-dashed border-primary/20" />
            <div className="animate-rotate-slow absolute -inset-12 rounded-full border border-dashed border-accent/10" style={{ animationDirection: "reverse" }} />

            {/* Main circle */}
            <div className="relative flex h-32 w-32 items-center justify-center">
              {/* Progress ring */}
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-border"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 58}`}
                  strokeDashoffset={`${2 * Math.PI * 58 * (1 - clampedProgress / 100)}`}
                  className="text-primary transition-all duration-300"
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(100, 180, 255, 0.4))",
                  }}
                />
              </svg>

              {/* Center icon */}
              <div className="animate-pulse-glow flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
                <ScanFace className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>

          {/* Status text */}
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              {clampedProgress < 100 ? "In Progress..." : "Complete!"}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {'กำลังประมวลผลด้วยเทคโนโลยี FHE บนข้อมูลที่เข้ารหัส'}
            </p>

            {/* Progress percentage */}
            <div className="mb-4 font-mono text-4xl font-bold text-primary">
              {clampedProgress}%
            </div>

            {/* Progress bar */}
            <div className="mx-auto h-2 w-64 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{
                  width: `${clampedProgress}%`,
                  boxShadow: "0 0 12px rgba(100, 180, 255, 0.4)",
                }}
              />
            </div>
          </div>

          {/* Info tags */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm">
              <Shield className="h-3.5 w-3.5 text-accent" />
              {'ข้อมูลยังคงเข้ารหัสอยู่'}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-3 py-2 text-xs text-muted-foreground backdrop-blur-sm">
              <Lock className="h-3.5 w-3.5 text-primary" />
              {'Zero Trust Mode'}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

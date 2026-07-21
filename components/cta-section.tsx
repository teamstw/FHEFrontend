"use client"

import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 px-8 py-20 text-center backdrop-blur-sm md:px-16">
          {/* Glow effects */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-accent/5 blur-3xl" aria-hidden="true" />

          <div className="relative">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/30">
              <Shield className="h-7 w-7 text-primary" />
            </div>

            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {'พร้อมเริ่มต้นใช้งาน?'}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground leading-relaxed">
              {'เริ่มต้นปกป้องข้อมูลของคุณด้วยเทคโนโลยี Zero Trust Face Detection วันนี้'}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/upload" className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/50 px-8 py-3.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-secondary">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import { Upload, Lock, Cpu, Download } from "lucide-react"

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Data Ingestion",
    description: "รับข้อมูลภาพหรือวิดีโอ และทำการเข้ารหัสด้วย FHE ทันที",
  },
  {
    icon: Lock,
    step: "02",
    title: "FHE Encryption",
    description: "ข้อมูลถูกเข้ารหัสอย่างสมบูรณ์ด้วย Fully Homomorphic Encryption",
  },
  {
    icon: Cpu,
    step: "03",
    title: "Encrypted Processing",
    description: "AI ประมวลผล Face Detection บนข้อมูลที่เข้ารหัส โดยไม่ต้องถอดรหัส",
  },
  {
    icon: Download,
    step: "04",
    title: "Secure Output",
    description: "ส่งผลลัพธ์ที่เข้ารหัสกลับ ถอดรหัสได้เฉพาะผู้ที่มีสิทธิ์เท่านั้น",
  },
]

export function ProcessSection() {
  return (
    <section className="relative py-32" id="process">
      {/* Divider line */}
      <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-5xl bg-border/50" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">Process</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {'ขั้นตอนการทำงาน'}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground leading-relaxed">
            {'กระบวนการที่ปลอดภัยตั้งแต่ต้นจนจบ ไม่มีจุดใดที่ข้อมูลถูกเปิดเผย'}
          </p>
        </div>

        {/* Process steps */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.step} className="group relative">
                {/* Connection line (horizontal for desktop) */}
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-12 hidden h-px w-6 bg-border/50 lg:block" style={{ transform: "translateX(100%)" }} />
                )}

                <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/80">
                  {/* Step number watermark */}
                  <div className="absolute -right-2 -top-4 font-mono text-6xl font-black text-foreground/3">
                    {s.step}
                  </div>

                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-all group-hover:bg-primary/15 group-hover:ring-primary/40">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <p className="mb-1 font-mono text-xs text-accent">Step {s.step}</p>
                    <h3 className="mb-2 text-base font-semibold text-foreground">{s.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

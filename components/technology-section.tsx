"use client"

import { ArrowRight } from "lucide-react"

export function TechnologySection() {
  return (
    <section className="relative py-32" id="technology">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: Info content */}
          <div>
            <p className="mb-3 text-xs font-semibold tracking-widest text-accent uppercase">Technology</p>
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {'Fully Homomorphic Encryption'}
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                {'ในยุคที่ปฏิบัติการทางทหารต้องพึ่งพาข้อมูลข่าวกรองเชิงลึก ไม่ว่าจะเป็นภาพถ่ายใบหน้าเป้าหมาย หรือวิดีโอสดแบบจากโดรน การนำ AI มาช่วยวิเคราะห์ข้อมูลคือสิ่งจำเป็น'}
              </p>
              <p>
                {'แต่เทคโนโลยีแบบดั้งเดิมมีข้อจำกัดที่อันตราย คือ ต้องทำการถอดรหัสข้อมูล (Decryption) ให้อยู่ในรูปไฟล์ปกติก่อนประมวลผลเสมอ'}
              </p>
              <p>
                {'ด้วยเทคโนโลยีการเข้ารหัสแบบ Fully Homomorphic Encryption (FHE) เพื่อให้ข้อมูลปลอดภัยตลอดทาง ตั้งแต่ รับข้อมูล ระหว่าง process ไปจนถึงการส่งข้อมูล'}
              </p>
            </div>
            <button className="group mt-8 flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110">
              Learn More
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Right: Visual diagram */}
          <div className="relative">
            <EncryptionDiagram />
          </div>
        </div>
      </div>
    </section>
  )
}

function EncryptionDiagram() {
  const steps = [
    { label: "Input Data", sublabel: "Encrypted Image", color: "text-primary" },
    { label: "FHE Processing", sublabel: "No Decryption Needed", color: "text-accent" },
    { label: "AI Analysis", sublabel: "Face Detection", color: "text-primary" },
    { label: "Encrypted Output", sublabel: "Secure Results", color: "text-accent" },
  ]

  return (
    <div className="relative rounded-2xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm">
      {/* Decorative dots */}
      <div className="absolute right-4 top-4 flex gap-1.5">
        <div className="h-2 w-2 rounded-full bg-primary/40" />
        <div className="h-2 w-2 rounded-full bg-accent/40" />
        <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
      </div>

      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step.label}>
            <div className="flex items-center gap-4">
              {/* Step indicator */}
              <div className="relative flex flex-col items-center">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${i === 1 || i === 2 ? "border-accent/40 bg-accent/10" : "border-primary/40 bg-primary/10"}`}>
                  <span className={`font-mono text-sm font-bold ${step.color}`}>{String(i + 1).padStart(2, "0")}</span>
                </div>
              </div>

              {/* Step content */}
              <div className="flex-1 rounded-xl border border-border/30 bg-secondary/30 px-5 py-4 transition-all hover:border-primary/30 hover:bg-secondary/50">
                <p className="text-sm font-semibold text-foreground">{step.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{step.sublabel}</p>
              </div>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="ml-6 flex h-6 items-center">
                <div className="h-full w-px bg-border/50" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="mt-6 flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          <span className="font-mono text-xs text-accent">{'ENCRYPTION: ACTIVE'}</span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{'AES-256 + FHE v2.0'}</span>
      </div>
    </div>
  )
}

"use client"

import { ShieldCheck, Eye, Zap, Lock, Server, FileKey } from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "Zero Trust Architecture",
    description: "ไม่ไว้วางใจข้อมูลใดๆ โดยปริยาย ทุกขั้นตอนผ่านการเข้ารหัสตั้งแต่ต้นจนจบ",
  },
  {
    icon: Eye,
    title: "AI Face Detection",
    description: "ระบบ AI ตรวจจับใบหน้าที่ทำงานบนข้อมูลเข้ารหัสได้โดยตรง โดยไม่ต้องถอดรหัส",
  },
  {
    icon: Lock,
    title: "Fully Homomorphic Encryption",
    description: "เทคโนโลยี FHE ที่ช่วยให้ประมวลผลข้อมูลในสถานะเข้ารหัสได้อย่างสมบูรณ์",
  },
  {
    icon: Zap,
    title: "Real-time Processing",
    description: "ประมวลผลแบบ Real-time ด้วยความเร็วสูง รองรับการทำงานทั้งภาพถ่ายและวิดีโอสด",
  },
  {
    icon: Server,
    title: "Military-grade Security",
    description: "ระดับความปลอดภัยระดับทหาร รองรับการใช้งานในภาคการทหารและข่าวกรอง",
  },
  {
    icon: FileKey,
    title: "End-to-End Encrypted",
    description: "ข้อมูลปลอดภัยตลอดทาง ตั้งแต่รับข้อมูล ระหว่าง process ไปจนถึงการส่งข้อมูล",
  },
]

export function FeaturesSection() {
  return (
    <section className="relative py-32" id="features">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">Features</p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {'เทคโนโลยีที่ปฏิวัติความปลอดภัย'}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground leading-relaxed">
            {'ในยุคที่ปฏิบัติการทางทหารต้องพึ่งพาข้อมูลข่าวกรองเชิงลึก การนำ AI มาช่วยวิเคราะห์ข้อมูลคือสิ่งจำเป็น'}
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const Icon = feature.icon
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Glow on hover */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/0 blur-2xl transition-all duration-500 group-hover:bg-primary/5" />

      <div className="relative">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 transition-all group-hover:ring-primary/40">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
      </div>
    </div>
  )
}

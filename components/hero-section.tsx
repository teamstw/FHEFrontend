"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Lock, ScanFace } from "lucide-react"

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener("resize", resize)

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = []
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      })
    }

    let animationId: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(100, 180, 255, ${p.alpha})`
        ctx.fill()

        // Connection lines
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x
          const dy = p.y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(100, 180, 255, ${0.08 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })
      animationId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden pt-24" id="hero">
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pt-20 lg:pt-32">
        {/* Badge */}
        <div className="animate-fade-in-up mb-8 flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-2 backdrop-blur-sm">
          <Lock className="h-3.5 w-3.5 text-accent" />
          <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Fully Homomorphic Encryption
          </span>
        </div>

        {/* Main heading */}
        <h1 className="animate-fade-in-up text-balance text-center text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl" style={{ animationDelay: "0.1s" }}>
          <span className="text-foreground">Zero </span>
          <span className="text-primary">Trust</span>
          <br />
          <span className="text-foreground">Face Detection</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up mt-8 max-w-2xl text-pretty text-center text-lg leading-relaxed text-muted-foreground md:text-xl" style={{ animationDelay: "0.2s" }}>
          {'ระบบ Face Detection ที่สามารถประมวลผลบนข้อมูลที่ถูกเข้ารหัส (Encrypted Data) หลากหลายรูปแบบได้โดยตรง โดยไม่ต้องผ่านการถอดรหัสก่อนเข้า process'}
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up mt-10 flex flex-col items-center gap-4 sm:flex-row" style={{ animationDelay: "0.3s" }}>
          <Link href="/upload" className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110">
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button className="flex items-center gap-2 rounded-xl border border-border/60 bg-secondary/50 px-8 py-3.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-secondary">
            <ScanFace className="h-4 w-4 text-primary" />
            Learn More
          </button>
        </div>

        {/* Face scan visual */}
        <div className="animate-fade-in-up relative mt-20 w-full max-w-3xl" style={{ animationDelay: "0.5s" }}>
          <FaceScanVisual />
        </div>
      </div>
    </section>
  )
}

function FaceScanVisual() {
  return (
    <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Corner brackets */}
      <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-primary/60" />
      <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-primary/60" />
      <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-primary/60" />
      <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-primary/60" />

      {/* Scan line */}
      <div className="animate-scan-line absolute left-8 right-8 h-0.5 bg-primary/40 shadow-[0_0_20px_rgba(100,180,255,0.3)]" />

      {/* Center face outline */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Rotating ring */}
          <div className="animate-rotate-slow absolute -inset-8 rounded-full border border-dashed border-primary/20" />
          <div className="animate-rotate-slow absolute -inset-16 rounded-full border border-dashed border-accent/10" style={{ animationDirection: "reverse" }} />

          {/* Face icon */}
          <div className="animate-pulse-glow flex h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-primary/5">
            <ScanFace className="h-12 w-12 text-primary/60" />
          </div>
        </div>
      </div>

      {/* Data overlays */}
      <div className="absolute left-6 top-6 font-mono text-xs text-primary/40">
        <div>{'ENCRYPTED_MODE: FHE'}</div>
        <div className="mt-1">{'STATUS: PROCESSING'}</div>
        <div className="mt-1">{'TRUST_LEVEL: ZERO'}</div>
      </div>

      <div className="absolute bottom-6 right-6 text-right font-mono text-xs text-accent/40">
        <div>{'DETECTION: ACTIVE'}</div>
        <div className="mt-1">{'ENCRYPTION: AES-256 + FHE'}</div>
        <div className="mt-1">{'LATENCY: 12ms'}</div>
      </div>

      {/* Grid dots overlay */}
      <svg className="absolute inset-0 h-full w-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="currentColor" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  )
}

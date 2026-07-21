"use client"

import { useEffect, useRef, useState } from "react"

const stats = [
  { value: 99.7, suffix: "%", label: "Detection Accuracy" },
  { value: 12, suffix: "ms", label: "Processing Latency" },
  { value: 256, suffix: "-bit", label: "Encryption Standard" },
  { value: 0, suffix: "", label: "Data Exposure Points", displayValue: "Zero" },
]

function useCountUp(target: number, duration: number, inView: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start * 10) / 10)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, inView])
  return count
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="relative py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="grid divide-y divide-border/30 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
            {stats.map((stat) => (
              <StatItem key={stat.label} stat={stat} inView={inView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StatItem({ stat, inView }: { stat: (typeof stats)[0]; inView: boolean }) {
  const count = useCountUp(stat.value, 2000, inView)

  return (
    <div className="group px-8 py-10 text-center transition-colors hover:bg-secondary/20">
      <div className="mb-2 font-mono text-3xl font-bold text-foreground md:text-4xl">
        {stat.displayValue ? (
          <span className="text-primary">{stat.displayValue}</span>
        ) : (
          <>
            <span className="text-primary">
              {stat.value === Math.floor(stat.value) ? Math.floor(count) : count.toFixed(1)}
            </span>
            <span className="text-muted-foreground">{stat.suffix}</span>
          </>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{stat.label}</p>
    </div>
  )
}

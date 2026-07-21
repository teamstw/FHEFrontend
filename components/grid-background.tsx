"use client"

export function GridBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {/* Animated grid */}
      <div className="absolute inset-0 animate-grid-fade">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/10" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Scan line */}
      <div className="animate-scan-line absolute left-0 right-0 h-px bg-primary/20" />

      {/* Top-left glow */}
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

      {/* Bottom-right glow */}
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

      {/* Center floating orb */}
      <div className="animate-float absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/3 blur-3xl" />
    </div>
  )
}

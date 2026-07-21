"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, Mail, User, Menu, X } from "lucide-react"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
            <Shield className="h-5 w-5 text-primary" />
            <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-medium tracking-tight text-foreground">Zero</span>
            <span className="text-lg font-bold tracking-tight text-primary">Trust</span>
            <span className="text-lg font-medium tracking-tight text-foreground">Face Detection</span>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#technology" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Technology</a>
          <a href="#process" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Process</a>
        </div>

        {/* Right icons */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Messages"
          >
            <Mail className="h-4 w-4" />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Profile"
          >
            <User className="h-4 w-4" />
          </button>
          <Link href="/upload" className="ml-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary ring-1 ring-primary/30 transition-all hover:bg-primary/20">
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4 px-6 py-6">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#technology" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Technology</a>
            <a href="#process" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Process</a>
            <Link href="/upload" className="mt-2 block w-full rounded-lg bg-primary/10 px-4 py-2.5 text-center text-sm font-medium text-primary ring-1 ring-primary/30 transition-all hover:bg-primary/20">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

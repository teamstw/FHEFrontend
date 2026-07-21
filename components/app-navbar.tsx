"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Shield, User, LogOut, Bell, FolderOpen, Clock, Settings, ChevronDown } from "lucide-react"

export function AppNavbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
            <Shield className="h-5 w-5 text-primary" />
            <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-medium tracking-tight text-foreground">Zero</span>
            <span className="text-lg font-bold tracking-tight text-primary">Trust</span>
            <span className="text-lg font-medium tracking-tight text-foreground">Face Detection</span>
          </div>
        </Link>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Profile menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary">
              <User className="h-4 w-4" />
            </div>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl shadow-black/40 backdrop-blur-xl">
              {/* User info */}
              <div className="flex items-center gap-3 border-b border-border/50 px-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Test User</p>
                  <p className="text-xs text-muted-foreground">@user1</p>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-2">
                <DropdownItem href="/profile" icon={User} label="Profile" />
                <DropdownItem href="/manage-account" icon={Settings} label="Manage Account" />
                <DropdownItem href="/notifications" icon={Bell} label="Notification" />
                <DropdownItem href="/history" icon={Clock} label="History" />
                <DropdownItem href="/my-file" icon={FolderOpen} label="My File" />
              </div>

              {/* Logout */}
              <div className="border-t border-border/50 py-2">
                <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10">
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}

function DropdownItem({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </Link>
  )
}

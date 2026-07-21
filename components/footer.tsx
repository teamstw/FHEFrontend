import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Zero <span className="text-primary">Trust</span> Face Detection
            </span>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Terms</a>
            <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Documentation</a>
            <a href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">Contact</a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            {'2026 Zero Trust FD. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  )
}

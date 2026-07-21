"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, QrCode, Lock } from "lucide-react"
import { AppNavbar } from "@/components/app-navbar"
import { StepIndicator } from "@/components/step-indicator"
import { GridBackground } from "@/components/grid-background"

export default function PaymentPage() {
  const router = useRouter()
  const [method, setMethod] = useState<"card" | "qr">("card")
  const [form, setForm] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  })

  function handleConfirm() {
    router.push("/progress")
  }

  return (
    <div className="relative min-h-screen">
      <GridBackground />
      <AppNavbar />

      <main className="relative mx-auto max-w-4xl px-6 py-12">
        <div className="mb-16 mt-4">
          <StepIndicator currentStep={2} />
        </div>

        <div className="mx-auto max-w-lg">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
            {/* Header */}
            <div className="border-b border-border/50 px-6 py-5">
              <h2 className="text-lg font-semibold text-foreground">Select Payment Method</h2>
            </div>

            {/* Method tabs */}
            <div className="border-b border-border/50">
              <button
                onClick={() => setMethod("card")}
                className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${
                  method === "card"
                    ? "border-b-2 border-primary bg-primary/5 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Credit/Debit Card
              </button>
              <button
                onClick={() => setMethod("qr")}
                className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors ${
                  method === "qr"
                    ? "border-b-2 border-primary bg-primary/5 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <QrCode className="h-4 w-4" />
                QR PromptPay
              </button>
            </div>

            {/* Form content */}
            <div className="p-6">
              {method === "card" ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Card holder name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                      Credit/debit card number *
                    </label>
                    <input
                      type="text"
                      value={form.number}
                      onChange={(e) => setForm({ ...form, number: e.target.value })}
                      placeholder="0000 0000 0000 0000"
                      className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Expiration date *
                      </label>
                      <input
                        type="text"
                        value={form.expiry}
                        onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                        placeholder="MM/YY"
                        className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        CVV/CVC *
                      </label>
                      <input
                        type="text"
                        value={form.cvv}
                        onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                        placeholder="000"
                        className="w-full rounded-xl border border-border/60 bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Security note */}
                  <div className="flex items-center gap-2 rounded-lg bg-accent/5 px-3 py-2 ring-1 ring-accent/20">
                    <Lock className="h-3.5 w-3.5 text-accent" />
                    <span className="text-xs text-accent">{'การชำระเงินถูกเข้ารหัสด้วยระบบความปลอดภัยสูงสุด'}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 py-8">
                  {/* QR Code placeholder */}
                  <div className="flex h-48 w-48 items-center justify-center rounded-2xl border border-border/50 bg-secondary/30">
                    <div className="flex flex-col items-center gap-3">
                      <QrCode className="h-16 w-16 text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground">QR PromptPay</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {'สแกน QR Code เพื่อชำระเงินผ่าน PromptPay'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Confirm */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleConfirm}
              className="group flex items-center gap-2 rounded-xl bg-primary px-10 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
            >
              Confirm Payment
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

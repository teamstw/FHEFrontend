"use client"

import { Check } from "lucide-react"

const steps = [
  { label: "Upload", step: 1 },
  { label: "Payment", step: 2 },
  { label: "In Progress", step: 3 },
  { label: "Completed", step: 4 },
]

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((s, i) => (
        <div key={s.step} className="flex items-center">
          {/* Step circle + label */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                s.step < currentStep
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                  : s.step === currentStep
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-primary/20"
                    : "border border-border bg-secondary text-muted-foreground"
              }`}
            >
              {s.step < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                s.step
              )}
            </div>
            <span
              className={`text-xs font-medium transition-colors ${
                s.step === currentStep
                  ? "text-primary"
                  : s.step < currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>

          {/* Connector line */}
          {i < steps.length - 1 && (
            <div className="mx-2 mb-6 h-0.5 w-16 sm:w-24">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  s.step < currentStep
                    ? "bg-primary shadow-[0_0_6px_rgba(100,180,255,0.3)]"
                    : "bg-border"
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

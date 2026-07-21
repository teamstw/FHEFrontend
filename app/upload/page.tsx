"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileImage, X, Shield } from "lucide-react"
import { AppNavbar } from "@/components/app-navbar"
import { StepIndicator } from "@/components/step-indicator"
import { GridBackground } from "@/components/grid-background"

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files)
    setFiles((prev) => [...prev, ...dropped])
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    if (files.length > 0) {
      router.push("/payment")
    }
  }

  return (
    <div className="relative min-h-screen">
      <GridBackground />
      <AppNavbar />

      <main className="relative mx-auto max-w-4xl px-6 py-12">
        {/* Step indicator */}
        <div className="mb-16 mt-4">
          <StepIndicator currentStep={1} />
        </div>

        {/* Upload area */}
        <div className="mx-auto max-w-xl">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${
              dragOver
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                : "border-border/60 bg-card/30 hover:border-primary/50 hover:bg-card/50"
            }`}
          >
            {/* Subtle grid pattern inside */}
            <div className="absolute inset-0 opacity-5">
              <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="upload-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#upload-grid)" />
              </svg>
            </div>

            <div className="relative flex flex-col items-center gap-4 px-8 py-16">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
                dragOver ? "bg-primary/20 ring-2 ring-primary/40" : "bg-secondary ring-1 ring-border"
              }`}>
                <Upload className={`h-7 w-7 transition-colors ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-foreground">
                  {'Drag & Drop ไฟล์ หรือ คลิกเพื่อเลือก'}
                </p>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {'รองรับไฟล์ภาพ, วิดีโอ (.jpg, .png, .mp4)'}
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3 backdrop-blur-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                    <FileImage className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-accent" />
                    <span className="text-xs text-accent">Encrypted</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={files.length === 0}
              className="group flex items-center gap-2 rounded-xl bg-primary px-10 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              Submit
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

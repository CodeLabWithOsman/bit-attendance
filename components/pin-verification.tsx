"use client"

import type React from "react"

import { useState } from "react"
import { Lock, X } from "lucide-react"

interface PinVerificationProps {
  student: {
    displayValue: string
    hint: string
    pinType: string
    student: { name: string; index: string }
  }
  onVerified: (pin: string) => void
  onCancel: () => void
}

const SECRET_KEY = "kissmeifyoucan"

export default function PinVerification({ student, onVerified, onCancel }: PinVerificationProps) {
  const [pin, setPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!pin.trim()) {
      setError("Please enter your PIN")
      return
    }

    // Check if secret key for protected students
    if (pin === SECRET_KEY) {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 500))
      onVerified(pin)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    onVerified(pin)
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full animate-in scale-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-500" />
            Verify Your Identity
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Info */}
          <div className="bg-muted rounded-lg p-4 border border-border">
            <p className="text-sm text-foreground/60 mb-2">Selected:</p>
            <p className="text-lg font-semibold">{student.displayValue}</p>
          </div>

          {/* PIN Input */}
          <div>
            <label className="block text-sm font-medium mb-2">{student.hint}</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                setError("")
              }}
              placeholder={student.pinType === "surname" ? "••••" : "•••••"}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono tracking-widest"
              disabled={isLoading}
              maxLength={student.pinType === "surname" ? 4 : 5}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                "Mark Attendance"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import NavigationBar from "./navigation-bar"
import AdminPanel from "./admin-panel"
import { Lock } from "lucide-react"

interface TryHackMeProps {
  onNavigate: (page: string) => void
}

export default function TryHackMePage({ onNavigate }: TryHackMeProps) {
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [pincode, setPincode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("https://attendance-worker.pupujiger.workers.dev/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode, deviceId: "admin-" + Date.now() }),
      })
      const data = await response.json()

      if (data.success) {
        setSessionToken(data.sessionToken)
        setPincode("")
      } else {
        setError("Invalid PINCODE")
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (sessionToken) {
    return <AdminPanel sessionToken={sessionToken} onNavigate={onNavigate} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <NavigationBar onNavigate={onNavigate} />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-indigo-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Admin Access</h1>
            <p className="text-foreground/60">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="bg-card border border-border rounded-lg p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">PINCODE</label>
              <input
                type="password"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value)
                  setError("")
                }}
                placeholder="••••••"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono tracking-widest"
                disabled={isLoading}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

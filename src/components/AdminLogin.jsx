"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"

const WORKER_URL = "https://every.pupujiger.workers.dev"

export default function AdminLogin({ onLogin }) {
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${WORKER_URL}/api/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pincode: pin,
          deviceId: btoa(navigator.userAgent),
        }),
      })

      const data = await res.json()
      if (data.success) {
        onLogin(data.sessionToken)
      } else {
        setError(data.message || "Invalid credentials")
      }
    } catch (err) {
      setError("Connection error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-lg p-8 max-w-md mx-auto animate-in shadow-lg">
      <h1 className="text-3xl font-bold text-indigo-300 mb-6 text-center">Admin Panel</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-2">Admin PIN</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN..."
            className="w-full px-4 py-3 bg-slate-800 border border-indigo-500/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition"
            autoFocus
          />
        </div>

        {error && (
          <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !pin}
          className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 rounded-lg transition font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-center text-slate-500 text-sm mt-6">
        Access: <code className="text-slate-400">https://codelabwithosman.github.io/bit-attendance#/admin</code>
      </p>
    </div>
  )
}

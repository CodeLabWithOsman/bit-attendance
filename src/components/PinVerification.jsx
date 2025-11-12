"use client"

import React, { useState } from "react"
import { AlertCircle } from "lucide-react"

const WORKER_URL = "https://every.pupujiger.workers.dev"

export default function PinVerification({ student, onSuccess, onCancel }) {
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [strikes, setStrikes] = useState(0)
  const [blacklisted, setBlacklisted] = useState(false)

  const deviceId = React.useMemo(() => btoa(navigator.userAgent + Date.now()), [])

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!pin.trim()) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${WORKER_URL}/api/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: student.student,
          pin: pin.trim(),
          deviceId,
        }),
      })

      const data = await res.json()

      if (data.blacklisted) {
        setBlacklisted(true)
        setError("You have been blacklisted. Contact admin.")
        return
      }

      if (data.success) {
        // Mark attendance
        const attendRes = await fetch(`${WORKER_URL}/api/mark-attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student: student.student,
            deviceId,
          }),
        })

        const attendData = await attendRes.json()
        if (attendData.success) {
          onSuccess()
        } else {
          setError(attendData.message)
        }
      } else {
        setStrikes(data.strike || 0)
        setError(data.message)
      }
    } catch (err) {
      setError("Connection error")
    } finally {
      setLoading(false)
    }
  }

  if (blacklisted) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center animate-in">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
        <p className="text-red-300/80 mb-4">
          You have been blacklisted. Please contact the admin or course representative.
        </p>
        <button onClick={onCancel} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded transition text-sm">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-lg p-6 animate-in shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-indigo-300">Verify Your Identity</h2>

      <div className="mb-6 p-4 bg-slate-800/50 rounded border border-indigo-500/20">
        <p className="text-slate-400 text-sm mb-1">Searching for:</p>
        <p className="text-lg font-semibold text-indigo-300">{student.displayValue}</p>
      </div>

      <form onSubmit={handleVerify} className="mb-4">
        <label className="block text-sm text-slate-300 mb-2">{student.hint}</label>
        <input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN..."
          maxLength={student.pinType === "surname" ? 4 : 5}
          className="w-full px-4 py-3 bg-slate-800 border border-indigo-500/50 rounded-lg text-white text-center text-lg tracking-widest placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition font-mono"
          autoFocus
        />
        <p className="text-xs text-slate-500 mt-2">
          {student.pinType === "surname" ? "Last 4 letters of your surname" : "Last 5 digits of your index"}
        </p>
      </form>

      {strikes > 0 && strikes < 3 && (
        <div className="flex gap-2 p-3 mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-300">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>Wrong PIN - Strike {strikes}/3</span>
        </div>
      )}

      {error && !blacklisted && (
        <div className="flex gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded text-red-300">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded transition text-sm"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleVerify}
          disabled={loading || !pin}
          className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 rounded transition text-sm font-semibold"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  )
}

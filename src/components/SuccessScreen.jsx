"use client"

import { useEffect, useState } from "react"
import { CheckCircle } from "lucide-react"

export default function SuccessScreen({ onReset }) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          onReset()
          return 5
        }
        return c - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [onReset])

  return (
    <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-8 animate-in text-center shadow-lg">
      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 animate-pulse" />
      <h2 className="text-2xl font-bold text-green-400 mb-2">Attendance Marked!</h2>
      <p className="text-green-300/80 mb-6">Your attendance has been successfully recorded.</p>
      <div className="bg-slate-800/50 rounded p-4 mb-6">
        <p className="text-slate-400 text-sm">Returning to home in</p>
        <p className="text-4xl font-bold text-indigo-300">{countdown}</p>
      </div>
      <button onClick={onReset} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded transition">
        Return Now
      </button>
    </div>
  )
}

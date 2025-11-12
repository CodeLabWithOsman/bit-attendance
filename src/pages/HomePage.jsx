"use client"

import { useState, useEffect } from "react"
import StudentSearch from "../components/StudentSearch"
import PinVerification from "../components/PinVerification"
import SuccessScreen from "../components/SuccessScreen"
import { AlertCircle } from "lucide-react"

const WORKER_URL = "https://every.pupujiger.workers.dev"

export default function HomePage() {
  const [step, setStep] = useState("search") // search, verify, success
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch(`${WORKER_URL}/api/get-stats`)
      const data = await res.json()
      setStats(data)
      setLoading(false)
    } catch (err) {
      console.error("Failed to fetch stats:", err)
      setError("Failed to load attendance system")
      setLoading(false)
    }
  }

  const handleStudentSelected = (student) => {
    setSelectedStudent(student)
    setStep("verify")
  }

  const handleVerificationSuccess = () => {
    setStep("success")
    fetchStats()
  }

  const handleReset = () => {
    setStep("search")
    setSelectedStudent(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-glow p-8 rounded-lg bg-slate-900 border border-indigo-500/50">
          <div className="animate-spin text-4xl">⚙️</div>
          <p className="mt-4 text-indigo-300">Initializing System...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 max-w-md">
          <div className="flex gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-400">{error}</p>
              <p className="text-sm text-red-300/70 mt-2">Please refresh the page and try again.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Stats Banner */}
        <div className="mb-8 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30 animate-in">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-indigo-400">{stats?.total || 0}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Present Today</p>
              <p className="text-2xl font-bold text-green-400">{stats?.present || 0}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {step === "search" && <StudentSearch onStudentSelected={handleStudentSelected} />}

        {step === "verify" && selectedStudent && (
          <PinVerification student={selectedStudent} onSuccess={handleVerificationSuccess} onCancel={handleReset} />
        )}

        {step === "success" && <SuccessScreen onReset={handleReset} />}
      </div>
    </main>
  )
}

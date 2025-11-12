"use client"

import { useState, useEffect } from "react"
import { Search, AlertCircle } from "lucide-react"
import Dialog from "./dialog"
import PinVerification from "./pin-verification"

const WORKER_URL = "https://attendance-worker.pupujiger.workers.dev"

interface SearchResult {
  displayValue: string
  hint: string
  pinType: string
  student: { name: string; index: string }
}

export default function StudentSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<SearchResult | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState("")
  const [deviceId] = useState(() => {
    const stored = localStorage.getItem("deviceId")
    if (stored) return stored
    const id = `${Date.now()}-${Math.random()}`
    localStorage.setItem("deviceId", id)
    return id
  })

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${WORKER_URL}/api/search-student`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery }),
        })
        const data = await response.json()
        if (data.success) {
          setSearchResults(data.results || [])
        }
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSelectStudent = (result: SearchResult) => {
    setSelectedStudent(result)
  }

  const handlePinVerified = async (pin: string) => {
    if (!selectedStudent) return

    try {
      const response = await fetch(`${WORKER_URL}/api/verify-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: selectedStudent,
          pin,
          deviceId,
        }),
      })
      const data = await response.json()

      if (data.success) {
        // Open attendance marking portal
        const attendanceResponse = await fetch(`${WORKER_URL}/api/mark-attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student: selectedStudent.student,
            deviceId,
          }),
        })
        const attendanceData = await attendanceResponse.json()

        if (attendanceData.success) {
          setDialogMessage("✓ Attendance marked successfully! You will be logged out in 5 seconds.")
          setShowDialog(true)

          setTimeout(() => {
            setSelectedStudent(null)
            setSearchQuery("")
            setSearchResults([])
            setShowDialog(false)

            // Countdown logout animation
            let countdown = 5
            const countdownInterval = setInterval(() => {
              countdown--
              if (countdown <= 0) {
                clearInterval(countdownInterval)
                window.location.reload()
              }
            }, 1000)
          }, 2000)
        } else {
          setDialogMessage(attendanceData.message || "Failed to mark attendance")
          setShowDialog(true)
        }
      } else {
        setDialogMessage(data.message || "Verification failed")
        setShowDialog(true)
      }
    } catch (error) {
      setDialogMessage("An error occurred. Please try again.")
      setShowDialog(true)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Search Box */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your name or index number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectStudent(result)}
                  className="w-full text-left px-4 py-3 hover:bg-muted border-b border-border last:border-b-0 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <div className="font-medium">{result.displayValue}</div>
                    <div className="text-xs text-foreground/50">{result.hint}</div>
                  </div>
                  <svg
                    className="w-4 h-4 text-foreground/40 group-hover:text-foreground/60 transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 text-foreground/60">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                <span className="text-sm">Searching...</span>
              </div>
            </div>
          )}
        </div>

        {/* Info Message */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">How it works</p>
            <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1">
              Search for your name or index. If you search by name, you'll need to verify your index. If you search by
              index, you'll need to verify your surname.
            </p>
          </div>
        </div>
      </div>

      {/* PIN Verification Modal */}
      {selectedStudent && !showDialog && (
        <PinVerification
          student={selectedStudent}
          onVerified={handlePinVerified}
          onCancel={() => setSelectedStudent(null)}
        />
      )}

      {/* Dialog */}
      {showDialog && <Dialog message={dialogMessage} onClose={() => setShowDialog(false)} />}
    </>
  )
}

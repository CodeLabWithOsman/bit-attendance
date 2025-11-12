"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, MapPin, Lock, Shield } from "lucide-react"
import CustomDialog from "./dialog"

const WORKER_URL = "https://every.pupujiger.workers.dev"
const PROTECTED_SECRET_KEY = "kissmeifyoucan"

interface SearchResult {
  displayValue: string
  searchType: "name" | "index"
  studentData: {
    name: string
    index: string
  }
}

interface CourseRep {
  name: string
  phone: string
}

export default function StudentSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<SearchResult | null>(null)
  const [pin, setPin] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [dialogProps, setDialogProps] = useState<any>({})
  const [deviceId] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("deviceId")
      if (stored) return stored
      const id = `${Date.now()}-${Math.random()}-${navigator.userAgent}`
      localStorage.setItem("deviceId", id)
      return id
    }
    return ""
  })
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationError, setLocationError] = useState(false)
  const [isProtectedUser, setIsProtectedUser] = useState(false)
  const [courseReps, setCourseReps] = useState<CourseRep[]>([])

  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        () => {
          setLocationError(true)
        }
      )
    }

    fetch(`${WORKER_URL}/api/get-course-reps`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCourseReps(data.courseReps)
        }
      })
      .catch(console.error)
  }, [])

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
        showErrorDialog("Search failed. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const showErrorDialog = (message: string, actions?: any[]) => {
    setDialogProps({
      title: "Error",
      message,
      type: "error",
      actions: actions || [{ label: "Okay", onClick: () => setShowDialog(false) }],
    })
    setShowDialog(true)
  }

  const showSuccessDialog = (message: string) => {
    setDialogProps({
      title: "Success",
      message,
      type: "success",
      actions: [{ label: "Okay", onClick: () => setShowDialog(false) }],
    })
    setShowDialog(true)
  }

  const showContactDialog = (message: string) => {
    const actions = [
      ...courseReps.map((rep) => ({
        label: `Contact ${rep.name}`,
        onClick: () => {
          if (typeof window !== "undefined") {
            window.location.href = `tel:${rep.phone}`
          }
        },
        variant: "primary" as const,
      })),
      { label: "Close", onClick: () => setShowDialog(false), variant: "secondary" as const },
    ]
    setDialogProps({
      title: "Contact Course Rep",
      message,
      type: "warning",
      actions,
    })
    setShowDialog(true)
  }

  const handleSelectStudent = (result: SearchResult) => {
    setSelectedStudent(result)
    setPin("")
  }

  const handleVerifyPin = async () => {
    if (!selectedStudent) return
    if (!pin.trim()) {
      showErrorDialog("Please enter a PIN")
      return
    }

    if (pin === PROTECTED_SECRET_KEY) {
      setIsProtectedUser(true)
      showSuccessDialog("Welcome, protected student. You have unlimited access.")
      return
    }

    try {
      const response = await fetch(`${WORKER_URL}/api/verify-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: selectedStudent,
          pin,
          deviceId,
          latitude: location?.latitude,
          longitude: location?.longitude,
        }),
      })
      const data = await response.json()

      if (data.success) {
        if (data.isProtected) {
          setIsProtectedUser(true)
          showSuccessDialog(data.message)
        } else {
          await markAttendance(false)
        }
      } else {
        if (data.blacklisted) {
          showContactDialog(data.message)
        } else if (data.strikes) {
          showErrorDialog(data.message)
        } else if (data.contactInfo) {
          showContactDialog(data.message)
        } else {
          showErrorDialog(data.message || "Verification failed")
        }
      }
    } catch (error) {
      showErrorDialog("Verification failed. Please try again.")
    }
  }

  const markAttendance = async (isProtected: boolean) => {
    if (!selectedStudent && !isProtected) return

    try {
      const studentData = isProtected 
        ? { name: searchQuery, index: searchQuery } 
        : selectedStudent?.studentData

      const response = await fetch(`${WORKER_URL}/api/mark-attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: studentData,
          deviceId,
          isProtected,
        }),
      })
      const data = await response.json()

      if (data.success) {
        showSuccessDialog("✓ Attendance marked successfully!")
        setTimeout(() => {
          setSelectedStudent(null)
          setSearchQuery("")
          setSearchResults([])
          setPin("")
          setIsProtectedUser(false)
          setShowDialog(false)
        }, 2000)
      } else {
        showErrorDialog(data.message || "Failed to mark attendance")
      }
    } catch (error) {
      showErrorDialog("Failed to mark attendance. Please try again.")
    }
  }

  const handleProtectedMarkAttendance = () => {
    if (!searchQuery.trim()) {
      showErrorDialog("Please enter student name or index")
      return
    }
    markAttendance(true)
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Mark Your Attendance
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Search by name or index number
          </p>
          {locationError && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
              <MapPin className="w-4 h-4" />
              <span>Location access denied. Strict mode may restrict attendance.</span>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type student name or index..."
            disabled={isProtectedUser}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && !selectedStudent && !isProtectedUser && (
          <div className="mb-6 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectStudent(result)}
                className="w-full px-6 py-4 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0 flex justify-between items-center"
              >
                <span className="font-medium">{result.displayValue}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {result.searchType}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* PIN Verification */}
        {selectedStudent && !isProtectedUser && (
          <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-lg">Verify Identity</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {selectedStudent.searchType === "index"
                ? "Enter your last name"
                : "Enter last 5 digits of your index"}
            </p>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder={selectedStudent.searchType === "index" ? "Last name" : "Last 5 digits"}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4"
              onKeyPress={(e) => e.key === "Enter" && handleVerifyPin()}
            />
            <div className="flex gap-3">
              <button
                onClick={handleVerifyPin}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Verify & Mark
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-red-500 dark:hover:border-red-500 text-gray-700 dark:text-gray-300 hover:text-red-500 rounded-lg font-medium transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Protected User Mode */}
        {isProtectedUser && (
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-300 dark:border-purple-700">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-lg text-purple-900 dark:text-purple-100">
                Protected Mode Active
              </h3>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
              You can mark attendance for any student. Enter name or index above and click Mark.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleProtectedMarkAttendance}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Mark Attendance
              </button>
              <button
                onClick={() => {
                  setIsProtectedUser(false)
                  setSearchQuery("")
                  setPin("")
                }}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 rounded-lg font-medium transition-all duration-200"
              >
                Exit Protected Mode
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog */}
      {showDialog && (
        <CustomDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          {...dialogProps}
        />
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import NavigationBar from "./navigation-bar"
import { LogOut, Users, Plus } from "lucide-react"

interface AdminPanelProps {
  sessionToken: string
  onNavigate: (page: string) => void
}

interface Student {
  name: string
  index: string
  attended?: boolean
  blacklisted?: boolean
}

export default function AdminPanel({ sessionToken, onNavigate }: AdminPanelProps) {
  const [adminData, setAdminData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [attendanceEnabled, setAttendanceEnabled] = useState(false)
  const [newStudentName, setNewStudentName] = useState("")
  const [newStudentIndex, setNewStudentIndex] = useState("")
  const [bulkUploadText, setBulkUploadText] = useState("")
  const [showBulkUpload, setShowBulkUpload] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("https://attendance-worker.pupujiger.workers.dev/api/admin-get-data", {
          headers: { Authorization: sessionToken },
        })
        const data = await response.json()
        if (data.success) {
          setAdminData(data)
          setAttendanceEnabled(data.attendanceEnabled)
        }
      } catch (error) {
        console.error("Failed to load admin data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
    const interval = setInterval(loadData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [sessionToken])

  const handleToggleAttendance = async () => {
    try {
      const response = await fetch("https://attendance-worker.pupujiger.workers.dev/api/admin-toggle-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionToken,
        },
        body: JSON.stringify({ enabled: !attendanceEnabled }),
      })
      const data = await response.json()
      if (data.success) {
        setAttendanceEnabled(!attendanceEnabled)
      }
    } catch (error) {
      console.error("Failed to toggle attendance:", error)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudentName.trim() || !newStudentIndex.trim()) return

    try {
      const response = await fetch("https://attendance-worker.pupujiger.workers.dev/api/admin-add-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: sessionToken,
        },
        body: JSON.stringify({ name: newStudentName, index: newStudentIndex }),
      })
      const data = await response.json()
      if (data.success) {
        setNewStudentName("")
        setNewStudentIndex("")
        // Reload data
        const refreshResponse = await fetch("https://attendance-worker.pupujiger.workers.dev/api/admin-get-data", {
          headers: { Authorization: sessionToken },
        })
        const refreshData = await refreshResponse.json()
        if (refreshData.success) {
          setAdminData(refreshData)
        }
      }
    } catch (error) {
      console.error("Failed to add student:", error)
    }
  }

  const handleLogout = () => {
    onNavigate("home")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-border border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/60">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <NavigationBar onNavigate={onNavigate} />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-foreground/60 mt-2">Manage attendance and students</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-foreground/60 mb-2">Total Students</p>
              <p className="text-3xl font-bold">{adminData?.students?.length || 0}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-foreground/60 mb-2">Present Today</p>
              <p className="text-3xl font-bold">
                {adminData?.students?.filter((s: Student) => s.attended).length || 0}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm text-foreground/60 mb-2">Status</p>
              <button
                onClick={handleToggleAttendance}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  attendanceEnabled
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                }`}
              >
                {attendanceEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>

          {/* Add Student */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus size={20} />
              Add Student
            </h2>
            <form onSubmit={handleAddStudent} className="flex gap-4">
              <input
                type="text"
                placeholder="Student Name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Index Number"
                value={newStudentIndex}
                onChange={(e) => setNewStudentIndex(e.target.value)}
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </form>
          </div>

          {/* Students List */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users size={20} />
              Students ({adminData?.students?.length || 0})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Index</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminData?.students?.map((student: Student, idx: number) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4 font-mono">{student.index}</td>
                      <td className="py-3 px-4">
                        {student.blacklisted ? (
                          <span className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 rounded text-xs font-medium">
                            Blacklisted
                          </span>
                        ) : student.attended ? (
                          <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs font-medium">
                            Present
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-muted text-foreground/60 rounded text-xs font-medium">
                            Absent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

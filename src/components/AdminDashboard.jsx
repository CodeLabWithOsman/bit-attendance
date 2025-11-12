"use client"

import { useState, useEffect, useCallback } from "react"
import { LogOut, RefreshCw, Upload } from "lucide-react"

const WORKER_URL = "https://every.pupujiger.workers.dev"

export default function AdminDashboard({ token, onLogout }) {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState("dashboard") // dashboard, students, bulk-upload
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${WORKER_URL}/api/admin-get-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      })
      const result = await res.json()
      if (result.success) {
        setData(result)
      }
    } catch (err) {
      setError("Failed to fetch data")
    }
  }, [token])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const toggleAttendance = async () => {
    const newState = !data.attendanceEnabled
    try {
      const res = await fetch(`${WORKER_URL}/api/admin-toggle-attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ enabled: newState }),
      })
      const result = await res.json()
      if (result.success) {
        fetchData()
      }
    } catch (err) {
      setError("Failed to toggle attendance")
    }
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin text-4xl">⚙️</div>
        <p className="text-slate-400 mt-4">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-indigo-300">Admin Dashboard</h1>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-red-300">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-indigo-500/30 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Total Students</p>
          <p className="text-3xl font-bold text-indigo-400">{data.students.length}</p>
        </div>
        <div className="bg-slate-900 border border-indigo-500/30 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Present Today</p>
          <p className="text-3xl font-bold text-green-400">{data.students.filter((s) => s.attended).length}</p>
        </div>
        <div className="bg-slate-900 border border-indigo-500/30 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Blacklisted</p>
          <p className="text-3xl font-bold text-red-400">{data.blacklisted.length}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Attendance System</span>
          <button
            onClick={toggleAttendance}
            className={`px-4 py-2 rounded transition font-semibold ${
              data.attendanceEnabled ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"
            }`}
          >
            {data.attendanceEnabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded transition text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {["dashboard", "students", "bulk-upload"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 transition ${
              tab === t ? "border-b-2 border-indigo-500 text-indigo-300" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            {t === "dashboard" ? "Dashboard" : t === "students" ? "Students" : "Bulk Upload"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "students" && (
        <div className="bg-slate-900 border border-indigo-500/30 rounded-lg p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-3 text-slate-400">Name</th>
                <th className="text-left py-3 px-3 text-slate-400">Index</th>
                <th className="text-left py-3 px-3 text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.students.slice(0, 20).map((s, idx) => (
                <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-3 px-3">{s.name}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-xs">{s.index}</td>
                  <td className="py-3 px-3">
                    {s.attended ? (
                      <span className="text-green-400 text-xs font-semibold">✓ Present</span>
                    ) : s.blacklisted ? (
                      <span className="text-red-400 text-xs font-semibold">Blacklisted</span>
                    ) : (
                      <span className="text-slate-400 text-xs">Absent</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-slate-500 text-xs mt-4">
            Showing {Math.min(20, data.students.length)} of {data.students.length} students
          </p>
        </div>
      )}

      {tab === "bulk-upload" && <BulkUploadForm token={token} onSuccess={fetchData} />}
    </div>
  )
}

function BulkUploadForm({ token, onSuccess }) {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleUpload = async () => {
    if (!text.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`${WORKER_URL}/api/admin-bulk-upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ data: text }),
      })

      const result = await res.json()
      if (result.success) {
        setMessage(`Successfully added ${result.count} students`)
        setText("")
        onSuccess()
      } else {
        setMessage("Upload failed")
      }
    } catch (err) {
      setMessage("Error uploading")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-lg p-6 space-y-4">
      <div>
        <label className="block text-sm text-slate-300 mb-2">Student List (one per line: Name - Index)</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="John Doe - 123456&#10;Jane Smith - 789012"
          className="w-full h-40 px-4 py-3 bg-slate-800 border border-indigo-500/50 rounded-lg text-white placeholder-slate-500 focus:outline-none font-mono text-sm"
        />
      </div>

      {message && (
        <div className="p-3 bg-indigo-500/20 border border-indigo-500/50 rounded text-indigo-300 text-sm">
          {message}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={loading || !text.trim()}
        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 rounded transition font-semibold flex items-center justify-center gap-2"
      >
        <Upload size={18} />
        {loading ? "Uploading..." : "Upload Students"}
      </button>
    </div>
  )
}

"use client"

import { useState } from "react"
import AdminLogin from "../components/AdminLogin"
import AdminDashboard from "../components/AdminDashboard"

export default function AdminPage() {
  const [sessionToken, setSessionToken] = useState(localStorage.getItem("adminToken"))

  const handleLogin = (token) => {
    localStorage.setItem("adminToken", token)
    setSessionToken(token)
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    setSessionToken(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {!sessionToken ? (
          <AdminLogin onLogin={handleLogin} />
        ) : (
          <AdminDashboard token={sessionToken} onLogout={handleLogout} />
        )}
      </div>
    </div>
  )
}

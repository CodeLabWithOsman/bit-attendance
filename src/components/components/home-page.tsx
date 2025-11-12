"use client"

import { useState, useEffect } from "react"
import NavigationBar from "./navigation-bar"
import StudentSearch from "./student-search"
import { Clock } from "lucide-react"

interface HomePageProps {
  onNavigate: (page: string) => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      )
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <NavigationBar onNavigate={onNavigate} />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full mb-4">
              <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" opacity="0.3" />
                <circle cx="12" cy="12" r="6" />
              </svg>
              <span className="text-sm font-medium text-foreground/80">Live Attendance System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4">BIT GROUP C</h1>

            <p className="text-foreground/60 text-lg mb-6">Welcome to your attendance portal</p>

            <div className="flex items-center justify-center gap-2 text-foreground/70">
              <Clock size={18} />
              <span className="font-mono text-sm">{currentTime}</span>
            </div>
          </div>

          {/* Search Component */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <StudentSearch />
          </div>

          {/* Info Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mt-12">
            <div className="bg-card border border-border rounded-lg p-6 hover:border-indigo-500/50 transition-colors">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Secured</h3>
              <p className="text-sm text-foreground/60">Secured by Alien technology</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 hover:border-indigo-500/50 transition-colors">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Protected</h3>
              <p className="text-sm text-foreground/60">Your data is protected</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 hover:border-indigo-500/50 transition-colors">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Real-time</h3>
              <p className="text-sm text-foreground/60">Live updates</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Users, Lock, Zap } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function Home() {
  const [time, setTime] = useState("")
  const [stats, setStats] = useState({ total: 0, present: 0 })

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("https://every.pupujiger.workers.dev/api/get-stats")
        const data = await response.json()
        if (data.success) {
          setStats({ total: data.total, present: data.present })
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Navbar />
      <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto mt-10">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to BIT GROUP C
            </h1>
            <p className="text-2xl sm:text-3xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
              Attendance System
            </p>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8">{time}</p>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 italic px-4">
              "A simple attendance system made by Aliens from Jupiter"
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link
                href="/attendance"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Mark Attendance <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 rounded-lg font-medium transform hover:scale-105 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-20 px-4">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Lock className="w-10 sm:w-12 h-10 sm:h-12 text-blue-600 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">Secure</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Secured by Alien technology
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Users className="w-10 sm:w-12 h-10 sm:h-12 text-purple-600 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">Simple</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Easy to use student portal
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Zap className="w-10 sm:w-12 h-10 sm:h-12 text-yellow-600 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">Fast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                One-time attendance per day per student
              </p>
            </div>
          </div>

          {stats.total > 0 && (
            <div className="mt-12 sm:mt-16 text-center px-4">
              <div className="inline-block bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm px-8 sm:px-12 py-4 sm:py-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <p className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stats.present} / {stats.total}
                </p>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Students Present Today</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

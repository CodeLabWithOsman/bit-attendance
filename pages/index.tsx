import Head from 'next/head'
import NavigationBar from '@/components/navigation-bar'
import { useEffect, useState } from 'react'

const WORKER_URL = 'https://every.pupujiger.workers.dev'

export default function HomePage() {
  const [stats, setStats] = useState({ total: 0, present: 0 })
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch(`${WORKER_URL}/api/get-stats`)
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setStats({ total: data.total || 0, present: data.present || 0 })
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>BIT GROUP C - Attendance System</title>
        <meta name="description" content="BIT Group C Attendance System" />
      </Head>

      <NavigationBar />

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
              &quot;A simple attendance system made by Aliens from Jupiter&quot;
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <a
                href="/attendance"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Mark Attendance
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 sm:w-5 h-4 sm:h-5"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>

              <a
                href="/about"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 rounded-lg font-medium transform hover:scale-105 transition-all duration-200"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-20 px-4">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 sm:w-12 h-10 sm:h-12 text-blue-600 mb-4"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Secure</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Secured by Alien technology
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 sm:w-12 h-10 sm:h-12 text-green-600 mb-4"
              >
                <path d="M12 2v20"></path>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Live Stats</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loading ? 'Loading...' : `${stats.present} / ${stats.total} present`}
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 sm:w-12 h-10 sm:h-12 text-yellow-600 mb-4"
              >
                <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path>
              </svg>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Fast</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                One-time attendance per day per student
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

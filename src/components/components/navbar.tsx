"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (pathname === "/tryhackme") {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BIT GROUP C
          </Link>
          
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="text-sm md:text-base hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/attendance" className="text-sm md:text-base hover:text-blue-600 transition-colors">
              Attendance
            </Link>
            <Link href="/about" className="text-sm md:text-base hover:text-blue-600 transition-colors">
              About
            </Link>
            
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-500 transition-transform hover:rotate-180 duration-500" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-600 transition-transform hover:rotate-180 duration-500" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

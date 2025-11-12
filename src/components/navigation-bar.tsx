"use client"
import { Menu, X, Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react"

interface NavigationBarProps {
  onNavigate?: (page: string) => void
}

export default function NavigationBar({ onNavigate }: NavigationBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    
    setIsDark(initialDark)
    document.documentElement.classList.toggle("dark", initialDark)
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    document.documentElement.classList.toggle("dark", newDark)
    localStorage.setItem("theme", newDark ? "dark" : "light")
  }

  const handleClick = (page: string) => {
    onNavigate?.(page)
    setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            onClick={() => handleClick("home")}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <span className="font-bold text-lg hidden sm:inline">BIT GROUP C</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleClick("home")}
              className="text-foreground/70 hover:text-foreground transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={() => handleClick("admin")}
              className="text-foreground/70 hover:text-foreground transition-colors font-medium"
            >
              Admin
            </button>
            <button
              onClick={() => handleClick("about")}
              className="text-foreground/70 hover:text-foreground transition-colors font-medium"
            >
              About
            </button>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-all duration-300"
              aria-label="Toggle theme"
            >
              <div className="relative w-6 h-6">
                <Sun 
                  size={20} 
                  className={`absolute inset-0 transition-all duration-300 ${
                    isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                  }`}
                />
                <Moon 
                  size={20} 
                  className={`absolute inset-0 transition-all duration-300 ${
                    isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-all duration-300"
              aria-label="Toggle theme"
            >
              <div className="relative w-5 h-5">
                <Sun 
                  size={18} 
                  className={`absolute inset-0 transition-all duration-300 ${
                    isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                  }`}
                />
                <Moon 
                  size={18} 
                  className={`absolute inset-0 transition-all duration-300 ${
                    isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                  }`}
                />
              </div>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
            <button
              onClick={() => handleClick("home")}
              className="block w-full text-left px-4 py-3 text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => handleClick("admin")}
              className="block w-full text-left px-4 py-3 text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => handleClick("about")}
              className="block w-full text-left px-4 py-3 text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
            >
              About
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

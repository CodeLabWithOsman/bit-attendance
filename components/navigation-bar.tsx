"use client"
import { Menu, X } from "lucide-react"
import { useState } from "react"

interface NavigationBarProps {
  onNavigate?: (page: string) => void
}

export default function NavigationBar({ onNavigate }: NavigationBarProps) {
  const [isOpen, setIsOpen] = useState(false)

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
          <div className="hidden md:flex items-center gap-8">
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
            <button
              onClick={() => handleClick("tryhackme")}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
            >
              Panel
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            <button
              onClick={() => handleClick("home")}
              className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => handleClick("admin")}
              className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              Admin
            </button>
            <button
              onClick={() => handleClick("about")}
              className="block w-full text-left px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              About
            </button>
            <button
              onClick={() => handleClick("tryhackme")}
              className="block w-full text-left px-4 py-2 text-indigo-500 hover:text-indigo-400 transition-colors font-medium"
            >
              Admin Panel
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

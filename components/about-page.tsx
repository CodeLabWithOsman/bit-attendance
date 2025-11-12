"use client"

import NavigationBar from "./navigation-bar"
import { MessageCircle } from "lucide-react"

interface AboutPageProps {
  onNavigate: (page: string) => void
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      <NavigationBar onNavigate={onNavigate} />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About</h1>
            <p className="text-foreground/60 text-lg">A simple attendance system made by Aliens from Jupiter</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <p className="text-foreground/80 mb-6">
              This is a sophisticated, state-of-the-art attendance management system developed with advanced alien
              technology. It combines modern web technologies with robust security protocols to ensure seamless
              attendance tracking for BIT GROUP C.
            </p>

            <h2 className="text-2xl font-bold mb-4">Key Features</h2>
            <ul className="space-y-3 mb-8">
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span>Secured by Alien technology</span>
              </li>
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span>Real-time attendance tracking</span>
              </li>
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span>Advanced fraud detection</span>
              </li>
              <li className="flex gap-3">
                <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
                <span>Protected student accounts</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Contact</h2>
            <p className="text-foreground/80 mb-4">Need to get in touch? Reach out via WhatsApp:</p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/233345222358"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                <MessageCircle size={20} />
                Admin: 0345222358
              </a>
              <a
                href="https://wa.me/233500776941"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                <MessageCircle size={20} />
                Course Rep: 0500776941
              </a>
            </div>
          </div>

          <div className="text-center text-foreground/50 text-sm">
            <p>Made with alien technology from Jupiter 🛸</p>
          </div>
        </div>
      </main>
    </div>
  )
}

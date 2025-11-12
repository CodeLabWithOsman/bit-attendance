"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HomePage from "@/components/home-page"
import AdminPrank from "@/components/admin-prank"
import TryHackMePage from "@/components/try-hack-me"
import AboutPage from "@/components/about-page"

export default function Page() {
  const [currentPage, setCurrentPage] = useState("home")
  const router = useRouter()

  useEffect(() => {
    const path = window.location.pathname.split("/").pop() || "home"
    setCurrentPage(path === "" ? "home" : path)

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || "home"
      setCurrentPage(hash === "" ? "home" : hash)
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const handleNavigate = (page: string) => {
    window.location.hash = page === "home" ? "#" : `#${page}`
    setCurrentPage(page)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {currentPage === "home" && <HomePage onNavigate={handleNavigate} />}
      {currentPage === "admin" && <AdminPrank onNavigate={handleNavigate} />}
      {currentPage === "about" && <AboutPage onNavigate={handleNavigate} />}
      {currentPage === "tryhackme" && <TryHackMePage onNavigate={handleNavigate} />}
    </div>
  )
}

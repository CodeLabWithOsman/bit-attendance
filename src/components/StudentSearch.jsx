"use client"

import { useState } from "react"
import { Search, AlertCircle } from "lucide-react"

const WORKER_URL = "https://every.pupujiger.workers.dev"

export default function StudentSearch({ onStudentSelected }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${WORKER_URL}/api/search-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      })

      const data = await res.json()
      if (data.success) {
        setResults(data.results)
      } else {
        setError("Search failed")
      }
    } catch (err) {
      setError("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-lg p-6 animate-in shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-indigo-300">Find Your Details</h2>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or index..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-indigo-500/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition"
          >
            <Search size={20} />
          </button>
        </div>
      </form>

      {error && (
        <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-300 mb-4">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin text-2xl">⏳</div>
          <p className="text-slate-400 mt-2">Searching...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result, idx) => (
            <button
              key={idx}
              onClick={() => onStudentSelected(result)}
              className="w-full p-3 bg-slate-800 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-400 rounded-lg transition text-left"
            >
              <p className="font-semibold text-indigo-300">{result.displayValue}</p>
              <p className="text-xs text-slate-400">{result.hint}</p>
            </button>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p>No students found</p>
        </div>
      )}
    </div>
  )
}

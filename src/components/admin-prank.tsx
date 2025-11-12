"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "./navbar"
import { AlertCircle } from "lucide-react"

export default function AdminPrank() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showMessage, setShowMessage] = useState(false)
  const [error, setError] = useState("")

  const questions = [
    {
      question: "Solve this engineering calculus problem:\n∫ sin(x) cos(x) dx from 0 to π/2 = ?",
      answer: "419",
      hint: "Consider the product-to-sum formula",
    },
    {
      question: "What is the algorithm complexity for finding the shortest path in an unweighted graph?",
      answer: "thenoob",
      hint: "Think BFS...",
    },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (userAnswer.trim().toLowerCase() === questions[currentQuestion].answer.toLowerCase()) {
      if (currentQuestion === 0) {
        setCurrentQuestion(1)
        setUserAnswer("")
      } else {
        setShowMessage(true)
      }
    } else {
      setError("Incorrect answer. Try again.")
      setUserAnswer("")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <Navbar />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          {!showMessage ? (
            <div className="animate-fade-in">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Welcome, Lonely Wonderer</h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Were you expecting to see Chinese movies or the admin panel?
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 mb-8">
                <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-6 mb-6">
                  <p className="text-center font-mono text-sm whitespace-pre-wrap">
                    {questions[currentQuestion].question}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => {
                        setUserAnswer(e.target.value)
                        setError("")
                      }}
                      placeholder="Your answer here..."
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    {error && (
                      <div className="flex items-start gap-2 mt-3 text-red-500 text-sm">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Check Answer
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in text-center">
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12">
                <h2 className="text-3xl font-bold mb-4">Well Tried</h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">But this ain't going anywhere... Goodbye!</p>
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

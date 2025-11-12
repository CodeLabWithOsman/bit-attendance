"use client"

import { useState } from "react"
import { Lightbulb } from "lucide-react"

export default function TryHackMePage() {
  const [selectedChallenge, setSelectedChallenge] = useState(null)

  const challenges = [
    {
      id: 1,
      title: "Fibonacci Sequence",
      description: "Find the 10th Fibonacci number",
      hint: "F(n) = F(n-1) + F(n-2)",
      answer: "55",
    },
    {
      id: 2,
      title: "Binary Search",
      description: "How many iterations to find an element in a sorted array of 1000?",
      hint: "log₂(1000) ≈",
      answer: "10",
    },
    {
      id: 3,
      title: "Prime Number",
      description: "Is 17 a prime number?",
      hint: "Only divisible by 1 and itself",
      answer: "yes",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-300 mb-2">Try Hack Me</h1>
          <p className="text-slate-400">Solve algorithm challenges to test your skills</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-slate-900 border border-indigo-500/30 rounded-lg p-6 hover:border-indigo-500/60 cursor-pointer transition"
              onClick={() => setSelectedChallenge(challenge)}
            >
              <h3 className="text-xl font-bold text-indigo-300 mb-2">{challenge.title}</h3>
              <p className="text-slate-400 text-sm">{challenge.description}</p>
            </div>
          ))}
        </div>

        {selectedChallenge && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-indigo-500/50 rounded-lg p-8 max-w-md w-full animate-in">
              <h2 className="text-2xl font-bold text-indigo-300 mb-4">{selectedChallenge.title}</h2>
              <p className="text-slate-300 mb-4">{selectedChallenge.description}</p>

              <div className="bg-slate-800/50 border border-indigo-500/20 rounded p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Lightbulb size={18} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-300">{selectedChallenge.hint}</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-4 text-center">
                This is just a fun challenge. The answer is:{" "}
                <code className="text-slate-400">{selectedChallenge.answer}</code>
              </p>

              <button
                onClick={() => setSelectedChallenge(null)}
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

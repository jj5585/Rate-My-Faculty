"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const CRITERIA_LABELS: Record<string, string> = {
  teachingClarity: "Teaching Clarity",
  approachability: "Approachability",
  gradingFairness: "Grading Fairness",
  punctuality: "Punctuality",
  partiality: "Non-Partiality",
  behaviour: "Behaviour",
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function overallScore(r: any) {
  return ((r.teachingClarity + r.approachability + r.gradingFairness + r.punctuality + r.partiality + r.behaviour) / 6).toFixed(1)
}

function scoreColor(score: number) {
  if (score >= 4.5) return "text-green-400"
  if (score >= 3.5) return "text-yellow-400"
  if (score >= 2.5) return "text-orange-400"
  return "text-red-400"
}

function highlight(r: any) {
  const scores = [
    { key: "teachingClarity", val: r.teachingClarity },
    { key: "approachability", val: r.approachability },
    { key: "gradingFairness", val: r.gradingFairness },
    { key: "punctuality", val: r.punctuality },
    { key: "partiality", val: r.partiality },
    { key: "behaviour", val: r.behaviour },
  ]
  const best = scores.reduce((a, b) => a.val >= b.val ? a : b)
  const worst = scores.reduce((a, b) => a.val <= b.val ? a : b)
  return { best, worst }
}

export default function TodayPage() {
  const [ratings, setRatings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/recent-ratings")
      .then((r) => r.json())
      .then((data) => {
        setRatings(data.ratings || [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">💬 Today's Reviews</h1>
          <p className="text-gray-400 text-xs">Anonymous student voices — updated live</p>
        </div>
        <Link href="/" className="text-blue-400 text-sm">← Home</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">
        {loading ? (
          <p className="text-gray-500 text-sm text-center mt-10">Loading...</p>
        ) : ratings.length === 0 ? (
          <div className="text-center mt-16 space-y-3">
            <p className="text-4xl">🌙</p>
            <p className="text-gray-400">No reviews yet today.</p>
            <p className="text-gray-600 text-sm">Check back later or be the first to review!</p>
            <Link href="/" className="text-blue-400 text-sm underline">Browse faculty</Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 text-xs text-right">{ratings.length} review{ratings.length !== 1 ? "s" : ""} today</p>
            {ratings.map((r) => {
              const overall = parseFloat(overallScore(r))
              const { best, worst } = highlight(r)
              return (
                <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
                  {/* Overall score + time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-black ${scoreColor(overall)}`}>{overall}</span>
                      <span className="text-gray-600 text-xs">/ 5 overall</span>
                    </div>
                    <span className="text-gray-600 text-xs">{timeAgo(r.createdAt)}</span>
                  </div>

                  {/* Review text */}
                  {r.review && (
                    <p className="text-gray-200 text-sm leading-relaxed italic">
                      "{r.review}"
                    </p>
                  )}

                  {/* Best and worst */}
                  <div className="flex gap-3">
                    <div className="flex-1 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                      <p className="text-green-400 text-xs font-medium">👍 Best</p>
                      <p className="text-white text-xs mt-0.5">{CRITERIA_LABELS[best.key]} · {best.val}/5</p>
                    </div>
                    <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      <p className="text-red-400 text-xs font-medium">👎 Needs work</p>
                      <p className="text-white text-xs mt-0.5">{CRITERIA_LABELS[worst.key]} · {worst.val}/5</p>
                    </div>
                  </div>

                  {/* All scores */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-800">
                    {Object.entries(CRITERIA_LABELS).map(([key, label]) => (
                      <div key={key} className="text-center">
                        <p className="text-gray-600 text-xs">{label.split(" ")[0]}</p>
                        <p className="text-white text-sm font-bold">{r[key]}/5</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-gray-700 text-xs uppercase tracking-widest">Anonymous Student</p>
                </div>
              )
            })}
          </>
        )}
      </main>
    </div>
  )
}
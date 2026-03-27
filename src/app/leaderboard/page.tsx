"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function LeaderboardPage() {
  const [faculty, setFaculty] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/faculty")
      .then((r) => r.json())
      .then((data) => {
        const ranked = (data.faculty || [])
          .filter((f: any) => f.ratingCount >= 1)
          .sort((a: any, b: any) => {
            const ratingDiff = parseFloat(b.avgRating) - parseFloat(a.avgRating)
            if (ratingDiff !== 0) return ratingDiff
            return b.ratingCount - a.ratingCount
          })
          .slice(0, 25)
        setFaculty(ranked)
        setLoading(false)
      })
  }, [])

  const medalColor = (i: number) => {
    if (i === 0) return "text-yellow-400"
    if (i === 1) return "text-gray-300"
    if (i === 2) return "text-amber-600"
    return "text-gray-600"
  }

  const ratingColor = (avg: string) => {
    const n = parseFloat(avg)
    if (n >= 4.5) return "text-green-400"
    if (n >= 3.5) return "text-yellow-400"
    if (n >= 2.5) return "text-orange-400"
    return "text-red-400"
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">🏆 Leaderboard</h1>
          <p className="text-gray-400 text-xs">Top 25 faculty by student ratings</p>
        </div>
        <Link href="/" className="text-blue-400 text-sm">← Home</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <p className="text-gray-500 text-sm text-center mt-10">Loading...</p>
        ) : faculty.length === 0 ? (
          <div className="text-center mt-16 space-y-2">
            <p className="text-4xl">📭</p>
            <p className="text-gray-400">No ratings yet. Be the first to rate a faculty!</p>
            <Link href="/" className="text-blue-400 text-sm underline">Go rate someone</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {faculty.map((f, i) => (
              <Link
                key={f.id}
                href={`/faculty/${f.id}`}
                className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 flex items-center gap-4 transition"
              >
                {/* Rank */}
                <div className={`text-2xl font-black w-8 text-center shrink-0 ${medalColor(i)}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                </div>

                {/* Photo */}
                {f.photoUrl ? (
                  <img
                    src={`/api/image-proxy?url=${encodeURIComponent(f.photoUrl)}`}
                    alt={f.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-300 shrink-0">
                    {f.name?.charAt(0)}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{f.name}</p>
                  <p className="text-gray-400 text-xs truncate">{f.department}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{f.ratingCount} review{f.ratingCount !== 1 ? "s" : ""}</p>
                </div>

                {/* Rating */}
                <div className="text-right shrink-0">
                  <p className={`text-2xl font-black ${ratingColor(f.avgRating)}`}>
                    {f.avgRating}
                  </p>
                  <p className="text-gray-500 text-xs">/ 5</p>
                  <p className="text-gray-600 text-xs">{f.ratingCount} review{f.ratingCount !== 1 ? "s" : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"

const CATEGORIES = [
  { id: "Classroom", emoji: "📚" },
  { id: "Faculty", emoji: "👨‍🏫" },
  { id: "Hostel", emoji: "🏠" },
  { id: "Canteen", emoji: "🍽️" },
  { id: "Admin", emoji: "🏛️" },
  { id: "Events", emoji: "🎉" },
  { id: "Other", emoji: "💬" },
]

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return "expired"
}

function timeLeft(expiresAt: string) {
  const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
  if (diff <= 0) return "Expired"
  if (diff < 3600) return `${Math.floor(diff / 60)}m left`
  return `${Math.floor(diff / 3600)}h left`
}

export default function IncidentsPage() {
  const { data: session, status } = useSession()
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState("")
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchIncidents()
  }, [])

  async function fetchIncidents() {
    setLoading(true)
    const res = await fetch("/api/incidents")
    const data = await res.json()
    setIncidents(data.incidents || [])
    setLoading(false)
  }

  async function handlePost() {
    if (!content.trim() || !category) {
      setPostError("Please fill in both the post and category.")
      return
    }
    setPosting(true)
    setPostError("")
    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, category }),
    })
    const data = await res.json()
    if (data.incident) {
      setContent("")
      setCategory("")
      setShowForm(false)
      fetchIncidents()
    } else {
      setPostError(data.error || "Failed to post")
    }
    setPosting(false)
  }

  async function handleUpvote(id: string) {
    if (upvoted.has(id)) return
    setUpvoted((prev) => new Set([...prev, id]))
    const res = await fetch(`/api/incidents/${id}/upvote`, { method: "POST" })
    const data = await res.json()
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, upvotes: data.upvotes } : i))
    )
  }

  const filtered = activeCategory === "All"
    ? incidents
    : incidents.filter((i) => i.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">🚨 Campus Feed</h1>
          <p className="text-gray-400 text-xs">Anonymous · disappears in 24h</p>
        </div>
        <Link href="/" className="text-blue-400 text-sm">← Home</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 flex flex-col gap-4 pb-24">

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory("All")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              activeCategory === "All" ? "bg-white text-black" : "bg-gray-800 text-gray-400"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                activeCategory === c.id ? "bg-white text-black" : "bg-gray-800 text-gray-400"
              }`}
            >
              {c.emoji} {c.id}
            </button>
          ))}
        </div>

        {/* Post button */}
        {status === "authenticated" ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-gray-900 border border-gray-700 hover:border-blue-500 rounded-xl px-4 py-3 text-sm text-gray-400 text-left transition"
          >
            {showForm ? "✕ Cancel" : "✏️ Something happened at college? Share anonymously..."}
          </button>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-500 text-left"
          >
            🔒 Sign in to post an incident
          </button>
        )}

        {/* Post form */}
        {showForm && session && (
          <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-4 flex flex-col gap-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What happened? Be honest, be anonymous."
              className="w-full h-28 bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              maxLength={500}
            />
            <p className="text-gray-600 text-xs text-right">{content.length}/500</p>

            {/* Category picker */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    category === c.id ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {c.emoji} {c.id}
                </button>
              ))}
            </div>

            {postError && <p className="text-red-400 text-xs">{postError}</p>}

            <button
              onClick={handlePost}
              disabled={posting}
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition disabled:opacity-50"
            >
              {posting ? "Posting..." : "Post Anonymously"}
            </button>
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <p className="text-gray-500 text-sm text-center mt-6">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center mt-10 space-y-2">
            <p className="text-4xl">🌙</p>
            <p className="text-gray-500 text-sm">Nothing here yet. Be the first to post!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((incident) => {
              const cat = CATEGORIES.find((c) => c.id === incident.category)
              return (
                <div key={incident.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
                  {/* Category + time */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium bg-gray-800 px-2 py-1 rounded-full text-gray-300">
                      {cat?.emoji} {incident.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-xs">{timeAgo(incident.createdAt)}</span>
                      <span className="text-orange-500 text-xs">⏱ {timeLeft(incident.expiresAt)}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-gray-100 text-sm leading-relaxed">{incident.content}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-1 border-t border-gray-800">
                    <button
                      onClick={() => handleUpvote(incident.id)}
                      disabled={upvoted.has(incident.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition ${
                        upvoted.has(incident.id)
                          ? "bg-blue-600/20 text-blue-400"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      👍 Relatable · {incident.upvotes}
                    </button>
                    <span className="text-gray-700 text-xs ml-auto">Anonymous</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
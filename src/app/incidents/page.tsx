"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"

const CATEGORIES = [
  { id: "Classroom", emoji: "📚" },
  { id: "Faculty",   emoji: "👨‍🏫" },
  { id: "Hostel",    emoji: "🏠" },
  { id: "Canteen",   emoji: "🍽️" },
  { id: "Admin",     emoji: "🏛️" },
  { id: "Events",    emoji: "🎉" },
  { id: "Other",     emoji: "💬" },
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
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  return h > 0 ? `${h}h left` : `${m}m left`
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
  const [reported, setReported] = useState<Set<string>>(new Set())
  const [reportMsg, setReportMsg] = useState<string | null>(null)

  useEffect(() => { fetchIncidents() }, [])

  async function fetchIncidents() {
    setLoading(true)
    try {
      const res = await fetch("/api/incidents")
      const data = await res.json()
      setIncidents(data.incidents || [])
    } finally {
      setLoading(false)
    }
  }

  async function handlePost() {
    if (!content.trim() || !category) { setPostError("Write something and pick a category."); return }
    setPosting(true)
    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, category }),
    })
    const data = await res.json()
    if (data.incident) {
      setContent(""); setCategory(""); setShowForm(false); fetchIncidents()
    } else {
      setPostError(data.error || "Failed to post")
    }
    setPosting(false)
  }

  async function handleUpvote(id: string) {
    if (upvoted.has(id)) return
    setUpvoted(prev => new Set([...prev, id]))
    const res = await fetch(`/api/incidents/${id}/upvote`, { method: "POST" })
    const data = await res.json()
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, upvotes: data.upvotes } : i))
  }

  async function handleReport(id: string) {
    if (reported.has(id)) return
    if (!session) { signIn("google"); return }
    setReported(prev => new Set([...prev, id]))
    try {
      const res = await fetch(`/api/incidents/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "inappropriate" }),
      })
      const data = await res.json()
      setReportMsg(data.message || "Reported.")
      setTimeout(() => setReportMsg(null), 4000)
      if (data.hidden) setIncidents(prev => prev.filter(i => i.id !== id))
    } catch { /* silent */ }
  }

  const filtered = activeCategory === "All"
    ? incidents
    : incidents.filter(i => i.category === activeCategory)

  return (
    <div className="min-h-screen flex flex-col justify-start relative z-10 selection:bg-blue-600 selection:text-white pb-36">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full pt-2 pb-2 px-4 backdrop-blur-2xl bg-black/40 border-b border-white/[0.08]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full liquid-glass-pill text-[12px] font-semibold text-cyan-300 hover:text-white transition-all no-underline"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
            <span>Home</span>
          </Link>

          <h1 className="text-[17px] font-extrabold text-white tracking-tight m-0">
            Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Pulse</span>
          </h1>

          <div className="px-2 py-0.5 rounded-full liquid-badge text-[10px] font-bold text-cyan-200 uppercase tracking-widest">
            24h Feed
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full px-4 pt-4 z-10 flex flex-col gap-4 max-w-md mx-auto outline-none">
        {/* Category Scroll Filter */}
        <div role="group" aria-label="Filter incidents by category" className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            aria-pressed={activeCategory === "All"}
            onClick={() => setActiveCategory("All")}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
              activeCategory === "All"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(10,132,255,0.4)] border border-white/30"
                : "liquid-glass-pill text-white/80 hover:text-white"
            }`}
          >
            All
          </button>
          {CATEGORIES.map(c => {
            const isActive = activeCategory === c.id
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(c.id)}
                className={`flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(10,132,255,0.4)] border border-white/30"
                    : "liquid-glass-pill text-white/80 hover:text-white"
                }`}
              >
                <span aria-hidden="true">{c.emoji}</span>
                <span>{c.id}</span>
              </button>
            )
          })}
        </div>

        {/* Composer Trigger */}
        <div>
          {status === "authenticated" ? (
            <button
              type="button"
              aria-expanded={showForm}
              aria-controls="incident-compose-panel"
              onClick={() => setShowForm(!showForm)}
              className="w-full p-4 rounded-2xl liquid-glass text-left text-white/80 hover:text-white flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-300 text-[20px]" aria-hidden="true">edit</span>
                <span className="text-[13px]">What's happening on campus? Post anonymously...</span>
              </div>
              <span className="text-xs text-white/50">{showForm ? "✕" : "+"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google")}
              className="w-full p-3.5 rounded-2xl liquid-glass text-center text-cyan-300 font-semibold text-[13px]"
            >
              Sign in to post anonymously
            </button>
          )}
        </div>

        {/* Compose Form */}
        {showForm && (
          <form
            id="incident-compose-panel"
            onSubmit={(e) => { e.preventDefault(); handlePost(); }}
            className="rounded-[24px] liquid-glass p-5 flex flex-col gap-3 border border-cyan-400/30 shadow-liquid-glow"
          >
            <label htmlFor="incident-post-content" className="sr-only">Incident description</label>
            <textarea
              id="incident-post-content"
              className="w-full liquid-glass-input p-3.5 rounded-xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none h-28"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's going down? Posts automatically expire in 24 hours."
            />

            <fieldset className="border-none p-0 m-0">
              <legend className="sr-only">Select Category</legend>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {CATEGORIES.map(c => (
                  <button
                    type="button"
                    key={c.id}
                    aria-pressed={category === c.id}
                    onClick={() => setCategory(c.id)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold ${
                      category === c.id
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                        : "liquid-glass-pill text-white/70"
                    }`}
                  >
                    <span aria-hidden="true">{c.emoji}</span> {c.id}
                  </button>
                ))}
              </div>
            </fieldset>

            {postError && <p role="alert" className="text-rose-400 text-[12px] m-0">{postError}</p>}

            <button
              type="submit"
              disabled={posting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[14px]"
            >
              {posting ? "Posting..." : "Send to 24h Feed"}
            </button>
          </form>
        )}

        {reportMsg && (
          <div role="status" aria-live="polite" className="p-3 rounded-2xl liquid-glass border border-emerald-400/40 text-emerald-300 text-[13px]">
            ✓ {reportMsg}
          </div>
        )}

        {/* Feed List */}
        {loading ? (
          <div role="status" aria-live="polite" className="text-center py-12 text-cyan-300 font-semibold text-sm">
            Loading campus feed...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[22px] liquid-glass p-8 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-white/40 text-[32px]" aria-hidden="true">feed</span>
            <p className="text-white/80 font-semibold text-[15px]">No active pulses</p>
            <p className="text-white/50 text-[13px]">Be the first to post what's happening on campus today.</p>
          </div>
        ) : (
          <ul role="list" className="flex flex-col gap-2.5 p-0 m-0 list-none" aria-label="Campus incident feed">
            {filtered.map(incident => {
              const cat = CATEGORIES.find(c => c.id === incident.category)
              const hasUpvoted = upvoted.has(incident.id)
              const hasReported = reported.has(incident.id)

              return (
                <li key={incident.id} className="list-none">
                  <div className="rounded-[22px] liquid-glass p-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                        <span aria-hidden="true">{cat?.emoji}</span> {incident.category}
                      </span>
                      <div className="flex items-center gap-2 text-white/50">
                        <span>{timeAgo(incident.createdAt)}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-semibold">🔥 {timeLeft(incident.expiresAt)}</span>
                      </div>
                    </div>

                    <p className="text-[14px] leading-relaxed text-white/90 m-0">
                      {incident.content}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpvote(incident.id)}
                          aria-label={hasUpvoted ? `Upvoted, ${incident.upvotes} upvotes` : `Upvote incident, currently ${incident.upvotes} upvotes`}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                            hasUpvoted
                              ? "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                              : "liquid-glass-pill text-white/70 hover:text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">favorite</span>
                          <span>{incident.upvotes}</span>
                        </button>

                        <button
                          onClick={() => !hasReported && handleReport(incident.id)}
                          aria-label={hasReported ? "Incident reported" : "Report incident"}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            hasReported
                              ? "text-white/40"
                              : "liquid-glass-pill text-white/60 hover:text-white"
                          }`}
                        >
                          {hasReported ? "✓ Reported" : "Report"}
                        </button>
                      </div>

                      <span className="text-[10px] text-white/40 uppercase tracking-wider">
                        Anonymous
                      </span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
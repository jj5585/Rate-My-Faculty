"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"

const CATEGORIES = [
  { id: "Classroom", emoji: "📚", color: "#60a5fa" },
  { id: "Faculty", emoji: "👨‍🏫", color: "#f87171" },
  { id: "Hostel", emoji: "🏠", color: "#fbbf24" },
  { id: "Canteen", emoji: "🍽️", color: "#34d399" },
  { id: "Admin", emoji: "🏛️", color: "#a78bfa" },
  { id: "Events", emoji: "🎉", color: "#f472b6" },
  { id: "Other", emoji: "💬", color: "#94a3b8" },
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

function DisclaimerBanner() {
  return (
    <div style={{
      backgroundColor: "rgba(239, 68, 68, 0.05)",
      border: "1px solid rgba(239, 68, 68, 0.2)",
      borderRadius: "12px",
      padding: "12px 16px",
      marginBottom: "20px",
      display: "flex",
      gap: "10px",
      alignItems: "flex-start",
    }}>
      <span style={{ fontSize: "14px", flexShrink: 0 }}>⚠️</span>
      <p style={{ fontSize: "11px", lineHeight: "1.6", color: "#71717a", margin: 0 }}>
        <span style={{ color: "#a1a1aa", fontWeight: 700 }}>Community Guidelines: </span>
        All content represents user opinions and experiences. We do not verify claims.
        Report inappropriate content for review.
      </p>
    </div>
  )
}

function ReportButton({ incidentId, reportedSet, onReport }: {
  incidentId: string
  reportedSet: Set<string>
  onReport: (id: string) => void
}) {
  const already = reportedSet.has(incidentId)
  return (
    <button
      onClick={() => !already && onReport(incidentId)}
      title="Report this post for review"
      style={{
        padding: "6px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 700,
        cursor: already ? "default" : "pointer", border: "1px solid",
        borderColor: already ? "#3f3f46" : "rgba(239,68,68,0.3)",
        backgroundColor: already ? "transparent" : "rgba(239,68,68,0.07)",
        color: already ? "#3f3f46" : "#ef4444",
        transition: "all 0.2s", display: "flex", alignItems: "center", gap: "4px", letterSpacing: "0.5px",
      }}
    >
      {already ? "✓ REPORTED" : "⚑ REPORT"}
    </button>
  )
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
    if (data.incident) { setContent(""); setCategory(""); setShowForm(false); fetchIncidents() }
    else { setPostError(data.error || "Failed to post") }
    setPosting(false)
  }

  async function handleUpvote(id: string) {
    if (upvoted.has(id)) return
    setUpvoted((prev) => new Set([...prev, id]))
    const res = await fetch(`/api/incidents/${id}/upvote`, { method: "POST" })
    const data = await res.json()
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, upvotes: data.upvotes } : i)))
  }

  async function handleReport(id: string) {
    if (reported.has(id)) return
    if (!session) { signIn("google"); return }
    setReported((prev) => new Set([...prev, id]))
    try {
      const res = await fetch(`/api/incidents/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "inappropriate" }),
      })
      const data = await res.json()
      setReportMsg(data.message || "Reported.")
      setTimeout(() => setReportMsg(null), 5000)
      if (data.hidden) {
        setIncidents((prev) => prev.filter((i) => i.id !== id))
      }
    } catch { /* silent fail */ }
  }

  const filtered = activeCategory === "All" ? incidents : incidents.filter((i) => i.category === activeCategory)

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#f4f4f5", fontFamily: "Inter, sans-serif", paddingBottom: "120px" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease; }
        .slide-down { animation: slideDown 0.3s ease; }
      `}} />

      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "200px", background: "linear-gradient(to bottom, rgba(232, 0, 28, 0.05), transparent)", pointerEvents: "none" }} />

      <header style={{
        padding: "24px 20px", borderBottom: "1px solid #1f1f22",
        backdropFilter: "blur(12px)", backgroundColor: "rgba(10, 10, 10, 0.8)",
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>Campus Pulse</h1>
          <p style={{ fontSize: "11px", color: "#71717a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Stories expire in 24h</p>
        </div>
        <Link href="/" style={{ fontSize: "13px", fontWeight: 600, color: "#ef4444", textDecoration: "none" }}>HOME</Link>
      </header>

      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>

        {/* DISCLAIMER BANNER */}
        <DisclaimerBanner />

        {/* Category Filter */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "16px", scrollbarWidth: "none" }}>
          <button onClick={() => setActiveCategory("All")} style={{ padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", backgroundColor: activeCategory === "All" ? "#ef4444" : "#18181b", color: activeCategory === "All" ? "#fff" : "#71717a", border: "1px solid #27272a", whiteSpace: "nowrap" }}>All Feed</button>
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{ padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", backgroundColor: activeCategory === c.id ? "#fff" : "#18181b", color: activeCategory === c.id ? "#000" : "#71717a", border: "1px solid #27272a", whiteSpace: "nowrap" }}>
              {c.emoji} {c.id}
            </button>
          ))}
        </div>

        {/* Composer Trigger */}
        <div style={{ marginBottom: "24px" }}>
          {status === "authenticated" ? (
            <button onClick={() => setShowForm(!showForm)} style={{ width: "100%", padding: "16px", borderRadius: "16px", backgroundColor: "#111113", border: "1px solid #1f1f22", color: "#a1a1aa", textAlign: "left", fontSize: "14px", cursor: "pointer" }}>
              {showForm ? "✕ Close Editor" : "✏️ What's the latest tea? Share anonymously..."}
            </button>
          ) : (
            <div onClick={() => signIn("google")} style={{ padding: "16px", borderRadius: "16px", backgroundColor: "#111113", border: "1px solid #1f1f22", color: "#71717a", fontSize: "13px", textAlign: "center", cursor: "pointer" }}>
              🔒 Sign in to share an anonymous update
            </div>
          )}
        </div>

        {/* Post Form */}
        {showForm && (
          <div className="fade-in" style={{ backgroundColor: "#111113", border: "1px solid #ef4444", borderRadius: "20px", padding: "20px", marginBottom: "24px" }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Spill it..."
              style={{ width: "100%", height: "120px", backgroundColor: "#0a0a0a", border: "1px solid #27272a", borderRadius: "12px", color: "#fff", padding: "12px", fontSize: "15px", outline: "none", resize: "none" }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setCategory(c.id)} style={{ padding: "6px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: 700, backgroundColor: category === c.id ? "#ef4444" : "#18181b", color: "#fff", border: "none", cursor: "pointer" }}>{c.emoji} {c.id}</button>
              ))}
            </div>
            {postError && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "12px" }}>{postError}</p>}
            <button onClick={handlePost} disabled={posting} style={{ width: "100%", marginTop: "16px", padding: "14px", borderRadius: "12px", backgroundColor: "#fff", color: "#000", fontWeight: 800, border: "none", cursor: "pointer", opacity: posting ? 0.5 : 1 }}>
              {posting ? "POSTING..." : "SEND TO FEED"}
            </button>
            {/* POSTING AREA DISCLAIMER */}
            <p style={{ marginTop: "12px", fontSize: "10px", color: "#3f3f46", textAlign: "center", lineHeight: "1.5" }}>
              All content represents user opinions and experiences. We do not verify claims. Report inappropriate content for review.
            </p>
          </div>
        )}

        {/* Report Toast */}
        {reportMsg && (
          <div className="slide-down" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "#a1a1aa" }}>
            ✓ {reportMsg}
          </div>
        )}

        {/* Feed */}
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#3f3f46" }}>Fetching stories...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#3f3f46", fontSize: "14px" }}>No posts yet. Be the first to share.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filtered.map((incident) => {
              const cat = CATEGORIES.find((c) => c.id === incident.category)
              return (
                <div key={incident.id} className="fade-in" style={{ backgroundColor: "#111113", border: "1px solid #1f1f22", borderRadius: "20px", padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: cat?.color || "#fff", backgroundColor: "rgba(255,255,255,0.03)", padding: "4px 8px", borderRadius: "6px", textTransform: "uppercase" }}>
                      {cat?.emoji} {incident.category}
                    </span>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: "10px", color: "#3f3f46" }}>{timeAgo(incident.createdAt)}</p>
                      <p style={{ margin: 0, fontSize: "10px", fontWeight: 700, color: "#f97316" }}>🔥 {timeLeft(incident.expiresAt)}</p>
                    </div>
                  </div>

                  <p style={{ fontSize: "15px", lineHeight: "1.6", color: "#d4d4d8", margin: "0 0 20px" }}>{incident.content}</p>

                  {/* ACTION BAR */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid #1f1f22", paddingTop: "14px" }}>
                    <button
                      onClick={() => handleUpvote(incident.id)}
                      style={{ padding: "6px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 700, cursor: upvoted.has(incident.id) ? "default" : "pointer", border: "none", backgroundColor: upvoted.has(incident.id) ? "rgba(239, 68, 68, 0.1)" : "#18181b", color: upvoted.has(incident.id) ? "#ef4444" : "#a1a1aa", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      {upvoted.has(incident.id) ? "❤️ Relatable" : "🤍 Relatable"} · {incident.upvotes}
                    </button>

                    {/* REPORT BUTTON */}
                    <ReportButton incidentId={incident.id} reportedSet={reported} onReport={handleReport} />

                    <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 700, color: "#3f3f46", letterSpacing: "1px" }}>ANONYMOUS</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* FOOTER DISCLAIMER */}
      <footer style={{ maxWidth: "600px", margin: "40px auto 0", padding: "20px 20px 140px", borderTop: "1px solid #1a1a1d", textAlign: "center" }}>
        <p style={{ fontSize: "10px", lineHeight: "1.7", color: "#3f3f46" }}>
          All content represents user opinions and experiences. We do not verify claims.
          Report inappropriate content for review.
          <br />
          Posts are anonymous and expire in 24 hours. Content that violates community guidelines is removed.
        </p>
      </footer>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", backgroundColor: "rgba(24, 24, 27, 0.8)", backdropFilter: "blur(20px)", border: "1px solid #3f3f46", borderRadius: "30px", display: "flex", padding: "8px 12px", gap: "8px", zIndex: 1000 }}>
        <Link href="/" style={{ padding: "8px 16px", borderRadius: "20px", color: "#a1a1aa", textDecoration: "none", fontSize: "13px" }}>Home</Link>
        <Link href="/incidents" style={{ padding: "8px 16px", borderRadius: "20px", color: "#fff", backgroundColor: "#ef4444", textDecoration: "none", fontSize: "13px" }}>Feed</Link>
      </div>
    </div>
  )
}

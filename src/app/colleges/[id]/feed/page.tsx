"use client"

// FIX: The feed page must stay "use client" because it needs:
// - useSession() for the post form auth gate
// - signIn() for the sign-in prompt
// - Upvote/report interactions
//
// What IS fixed:
// 1. Initial data load now uses SWR with deduplication — eliminates the duplicate
//    calls visible in logs where the same feed endpoint was hit 2-3x within 200ms
// 2. revalidateOnFocus: false — stops refetch storm when user switches tabs
// 3. The fetchIncidents() call was also being triggered by React StrictMode in dev;
//    SWR's dedupingInterval prevents that from doubling production calls

import { useState, use } from "react"
import { useSession, signIn } from "next-auth/react"
import useSWR from "swr"
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

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to load feed")
  return res.json()
}

export default function CollegeFeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()

  const [activeCategory, setActiveCategory] = useState("All")
  const [showForm, setShowForm] = useState(false)
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState("")
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set())
  const [reported, setReported] = useState<Set<string>>(new Set())
  const [reportMsg, setReportMsg] = useState<string | null>(null)

  // FIX: SWR replaces useEffect + fetchIncidents().
  // dedupingInterval=5000 collapses the duplicate calls that appeared in the logs
  // (same endpoint hit multiple times within 200ms due to StrictMode + prefetch).
  // refreshInterval=30000 provides light polling so new posts appear eventually.
  const { data, mutate: refreshFeed } = useSWR(
    `/api/colleges/${id}/incidents`,
    fetcher,
    {
      dedupingInterval: 5000,
      revalidateOnFocus: false,
      refreshInterval: 30_000, // soft poll every 30s; users can see new posts
    }
  )

  const college = data?.college ?? null
  const incidents: any[] = data?.incidents ?? []

  async function handlePost() {
    if (!content.trim() || !category) { setPostError("Write something and pick a category."); return }
    setPosting(true)
    setPostError("")
    const res = await fetch(`/api/colleges/${id}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, category }),
    })
    const postData = await res.json()
    if (postData.incident) {
      setContent(""); setCategory(""); setShowForm(false)
      // Immediately revalidate to show the new post
      refreshFeed()
    } else {
      setPostError(postData.error || "Failed to post")
    }
    setPosting(false)
  }

  async function handleUpvote(incidentId: string) {
    if (upvoted.has(incidentId)) return
    setUpvoted(prev => new Set([...prev, incidentId]))
    const res = await fetch(`/api/incidents/${incidentId}/upvote`, { method: "POST" })
    const d = await res.json()
    // Optimistic update via mutate
    refreshFeed()
  }

  async function handleReport(incidentId: string) {
    if (reported.has(incidentId)) return
    if (!session) { signIn("google"); return }
    setReported(prev => new Set([...prev, incidentId]))
    try {
      const res = await fetch(`/api/incidents/${incidentId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "inappropriate" }),
      })
      const d = await res.json()
      setReportMsg(d.message || "Reported.")
      setTimeout(() => setReportMsg(null), 4000)
      if (d.hidden) refreshFeed()
    } catch { /* silent */ }
  }

  const filtered = activeCategory === "All"
    ? incidents
    : incidents.filter(i => i.category === activeCategory)

  const loading = !data

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#f0ede8" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .playfair { font-family: 'Playfair Display', Georgia, serif !important; }
        .dmsans   { font-family: 'DM Sans', sans-serif !important; }
        .tag { font-family: 'DM Sans', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #555; font-weight: 500; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.3s ease forwards; }

        .cat-pill {
          padding: 6px 14px; border-radius: 2px; font-size: 12px;
          font-family: 'DM Sans', sans-serif; font-weight: 600;
          cursor: pointer; border: 1px solid #1e1e1e;
          background: #0d0d0d; color: #666;
          white-space: nowrap; transition: all 0.15s; letter-spacing: 0.3px;
        }
        .cat-pill.active { background: #c8a96e; color: #080808; border-color: #c8a96e; }
        .cat-pill:hover:not(.active) { border-color: #333; color: #aaa; }

        .post-card {
          background: #0d0d0d; border: 1px solid #141414;
          border-radius: 4px; padding: 20px; transition: border-color 0.2s;
        }
        .post-card:hover { border-color: #1e1e1e; }

        .post-textarea {
          width: 100%; height: 110px;
          background: #080808; border: 1px solid #1e1e1e; border-radius: 2px;
          color: #f0ede8; padding: 12px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none; resize: none; transition: border-color 0.2s; line-height: 1.6;
        }
        .post-textarea:focus { border-color: #c8a96e; }
        .post-textarea::placeholder { color: #333; }

        .btn-gold {
          background: #c8a96e; color: #080808; border: none;
          padding: 12px; width: 100%; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-weight: 700;
          font-size: 12px; letter-spacing: 0.5px; text-transform: uppercase;
          cursor: pointer; transition: background 0.2s, opacity 0.2s;
        }
        .btn-gold:hover { background: #d4b87a; }
        .btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }

        .report-btn {
          background: none; border: 1px solid #1e1e1e;
          color: #444; padding: 5px 10px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 10px;
          font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
          cursor: pointer; transition: all 0.15s;
        }
        .report-btn:hover { border-color: #333; color: #888; }
        .report-btn.reported { color: #2a2a2a; border-color: #141414; cursor: default; }

        .upvote-btn {
          background: none; border: 1px solid #1e1e1e;
          color: #555; padding: 5px 12px; border-radius: 2px;
          font-family: 'DM Sans', sans-serif; font-size: 11px;
          font-weight: 600; cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; gap: 6px;
        }
        .upvote-btn:hover { border-color: #c8a96e; color: #c8a96e; }
        .upvote-btn.active { border-color: #c8a96e; color: #c8a96e; background: rgba(200,169,110,0.07); }

        .cat-scroll { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; scrollbar-width:none; }
        .cat-scroll::-webkit-scrollbar { display:none; }
      `}} />

      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: "rgba(8,8,8,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #141414",
        padding: "0 20px", height: "52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href={`/colleges/${id}`} className="dmsans" style={{ fontSize: "12px", color: "#555", textDecoration: "none" }}>
          ← {college?.name || "College"}
        </Link>
        <span className="playfair" style={{ fontSize: "16px", fontWeight: 700 }}>
          Campus <span style={{ color: "#c8a96e", fontStyle: "italic" }}>Pulse</span>
        </span>
        <span className="tag" style={{ fontSize: "9px" }}>24h feed</span>
      </nav>

      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 20px 100px" }}>

        {college && (
          <div style={{
            border: "1px solid #1a1a1a", borderLeft: "2px solid #c8a96e",
            padding: "12px 16px", marginBottom: "20px", borderRadius: "0 2px 2px 0",
          }}>
            <p className="dmsans" style={{ fontSize: "12px", color: "#666", margin: 0 }}>
              <span style={{ color: "#c8a96e", fontWeight: 600 }}>{college.name}</span>
              <span style={{ color: "#444" }}> · Posts expire in 24h</span>
            </p>
          </div>
        )}

        <div className="cat-scroll" style={{ marginBottom: "20px" }}>
          <button className={`cat-pill${activeCategory === "All" ? " active" : ""}`} onClick={() => setActiveCategory("All")}>All</button>
          {CATEGORIES.map(c => (
            <button key={c.id} className={`cat-pill${activeCategory === c.id ? " active" : ""}`} onClick={() => setActiveCategory(c.id)}>
              {c.emoji} {c.id}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "24px" }}>
          {status === "authenticated" ? (
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                width: "100%", padding: "14px 16px",
                background: "#0d0d0d", border: "1px solid #1e1e1e",
                color: showForm ? "#555" : "#444", textAlign: "left",
                fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
                cursor: "pointer", borderRadius: "2px", transition: "border-color 0.2s",
              }}
            >
              {showForm ? "✕  Close" : "✏️  What's happening on campus? Post anonymously..."}
            </button>
          ) : (
            <div
              onClick={() => signIn("google")}
              style={{
                padding: "14px 16px", background: "#0d0d0d", border: "1px solid #1e1e1e",
                color: "#444", textAlign: "center", cursor: "pointer", borderRadius: "2px",
                fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
              }}
            >
              Sign in to post anonymously
            </div>
          )}
        </div>

        {showForm && (
          <div className="fade-up" style={{ background: "#0d0d0d", border: "1px solid #c8a96e", borderRadius: "4px", padding: "20px", marginBottom: "24px" }}>
            <textarea
              className="post-textarea"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Spill it. Posts disappear in 24 hours."
            />
            <div className="cat-scroll" style={{ margin: "12px 0" }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={`cat-pill${category === c.id ? " active" : ""}`}
                  onClick={() => setCategory(c.id)}
                  style={{ fontSize: "11px" }}
                >
                  {c.emoji} {c.id}
                </button>
              ))}
            </div>
            {postError && (
              <p className="dmsans" style={{ color: "#f87171", fontSize: "12px", marginBottom: "10px" }}>{postError}</p>
            )}
            <button className="btn-gold" onClick={handlePost} disabled={posting}>
              {posting ? "Posting..." : "Send to Feed"}
            </button>
            <p className="dmsans" style={{ fontSize: "10px", color: "#333", textAlign: "center", marginTop: "10px", lineHeight: "1.5" }}>
              Anonymous · expires in 24h · visible only to {college?.name || "your college"}
            </p>
          </div>
        )}

        {reportMsg && (
          <div className="fade-up dmsans" style={{
            background: "rgba(200,169,110,0.07)", border: "1px solid rgba(200,169,110,0.2)",
            borderRadius: "2px", padding: "10px 14px", marginBottom: "16px",
            fontSize: "12px", color: "#c8a96e",
          }}>
            ✓ {reportMsg}
          </div>
        )}

        {loading ? (
          <div className="dmsans" style={{ padding: "60px 0", textAlign: "center", color: "#333", fontSize: "13px" }}>
            Fetching stories...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center", border: "1px solid #141414" }}>
            <p className="playfair" style={{ fontSize: "18px", color: "#2a2a2a", fontStyle: "italic", margin: "0 0 8px" }}>
              Nothing here yet.
            </p>
            <p className="dmsans" style={{ fontSize: "12px", color: "#333" }}>Be the first to post.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filtered.map(incident => {
              const cat = CATEGORIES.find(c => c.id === incident.category)
              const hasUpvoted = upvoted.has(incident.id)
              const hasReported = reported.has(incident.id)

              return (
                <div key={incident.id} className="post-card fade-up">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span className="dmsans" style={{
                      fontSize: "10px", fontWeight: 700, letterSpacing: "1px",
                      color: "#c8a96e", textTransform: "uppercase",
                    }}>
                      {cat?.emoji} {incident.category}
                    </span>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span className="dmsans" style={{ fontSize: "10px", color: "#444" }}>{timeAgo(incident.createdAt)}</span>
                      <span className="dmsans" style={{ fontSize: "10px", color: "#555" }}>🔥 {timeLeft(incident.expiresAt)}</span>
                    </div>
                  </div>

                  <p className="dmsans" style={{ fontSize: "14px", lineHeight: "1.7", color: "#ccc", margin: "0 0 16px" }}>
                    {incident.content}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid #111", paddingTop: "12px" }}>
                    <button
                      className={`upvote-btn${hasUpvoted ? " active" : ""}`}
                      onClick={() => handleUpvote(incident.id)}
                    >
                      {hasUpvoted ? "♥" : "♡"} {incident.upvotes}
                    </button>
                    <button
                      className={`report-btn${hasReported ? " reported" : ""}`}
                      onClick={() => !hasReported && handleReport(incident.id)}
                    >
                      {hasReported ? "✓ Reported" : "⚑ Report"}
                    </button>
                    <span className="dmsans" style={{ marginLeft: "auto", fontSize: "10px", color: "#2a2a2a", letterSpacing: "1px", textTransform: "uppercase" }}>
                      Anonymous
                    </span>
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
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const CRITERIA_LABELS: Record<string, string> = {
  teachingClarity: "Teaching",
  approachability: "Approach",
  gradingFairness: "Grading",
  punctuality: "Punctuality",
  partiality: "Fairness",
  behaviour: "Behaviour",
}

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function scoreColor(score: number) {
  if (score >= 4.5) return "#00ff88"
  if (score >= 3.5) return "#FFD700"
  if (score >= 2.5) return "#FF8C00"
  return "#ff4444"
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
    <div style={{ 
      minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#f4f4f5", 
      fontFamily: "Inter, sans-serif", paddingBottom: "100px" 
    }}>
      {/* Header */}
      <header style={{
        padding: "24px 20px", borderBottom: "1px solid #1f1f22",
        backdropFilter: "blur(12px)", backgroundColor: "rgba(10, 10, 10, 0.8)",
        position: "sticky", top: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>Today's Voices</h1>
          <p style={{ fontSize: "11px", color: "#71717a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
            Live Student Feed
          </p>
        </div>
        <Link href="/" style={{ fontSize: "13px", fontWeight: 600, color: "#ef4444", textDecoration: "none" }}>HOME</Link>
      </header>

      <main style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#3f3f46" }}>Syncing latest reviews...</div>
        ) : ratings.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "60px", animation: "fadeIn 0.5s ease" }}>
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>🌙</p>
            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>The campus is quiet.</h2>
            <p style={{ color: "#71717a", fontSize: "14px", marginBottom: "24px" }}>No reviews have been posted today yet.</p>
            <Link href="/" style={{ backgroundColor: "#fff", color: "#000", padding: "12px 24px", borderRadius: "12px", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>
              Be the first to review
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ textAlign: "right", paddingRight: "4px" }}>
               <span style={{ fontSize: "10px", fontWeight: 800, color: "#3f3f46", letterSpacing: "1px" }}>
                {ratings.length} RECENT UPDATES
               </span>
            </div>

            {ratings.map((r) => {
              const overall = ((r.teachingClarity + r.approachability + r.gradingFairness + r.punctuality + r.partiality + r.behaviour) / 6).toFixed(1);
              const scoreNum = parseFloat(overall);
              
              return (
                <div key={r.id} style={{
                  backgroundColor: "#111113", border: "1px solid #1f1f22", borderRadius: "24px", padding: "24px",
                  animation: "fadeIn 0.4s ease"
                }}>
                  {/* Score & Meta */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                      <span style={{ fontSize: "32px", fontWeight: 900, color: scoreColor(scoreNum) }}>{overall}</span>
                      <span style={{ fontSize: "12px", color: "#3f3f46", fontWeight: 700 }}>OVERALL</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#3f3f46", fontWeight: 600 }}>{timeAgo(r.createdAt)}</span>
                  </div>

                  {/* Review Text */}
                  {r.review && (
                    <p style={{ 
                      fontSize: "15px", lineHeight: "1.6", color: "#d4d4d8", margin: "0 0 20px",
                      padding: "16px", backgroundColor: "#0a0a0a", borderRadius: "16px", borderLeft: `3px solid ${scoreColor(scoreNum)}`
                    }}>
                      "{r.review}"
                    </p>
                  )}

                  {/* Grid of Scores */}
                  <div style={{ 
                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", 
                    padding: "20px 0", borderTop: "1px solid #1f1f22", borderBottom: "1px solid #1f1f22",
                    marginBottom: "16px"
                  }}>
                    {Object.entries(CRITERIA_LABELS).map(([key, label]) => (
                      <div key={key}>
                        <p style={{ fontSize: "10px", color: "#3f3f46", fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px" }}>{label}</p>
                        <p style={{ fontSize: "14px", fontWeight: 800, color: "#fff", margin: 0 }}>{r[key]}<span style={{ fontSize: "10px", color: "#3f3f46" }}>/5</span></p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#1f1f22", letterSpacing: "2px" }}>VERIFIED ANONYMOUS</span>
                    {/* Tiny visual indicator of the faculty being reviewed if available in data */}
                    {r.faculty?.name && (
                      <Link href={`/faculty/${r.faculty.id}`} style={{ fontSize: "11px", color: "#ef4444", fontWeight: 700, textDecoration: "none" }}>
                        VIEW PROFILE →
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Nav */}
      <div style={{
        position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
        backgroundColor: "rgba(24, 24, 27, 0.8)", backdropFilter: "blur(20px)",
        border: "1px solid #3f3f46", borderRadius: "30px", display: "flex", padding: "8px 12px", gap: "8px", zIndex: 1000
      }}>
        <Link href="/" style={{ padding: "8px 16px", borderRadius: "20px", color: "#a1a1aa", textDecoration: "none", fontSize: "13px" }}>Home</Link>
        <Link href="/today" style={{ padding: "8px 16px", borderRadius: "20px", color: "#fff", backgroundColor: "#ef4444", textDecoration: "none", fontSize: "13px" }}>Today</Link>
        <Link href="/incidents" style={{ padding: "8px 16px", borderRadius: "20px", color: "#a1a1aa", textDecoration: "none", fontSize: "13px" }}>Feed</Link>
      </div>
    </div>
  )
}
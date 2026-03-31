"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"

export default function RatingReportButton({ ratingId }: { ratingId: string }) {
  const { data: session } = useSession()
  const [reported, setReported] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleReport() {
    if (reported || loading) return
    if (!session) { signIn("google"); return }
    setLoading(true)
    try {
      await fetch(`/api/ratings/${ratingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      setReported(true)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleReport}
      title="Flag this review for moderation"
      disabled={loading}
      style={{
        background: "none", border: "none",
        cursor: reported ? "default" : "pointer",
        fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px",
        color: reported ? "#3f3f46" : "#ef4444",
        opacity: loading ? 0.5 : 1, padding: "2px 0", transition: "color 0.2s",
      }}
    >
      {reported ? "✓ REPORTED" : "⚑ REPORT"}
    </button>
  )
}
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

  const label = reported
    ? "Review reported for moderation"
    : loading
      ? "Reporting review..."
      : "Flag this review for moderation"

  return (
    <button
      onClick={handleReport}
      title={label}
      aria-label={label}
      aria-busy={loading}
      disabled={loading || reported}
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 ${
        reported
          ? "bg-white/5 text-white/50 border border-white/10 cursor-default"
          : "liquid-glass-pill text-rose-400 hover:text-rose-300 hover:border-rose-400/30 cursor-pointer active:scale-95"
      } ${loading ? "opacity-50" : "opacity-100"}`}
    >
      <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
        {reported ? "check" : "flag"}
      </span>
      <span>{reported ? "REPORTED" : "REPORT"}</span>
      <span role="status" aria-live="polite" className="sr-only">
        {reported ? "Review has been reported for moderation." : ""}
      </span>
    </button>
  )
}
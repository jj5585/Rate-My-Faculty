"use client"

import { useState } from "react"

export default function ShareButton({ name, avgRating }: { name: string; avgRating: string | null }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    const text = avgRating
      ? `Check out ${name}'s faculty rating on Rate My Faculty — ${avgRating}/5 ⭐`
      : `Rate ${name} on Rate My Faculty — India's anonymous campus review platform`

    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} — Rate My Faculty`, text, url })
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {
        // clipboard unavailable
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label={copied ? "Link copied to clipboard" : `Share ${name}'s profile`}
      className="flex-1 liquid-glass-pill hover:border-cyan-400/40 text-cyan-300 hover:text-white text-center font-semibold py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
    >
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
        share
      </span>
      <span className="text-[13px]">{copied ? "Copied!" : "Share"}</span>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </button>
  )
}
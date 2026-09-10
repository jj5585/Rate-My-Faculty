"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ImportPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleImport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!url) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/import-faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (data.facultyId) {
        router.push(`/faculty/${data.facultyId}`)
      } else {
        setError("Import failed. Please verify the URL and try again.")
      }
    } catch (err) {
      console.error(err)
      setError("An error occurred during synchronization. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return <div className="min-h-screen bg-[#030611]" />

  return (
    <div className="min-h-screen flex flex-col justify-start relative z-10 selection:bg-blue-600 selection:text-white pb-36">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full pt-2 pb-2 px-4 backdrop-blur-2xl bg-black/40 border-b border-white/[0.08]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full liquid-glass-pill text-[12px] font-semibold text-cyan-300 hover:text-white transition-all no-underline"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
            <span>Directory</span>
          </Link>

          <h1 className="text-[17px] font-extrabold text-white tracking-tight m-0 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-cyan-300 text-[18px]" aria-hidden="true">sync</span>
            <span>Import</span>
          </h1>

          <div className="px-2 py-0.5 rounded-full liquid-badge text-[10px] font-bold text-cyan-200 uppercase tracking-widest">
            Portal Sync
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full px-4 pt-6 z-10 flex flex-col gap-5 max-w-md mx-auto outline-none">
        {/* Header Capsule */}
        <div className="rounded-[24px] liquid-glass p-5 border border-white/15 relative overflow-hidden text-center">
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full liquid-badge text-[10px] font-bold text-cyan-200 uppercase tracking-widest mb-2">
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">cloud_sync</span>
            <span>Database Synchronization</span>
          </div>

          <h2 className="text-[26px] font-black text-white tracking-tight m-0">
            Import Faculty <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
              Records
            </span>
          </h2>

          <p className="text-[13px] text-white/60 mt-2 mb-0 leading-relaxed max-w-xs mx-auto">
            Sync profiles directly from official institutional portals to ensure verified academic data integrity.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-[24px] liquid-glass p-5 border border-cyan-400/30 shadow-liquid-glow flex flex-col gap-4">
          <form onSubmit={handleImport} noValidate className="flex flex-col gap-4">
            {error && (
              <div
                id="import-error"
                role="alert"
                aria-live="assertive"
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[13px] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px] shrink-0" aria-hidden="true">error</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="import-url-input"
                className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-2"
              >
                Official Profile URL
              </label>
              <input
                id="import-url-input"
                name="url"
                type="url"
                className="w-full liquid-glass-input p-3.5 rounded-xl text-[14px] text-white placeholder-white/30 focus:outline-none"
                placeholder="https://institution.edu.in/faculty/..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (error) setError(null)
                }}
                aria-describedby={error ? "import-error" : undefined}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              aria-busy={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[14px] shadow-[0_4px_16px_rgba(10,132,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">download</span>
                  <span>Initialize Import</span>
                </>
              )}
            </button>
          </form>

          {/* Submission Protocol */}
          <div className="pt-4 border-t border-white/10">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-cyan-300 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">checklist</span>
              <span>Submission Protocol</span>
            </h3>

            <ol role="list" className="flex flex-col gap-2 p-0 m-0 list-none">
              {[
                "Locate the faculty member on your college's official staff directory.",
                "Ensure you are viewing their individual profile page.",
                "Copy the full URL from your browser's address bar.",
                "Paste the link above to begin automated data extraction."
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 p-2 rounded-xl bg-white/[0.02]">
                  <span aria-hidden="true" className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="sr-only">Step {i + 1}: </span>
                  <p className="text-[12px] text-white/70 m-0 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/40 leading-relaxed max-w-xs mx-auto m-0">
          All data is sourced directly from institutional domains. <br />
          No external authentication cookies are stored.
        </p>
      </main>
    </div>
  )
}
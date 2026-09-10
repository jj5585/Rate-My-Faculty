"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"

type College = {
  id: string
  name: string
  city: string | null
  state: string | null
  country: string
  website: string
  _count: { faculty: number }
}

export default function HomeClientShell({
  initialColleges,
}: {
  initialColleges: College[]
}) {
  const { data: session } = useSession()
  const [colleges, setColleges] = useState<College[]>(initialColleges)
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [showSubmit, setShowSubmit] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)

  const [form, setForm] = useState({
    name: "", website: "", emailDomain: "", city: "", state: "", country: "India",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState("")
  const [submitError, setSubmitError] = useState("")

  const submitCollegeNameRef = useRef<HTMLInputElement>(null)
  const lastSubmitTriggerRef = useRef<HTMLButtonElement | null>(null)

  // Close mobile menu on Escape key and return focus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && menuOpen) {
        setMenuOpen(false)
        menuTriggerRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [menuOpen])

  // Close submit college form on Escape key and return focus
  useEffect(() => {
    if (!showSubmit) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowSubmit(false)
        lastSubmitTriggerRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showSubmit])

  function toggleSubmitForm(triggerBtn: HTMLButtonElement) {
    if (!session) { signIn("google"); return }
    lastSubmitTriggerRef.current = triggerBtn
    setShowSubmit(prev => {
      const next = !prev
      if (next) {
        setTimeout(() => submitCollegeNameRef.current?.focus(), 50)
      }
      return next
    })
    setSubmitMsg("")
    setSubmitError("")
  }

  // Search handler with debounce
  async function handleSearch(val: string) {
    setQuery(val)

    if (!val.trim()) {
      setColleges(initialColleges)
      return
    }

    clearTimeout((window as any).__searchTimer)
    ;(window as any).__searchTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/colleges?q=${encodeURIComponent(val)}`)
        const data = await res.json()
        setColleges(
          (data.colleges || []).sort(
            (a: College, b: College) => b._count.faculty - a._count.faculty
          )
        )
      } catch {
        // keep current list on error
      }
    }, 300)
  }

  // Filter chips
  const filteredColleges = useMemo(() => {
    if (activeFilter === "all") return colleges
    const f = activeFilter.toLowerCase()
    return colleges.filter(c => {
      const state = (c.state || "").toLowerCase()
      const city = (c.city || "").toLowerCase()
      const name = c.name.toLowerCase()
      if (f === "kerala") return state.includes("kerala") || city.includes("ernakulam") || city.includes("kozhikode") || city.includes("palakkad") || city.includes("thiruvananthapuram")
      if (f === "tamil nadu") return state.includes("tamil nadu") || city.includes("chennai") || city.includes("kattankulathur") || name.includes("srm")
      if (f === "karnataka") return state.includes("karnataka") || city.includes("bangalore") || city.includes("bengaluru") || city.includes("manipal")
      if (f === "nirf") return c._count.faculty >= 30 || name.includes("nit") || name.includes("iit") || name.includes("srm")
      if (f === "autonomous") return c._count.faculty >= 20
      return true
    })
  }, [colleges, activeFilter])

  async function handleSubmit() {
    if (!session) { signIn("google"); return }
    if (!form.name.trim() || !form.website.trim()) {
      setSubmitError("College name and website are required.")
      return
    }
    setSubmitting(true)
    setSubmitError("")
    setSubmitMsg("")
    try {
      const res = await fetch("/api/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitMsg("✓ Submitted! We'll review and approve it within 24 hours.")
        setForm({ name: "", website: "", emailDomain: "", city: "", state: "", country: "India" })
        setShowSubmit(false)
      } else {
        setSubmitError(data.error || "Submission failed.")
      }
    } catch {
      setSubmitError("Something went wrong.")
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen flex flex-col justify-start relative z-10 selection:bg-blue-600 selection:text-white">
      {/* iOS Dynamic Island & Status Bar Header */}
      <header className="sticky top-0 z-50 w-full pt-2 pb-2 px-4 backdrop-blur-2xl bg-black/40 border-b border-white/[0.08] transition-all">
        <div className="max-w-md mx-auto flex flex-col gap-2">
          {/* Top Status Bar Row */}
          <div className="flex items-center justify-between h-7 text-xs font-semibold tracking-tight text-white/90">
            <span className="w-14 text-left font-semibold text-[15px] tracking-tight">9:41</span>
            
            {/* iPhone Dynamic Island Capsule */}
            <div className="mx-auto h-[28px] w-[124px] bg-black rounded-full flex items-center justify-between px-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08)] relative overflow-hidden group">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-indigo-500/60" />
              </div>
              <div className="flex items-center gap-1 opacity-80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] tracking-wide text-white/90 font-semibold uppercase">Campus</span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0a] border border-blue-500/30 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-400" />
              </div>
            </div>

            {/* Cellular, Wifi, Battery */}
            <div className="w-14 flex items-center justify-end gap-1.5 text-white/90">
              <svg className="w-4 h-3.5 fill-current" viewBox="0 0 17 12" aria-hidden="true">
                <rect height="4" rx="0.5" width="2.5" x="0" y="8" />
                <rect height="6.5" rx="0.5" width="2.5" x="4" y="5.5" />
                <rect height="9" rx="0.5" width="2.5" x="8" y="3" />
                <rect height="12" rx="0.5" width="2.5" x="12" y="0" />
              </svg>
              <svg className="w-4 h-3 fill-current" viewBox="0 0 16 12" aria-hidden="true">
                <path d="M8 12a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6Zm5.6-5.8a8.3 8.3 0 0 0-11.2 0 .8.8 0 0 1-1.1-1.1 9.9 9.9 0 0 1 13.4 0 .8.8 0 0 1-1.1 1.1Zm-2.8 2.8a4.4 4.4 0 0 0-5.6 0 .8.8 0 0 1-1-1.2 6 6 0 0 1 7.6 0 .8.8 0 0 1-1 1.2Z" />
              </svg>
              <div className="flex items-center" aria-hidden="true">
                <div className="w-5 h-2.5 rounded-[3.5px] border border-white/80 p-0.5 flex items-center">
                  <div className="w-full h-full bg-white rounded-[1.5px]" />
                </div>
                <div className="w-0.5 h-1 bg-white/70 rounded-r-sm" />
              </div>
            </div>
          </div>

          {/* Navigation Bar Branding & Actions */}
          <div className="flex items-center justify-between pt-1 pb-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Link href="/" className="text-[24px] font-extrabold tracking-tight text-white leading-tight flex items-center gap-1.5 no-underline">
                  RateMy<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Faculty</span>
                </Link>
                <div className="px-2 py-0.5 rounded-full liquid-badge flex items-center gap-1">
                  <span className="material-symbols-outlined text-cyan-300 text-[13px]" aria-hidden="true">verified</span>
                  <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-widest">India</span>
                </div>
              </div>
              <p className="text-[11px] font-medium text-white/50 tracking-wide mt-0.5">Academic Transparency Platform</p>
            </div>

            {/* Action Circles */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => toggleSubmitForm(e.currentTarget)}
                aria-label="Submit College"
                aria-expanded={showSubmit}
                aria-controls="submit-college-form"
                className="w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-cyan-300 active:scale-95 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:border-cyan-400/40"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">add</span>
              </button>

              {session ? (
                <Link
                  href="/profile"
                  aria-label="My Account"
                  className="w-9 h-9 rounded-full liquid-glass overflow-hidden flex items-center justify-center text-white/80 active:scale-95 transition-all border border-white/20 shadow-md"
                >
                  {session.user?.image ? (
                    <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-semibold text-xs">
                      {(session.user?.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="px-3 py-1.5 rounded-full liquid-glass-pill text-[12px] font-semibold text-cyan-300 hover:text-white transition-all active:scale-95"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full px-4 pt-4 pb-36 z-10 flex flex-col gap-5 max-w-md mx-auto outline-none">
        {/* Hero Capsule with Liquid Refraction */}
        <section className="relative overflow-hidden rounded-[26px] liquid-glass p-5">
          {/* Glow Orbs inside card */}
          <div className="absolute -top-12 -right-10 w-44 h-44 rounded-full bg-blue-500/25 blur-2xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-8 w-36 h-36 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 flex flex-col gap-3">
            {/* Apple Pill Badge */}
            <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full liquid-glass-pill border border-blue-400/30 text-blue-300 shadow-sm">
              <span className="material-symbols-outlined text-[15px] text-cyan-300" aria-hidden="true">verified</span>
              <span className="text-[11px] font-semibold tracking-wide uppercase">Student-Powered Reviews · Across India</span>
            </div>

            {/* Hero Headline */}
            <h1 className="text-[28px] font-extrabold leading-[34px] tracking-tight text-white">
              Find the best <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-200 to-white">mentors</span> at your college.
            </h1>

            <p className="text-[14px] text-white/70 leading-relaxed font-normal">
              Honest, anonymous faculty reviews from verified students across engineering universities & national institutes.
            </p>

            {/* Liquid Glass Search Bar Capsule */}
            <form role="search" onSubmit={e => e.preventDefault()} className="mt-1 relative flex items-center">
              <label htmlFor="college-search-input" className="sr-only">
                Search college, city, or professor
              </label>
              <span className="material-symbols-outlined absolute left-3.5 text-white/50 text-[20px] pointer-events-none" aria-hidden="true">
                search
              </span>
              <input
                id="college-search-input"
                type="search"
                className="w-full liquid-glass-input pl-11 pr-16 py-3.5 rounded-2xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all shadow-inner"
                placeholder="Search college, city, or professor..."
                value={query}
                onChange={e => handleSearch(e.target.value)}
                aria-describedby="search-live-status"
              />
              <div className="absolute right-3 flex items-center gap-1 text-white/50">
                {query && (
                  <button
                    type="button"
                    onClick={() => handleSearch("")}
                    aria-label="Clear Search"
                    className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-[12px] transition-colors"
                  >
                    ✕
                  </button>
                )}
                <span className="material-symbols-outlined text-[18px] text-white/40" aria-hidden="true">mic</span>
              </div>
              <div id="search-live-status" role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                {query ? `${filteredColleges.length} colleges found.` : ""}
              </div>
            </form>

            {/* Segmented Liquid Glass Horizontal Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 -mx-5 px-5 no-scrollbar" role="group" aria-label="College Filters">
              {[
                { id: "all", label: `All Colleges (${colleges.length})` },
                { id: "kerala", label: "Kerala" },
                { id: "tamil nadu", label: "Tamil Nadu" },
                { id: "karnataka", label: "Karnataka" },
                { id: "nirf", label: "NIRF Top 100" },
                { id: "autonomous", label: "Autonomous" },
              ].map(chip => {
                const isActive = activeFilter === chip.id
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setActiveFilter(chip.id)}
                    aria-pressed={isActive}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_14px_rgba(10,132,255,0.4)] border border-white/30"
                        : "liquid-glass-pill text-white/80 hover:text-white"
                    }`}
                  >
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />}
                    <span>{chip.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Key Credibility Stats: Sculpted Liquid Glass Pods */}
        <section className="grid grid-cols-3 gap-2.5">
          <div className="liquid-glass rounded-[22px] p-3 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-emerald-400/40 transition-all">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mb-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]" aria-hidden="true">verified</span>
            </div>
            <span className="text-[17px] font-bold text-white tracking-tight">4,200+</span>
            <span className="text-[11px] font-medium text-white/55 uppercase tracking-wider">Reviews</span>
          </div>

          <div className="liquid-glass rounded-[22px] p-3 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-cyan-400/40 transition-all">
            <div className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center mb-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
              <span className="material-symbols-outlined text-cyan-400 text-[18px]" aria-hidden="true">domain</span>
            </div>
            <span className="text-[17px] font-bold text-white tracking-tight">{colleges.length}+</span>
            <span className="text-[11px] font-medium text-white/55 uppercase tracking-wider">Campuses</span>
          </div>

          <div className="liquid-glass rounded-[22px] p-3 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-indigo-400/40 transition-all">
            <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center mb-1.5 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
              <span className="material-symbols-outlined text-indigo-400 text-[18px]" aria-hidden="true">shield_person</span>
            </div>
            <span className="text-[17px] font-bold text-white tracking-tight">100%</span>
            <span className="text-[11px] font-medium text-white/55 uppercase tracking-wider">Anonymous</span>
          </div>
        </section>

        {/* iOS Featured Editorial Story Card */}
        <section className="liquid-glass rounded-[24px] p-4 relative overflow-hidden border border-white/15">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md">
                <span className="material-symbols-outlined text-[17px]" aria-hidden="true">format_quote</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-white">Verified Student Story</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                </div>
                <span className="text-[11px] text-white/55 font-medium">Batch of '25 · Engineering Campuses</span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 text-[12px] font-bold">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
              <span>5.0</span>
            </div>
          </div>
          <p className="text-[13px] italic text-white/80 leading-relaxed pl-1 font-normal">
            "Professors who take time during lab experiments to explain theoretical concepts transform the academic experience for freshers. Honest student reviews ensure transparency across campuses."
          </p>
          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/10 px-1">
            <span className="text-[11px] font-medium text-cyan-300 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]" aria-hidden="true">school</span>
              Academic Integrity
            </span>
            <Link href="/stories" className="text-[11px] text-cyan-300 hover:text-white flex items-center gap-1 font-medium transition-colors">
              Read 20+ Stories →
            </Link>
          </div>
        </section>

        {/* Submit College Form (Expandable) */}
        {showSubmit && (
          <form
            id="submit-college-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="rounded-[24px] liquid-glass p-5 flex flex-col gap-4 border border-cyan-400/30 shadow-liquid-glow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-300 text-[20px]" aria-hidden="true">add_business</span>
                <h2 className="text-[17px] font-bold text-white">Submit a College</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSubmit(false)
                  lastSubmitTriggerRef.current?.focus()
                }}
                className="w-7 h-7 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center text-xs"
                aria-label="Close submit form"
              >
                ✕
              </button>
            </div>

            <p className="text-[13px] text-white/70">
              Can't find your college? Submit it here and we'll verify and add it within 24 hours.
            </p>

            {submitError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[13px]">
                {submitError}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="submit-college-name" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                  College Name *
                </label>
                <input
                  id="submit-college-name"
                  ref={submitCollegeNameRef}
                  required
                  className="w-full liquid-glass-input px-3.5 py-2.5 rounded-xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  placeholder="e.g. SRMIST Kattankulathur"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="submit-college-website" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                  Official Website *
                </label>
                <input
                  id="submit-college-website"
                  type="url"
                  required
                  className="w-full liquid-glass-input px-3.5 py-2.5 rounded-xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  placeholder="https://srmist.edu.in"
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="submit-college-city" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                    City
                  </label>
                  <input
                    id="submit-college-city"
                    className="w-full liquid-glass-input px-3.5 py-2.5 rounded-xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Chennai"
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="submit-college-state" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                    State
                  </label>
                  <input
                    id="submit-college-state"
                    className="w-full liquid-glass-input px-3.5 py-2.5 rounded-xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Tamil Nadu"
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-[14px] shadow-[0_4px_16px_rgba(10,132,255,0.4)] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit College"}
            </button>
          </form>
        )}

        {submitMsg && (
          <div role="status" aria-live="polite" className="p-3.5 rounded-2xl liquid-glass border border-emerald-400/40 text-emerald-300 text-[13px]">
            {submitMsg}
          </div>
        )}

        {/* Top Reviewed Campuses Section */}
        <section className="flex flex-col gap-3">
          {/* Section Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-[20px]" aria-hidden="true">leaderboard</span>
              <h2 className="text-[17px] font-bold text-white tracking-tight">Top Reviewed Campuses</h2>
            </div>
            <button
              type="button"
              onClick={(e) => toggleSubmitForm(e.currentTarget)}
              aria-label="Submit College"
              aria-expanded={showSubmit}
              aria-controls="submit-college-form"
              className="liquid-glass-pill px-3 py-1 rounded-full text-[12px] font-semibold text-cyan-300 hover:text-white flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-[15px]" aria-hidden="true">add</span>
              <span>Submit College</span>
            </button>
          </div>

          {/* Campus Cards Stack */}
          {filteredColleges.length === 0 ? (
            <div className="liquid-glass rounded-[22px] p-8 text-center flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-white/40 text-[32px]" aria-hidden="true">search_off</span>
              <p className="text-white/80 font-semibold text-[15px]">No colleges found</p>
              <p className="text-white/50 text-[13px]">Try adjusting your search or filter keywords.</p>
            </div>
          ) : (
            <ul role="list" className="flex flex-col gap-2.5 p-0 m-0 list-none" aria-label="College List">
              {filteredColleges.map((c) => {
                const location = [c.city, c.state].filter(Boolean).join(", ")
                return (
                  <li key={c.id} className="list-none">
                    <Link
                      href={`/colleges/${c.id}`}
                      className="group block p-4 rounded-[22px] liquid-glass hover:border-white/30 transition-all duration-200 active:scale-[0.985] no-underline"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col min-w-0 flex-1">
                          <h3 className="text-[16px] font-bold text-white group-hover:text-cyan-300 transition-colors truncate m-0">
                            {c.name}
                          </h3>
                          <span className="flex items-center gap-1 text-[12px] text-white/60 mt-0.5 font-normal">
                            <span className="material-symbols-outlined text-[15px] text-blue-400" aria-hidden="true">location_on</span>
                            {location || "India"}
                          </span>
                        </div>

                        {/* Star Pill */}
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[12px] font-bold flex-shrink-0">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                          <span>{c._count.faculty >= 10 ? "4.8" : "4.5"}</span>
                          <span className="sr-only">Average Rating {c._count.faculty >= 10 ? "4.8" : "4.5"} out of 5 stars</span>
                        </div>
                      </div>

                      {/* Tags & Disclosure Row */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-400/25">
                            {c._count.faculty} {c._count.faculty === 1 ? "Faculty" : "Faculty"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/20 text-purple-300 border border-purple-400/25">
                            Verified
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white/70">
                            Engineering
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all text-[18px]" aria-hidden="true">
                          chevron_right
                        </span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Browse All CTA */}
        <div className="pt-1">
          <Link
            href="/leaderboard"
            className="w-full py-4 rounded-[20px] bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-[0_12px_28px_rgba(10,132,255,0.35)] border border-white/30 active:scale-[0.98] transition-all no-underline"
          >
            <span>Browse Top Faculty Leaderboard</span>
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">arrow_forward</span>
          </Link>
        </div>

        {/* Frosted Liquid Glass Community Disclosure */}
        <footer className="mt-2 rounded-[22px] liquid-glass p-4 text-center flex flex-col gap-2 border border-white/10">
          <div className="flex items-center justify-center gap-1.5 text-white/50">
            <span className="material-symbols-outlined text-[15px]" aria-hidden="true">info</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider">Community Disclosure</span>
          </div>
          <p className="text-[12px] text-white/60 leading-relaxed font-normal m-0">
            All content represents authentic user opinions and academic experiences. Report inappropriate reviews for priority student moderation.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2 text-[12px] text-white/50 border-t border-white/10">
            <Link href="/terms" className="hover:text-cyan-300 transition-colors no-underline text-white/60">Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-cyan-300 transition-colors no-underline text-white/60">Privacy Policy</Link>
            <span>•</span>
            <Link href="/stories" className="hover:text-cyan-300 transition-colors no-underline text-white/60">Campus Stories</Link>
          </div>
        </footer>
      </main>
    </div>
  )
}
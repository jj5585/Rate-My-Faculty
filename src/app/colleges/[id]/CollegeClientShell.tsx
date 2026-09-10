"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Faculty = {
  id: string
  name: string
  designation: string | null
  department: string | null
  ratingCount: number
  avgRating: string | null
}

type College = {
  id: string
  name: string
  website: string
  city: string | null
  state: string | null
  country: string
  emailDomain: string | null
}

export default function CollegeClientShell({
  college,
  faculty: initialFaculty,
}: {
  college: College
  faculty: Faculty[]
}) {
  const { data: session } = useSession()
  const router = useRouter()

  const [faculty] = useState<Faculty[]>(initialFaculty)
  const [query, setQuery] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "name">("rating")

  const [form, setForm] = useState({ name: "", designation: "", department: "", experience: "" })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState("")
  const [addSuccess, setAddSuccess] = useState("")

  const addTriggerRef = useRef<HTMLButtonElement | null>(null)
  const facultyNameInputRef = useRef<HTMLInputElement | null>(null)

  // Focus first input when add faculty form expands, or return focus to trigger when collapsed
  useEffect(() => {
    if (showAdd) {
      facultyNameInputRef.current?.focus()
    }
  }, [showAdd])

  // Allow Escape key to dismiss the open form and restore focus to trigger
  useEffect(() => {
    if (!showAdd) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAdd(false)
        addTriggerRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showAdd])

  async function handleAddFaculty() {
    if (!session) { signIn("google"); return }
    if (!form.name.trim()) { setAddError("Name is required"); return }
    setAdding(true)
    setAddError("")
    setAddSuccess("")
    try {
      const res = await fetch("/api/faculty/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, collegeId: college.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setAddSuccess(data.existing ? "Faculty already exists — navigating to their profile." : "Faculty added successfully!")
        setForm({ name: "", designation: "", department: "", experience: "" })
        setTimeout(() => router.push(`/faculty/${data.facultyId}`), 1000)
      } else {
        setAddError(data.error || "Failed to add faculty")
      }
    } catch {
      setAddError("Something went wrong.")
    }
    setAdding(false)
  }

  const filtered = faculty.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    (f.department || "").toLowerCase().includes(query.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "rating") return parseFloat(b.avgRating || "0") - parseFloat(a.avgRating || "0")
    if (sortBy === "reviews") return b.ratingCount - a.ratingCount
    return a.name.localeCompare(b.name)
  })

  const location = [college.city, college.state, college.country].filter(Boolean).join(", ")

  return (
    <div className="min-h-screen flex flex-col justify-start relative z-10 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full pt-2 pb-2 px-4 backdrop-blur-2xl bg-black/40 border-b border-white/[0.08]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/"
            aria-label="Back to all colleges"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-pill text-[12px] font-semibold text-cyan-300 hover:text-white transition-all no-underline"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
            <span>Colleges</span>
          </Link>

          <Link href="/" className="text-[18px] font-extrabold tracking-tight text-white no-underline">
            RateMy<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Faculty</span>
          </Link>

          <div>
            {session ? (
              <Link
                href="/profile"
                aria-label="Your Profile"
                className="w-8 h-8 rounded-full liquid-glass overflow-hidden flex items-center justify-center text-white/80 active:scale-95 transition-all border border-white/20"
              >
                {session.user?.image ? (
                  <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-cyan-300">{(session.user?.name || "U")[0].toUpperCase()}</span>
                )}
              </Link>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-3 py-1 rounded-full liquid-glass-pill text-[12px] font-semibold text-cyan-300 hover:text-white transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full px-4 pt-4 pb-40 z-10 flex flex-col gap-4 max-w-md mx-auto outline-none">
        {/* College Hero Capsule */}
        <section className="relative overflow-hidden rounded-[26px] liquid-glass p-5 flex flex-col gap-3">
          <div className="absolute -top-10 -right-8 w-36 h-36 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" aria-hidden="true" />
          
          <div className="flex items-center gap-1.5 text-cyan-300 text-[12px] font-medium">
            <span className="material-symbols-outlined text-[16px] text-blue-400" aria-hidden="true">location_on</span>
            <span>{location || "India"}</span>
          </div>

          <h1 className="text-[24px] font-extrabold leading-tight text-white tracking-tight m-0">
            {college.name}
          </h1>

          <div className="flex items-center justify-between pt-1 border-t border-white/10 flex-wrap gap-2">
            <a
              href={college.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit official website for ${college.name} (opens in new tab)`}
              className="inline-flex items-center gap-1 text-[12px] font-medium text-cyan-300 hover:text-white transition-colors no-underline"
            >
              <span>Official Website</span>
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">open_in_new</span>
            </a>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {faculty.length} Faculty
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Verified
              </span>
            </div>
          </div>
        </section>

        {/* Search & Actions Bar */}
        <div className="flex flex-col gap-2.5">
          <form role="search" onSubmit={e => e.preventDefault()} className="relative flex items-center">
            <label htmlFor="faculty-search-input" className="sr-only">Search faculty or department</label>
            <span className="material-symbols-outlined absolute left-3.5 text-white/50 text-[20px] pointer-events-none" aria-hidden="true">
              search
            </span>
            <input
              id="faculty-search-input"
              type="search"
              className="w-full liquid-glass-input pl-11 pr-24 py-3 rounded-2xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
              placeholder="Search faculty or dept..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-describedby="faculty-search-announcement"
            />
            <button
              ref={addTriggerRef}
              type="button"
              onClick={() => {
                if (!session) { signIn("google"); return }
                setShowAdd(!showAdd)
                setAddError("")
                setAddSuccess("")
              }}
              aria-expanded={showAdd}
              aria-controls="add-faculty-form"
              aria-label={showAdd ? "Close add faculty form" : "Add faculty member"}
              className="absolute right-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[12px] font-bold tracking-wide active:scale-95 transition-all shadow-sm"
            >
              {showAdd ? "✕" : "+ Add"}
            </button>
            <div id="faculty-search-announcement" role="status" aria-live="polite" className="sr-only">
              {query ? `${sorted.length} faculty found.` : ""}
            </div>
          </form>

          {/* Sort Buttons */}
          <div role="group" aria-label="Sort faculty by" className="flex items-center gap-2">
            <span className="text-[11px] text-white/50 font-semibold uppercase tracking-wider pl-1">Sort:</span>
            {(["rating", "reviews", "name"] as const).map(s => {
              const isActive = sortBy === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSortBy(s)}
                  aria-pressed={isActive}
                  className={`px-3 py-1 rounded-full text-[12px] font-semibold uppercase tracking-wide transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_2px_10px_rgba(10,132,255,0.4)] border border-white/30"
                      : "liquid-glass-pill text-white/70 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {/* Add Faculty Form (Expandable) */}
        {showAdd && (
          <form
            id="add-faculty-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleAddFaculty()
            }}
            className="rounded-[24px] liquid-glass p-5 flex flex-col gap-3 border border-cyan-400/30 shadow-liquid-glow"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-white m-0">Add Faculty Member</h2>
              <span className="text-[12px] text-white/50">{college.name}</span>
            </div>

            {addError && (
              <div role="alert" className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[13px]">
                {addError}
              </div>
            )}
            {addSuccess && (
              <div role="status" aria-live="polite" className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[13px]">
                {addSuccess}
              </div>
            )}

            <div>
              <label htmlFor="add-faculty-name" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                ref={facultyNameInputRef}
                id="add-faculty-name"
                required
                className="w-full liquid-glass-input px-3.5 py-2.5 rounded-xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                placeholder="Dr. John Smith"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="add-faculty-designation" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                  Designation
                </label>
                <input
                  id="add-faculty-designation"
                  className="w-full liquid-glass-input px-3.5 py-2.5 rounded-xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  placeholder="Associate Professor"
                  value={form.designation}
                  onChange={e => setForm({ ...form, designation: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="add-faculty-department" className="block text-[11px] font-bold text-white/70 uppercase tracking-wider mb-1">
                  Department
                </label>
                <input
                  id="add-faculty-department"
                  className="w-full liquid-glass-input px-3.5 py-2.5 rounded-xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  placeholder="Computer Science"
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={adding}
              aria-busy={adding}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-[14px] shadow-[0_4px_16px_rgba(10,132,255,0.4)] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add Faculty"}
            </button>
          </form>
        )}

        {/* Faculty List */}
        {sorted.length === 0 ? (
          <div className="liquid-glass rounded-[22px] p-8 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-white/40 text-[32px]" aria-hidden="true">person_search</span>
            <p className="text-white/80 font-semibold text-[15px]">No faculty members found</p>
            <p className="text-white/50 text-[13px]">Be the first to add a professor from {college.name}.</p>
          </div>
        ) : (
          <ul role="list" className="flex flex-col gap-2.5 p-0 m-0 list-none" aria-label="Faculty Directory">
            {sorted.map((f, idx) => (
              <li key={f.id} className="list-none">
                <Link
                  href={`/faculty/${f.id}`}
                  className="group block p-4 rounded-[22px] liquid-glass hover:border-white/30 transition-all duration-200 active:scale-[0.985] no-underline"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Avatar initial */}
                    <div
                      aria-hidden="true"
                      className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-cyan-400/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-extrabold text-[16px] flex-shrink-0 shadow-sm"
                    >
                      {f.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-bold text-white group-hover:text-cyan-300 transition-colors truncate m-0">
                        {f.name}
                      </h3>
                      {(f.designation || f.department) && (
                        <p className="text-[12px] text-white/60 truncate m-0 mt-0.5">
                          {[f.designation, f.department].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>

                    {/* Rating Pill */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      {f.avgRating ? (
                        <>
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[12px] font-bold">
                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                            <span aria-hidden="true">{f.avgRating}</span>
                            <span className="sr-only">Rated {f.avgRating} out of 5 stars</span>
                          </div>
                          <span className="text-[10px] text-white/50 mt-0.5">
                            {f.ratingCount} {f.ratingCount === 1 ? "review" : "reviews"}
                          </span>
                        </>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[11px] font-medium">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* College Quick Nav Pill Bar */}
      <div className="fixed bottom-20 inset-x-0 z-40 pointer-events-none flex justify-center px-4">
        <nav
          aria-label="College quick links"
          className="pointer-events-auto rounded-full liquid-glass-pill px-3 py-1.5 flex items-center gap-2 shadow-liquid border border-white/20 backdrop-blur-xl"
        >
          <Link
            href={`/colleges/${college.id}/feed`}
            className="px-3 py-1 rounded-full text-[12px] font-semibold text-white/80 hover:text-white transition-colors no-underline"
          >
            Feed
          </Link>
          <span className="text-white/20">•</span>
          <Link
            href={`/colleges/${college.id}/today`}
            className="px-3 py-1 rounded-full text-[12px] font-semibold text-white/80 hover:text-white transition-colors no-underline"
          >
            Today
          </Link>
          <span className="text-white/20">•</span>
          <Link
            href="/rooms"
            className="px-3 py-1 rounded-full text-[12px] font-semibold text-white/80 hover:text-white transition-colors no-underline"
          >
            Rooms
          </Link>
        </nav>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"

type College = { id: string; name: string; city: string | null }
type Profile = {
  id: string
  displayName: string | null
  course: string | null
  graduationYear: number | null
  collegeId: string | null
  college: College | null
  createdAt: string
  updatedAt: string
}

const CURRENT_YEAR = new Date().getFullYear()
const GRAD_YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR + i)

export default function ProfilePage() {
  const { data: session, status } = useSession()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")
  const [saveError, setSaveError] = useState("")

  // College search
  const [colleges, setColleges] = useState<College[]>([])
  const [collegeQuery, setCollegeQuery] = useState("")
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false)
  const [activeCollegeIndex, setActiveCollegeIndex] = useState(-1)

  // Form state
  const [form, setForm] = useState({
    displayName: "",
    course: "",
    graduationYear: "",
    collegeId: "",
    collegeName: "",
  })

  useEffect(() => {
    if (status === "authenticated") fetchProfile()
  }, [status])

  async function fetchProfile() {
    setLoading(true)
    try {
      const res = await fetch("/api/profile")
      const data = await res.json()
      if (res.ok) {
        setProfile(data.profile)
        if (data.profile) {
          setForm({
            displayName: data.profile.displayName || "",
            course: data.profile.course || "",
            graduationYear: data.profile.graduationYear?.toString() || "",
            collegeId: data.profile.collegeId || "",
            collegeName: data.profile.college?.name || "",
          })
          setCollegeQuery(data.profile.college?.name || "")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  async function searchColleges(q: string) {
    if (!q.trim()) { setColleges([]); return }
    try {
      const res = await fetch(`/api/colleges?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setColleges(data.colleges || [])
    } catch {
      setColleges([])
    }
  }

  function handleCollegeInput(val: string) {
    setCollegeQuery(val)
    setForm(f => ({ ...f, collegeId: "", collegeName: "" }))
    setShowCollegeDropdown(true)
    setActiveCollegeIndex(-1)
    const timer = setTimeout(() => searchColleges(val), 300)
    return () => clearTimeout(timer)
  }

  function selectCollege(c: College) {
    setForm(f => ({ ...f, collegeId: c.id, collegeName: c.name }))
    setCollegeQuery(c.name)
    setColleges([])
    setShowCollegeDropdown(false)
    setActiveCollegeIndex(-1)
  }

  const handleCollegeKeyDown = (e: React.KeyboardEvent) => {
    if (!showCollegeDropdown || colleges.length === 0) {
      if (e.key === "ArrowDown" && colleges.length > 0) {
        setShowCollegeDropdown(true)
        setActiveCollegeIndex(0)
        e.preventDefault()
      }
      return
    }

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveCollegeIndex(prev => (prev < colleges.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveCollegeIndex(prev => (prev > 0 ? prev - 1 : colleges.length - 1))
    } else if (e.key === "Enter") {
      if (activeCollegeIndex >= 0 && activeCollegeIndex < colleges.length) {
        e.preventDefault()
        selectCollege(colleges[activeCollegeIndex])
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      setShowCollegeDropdown(false)
      setActiveCollegeIndex(-1)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaveMsg("")
    setSaveError("")
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: form.displayName,
          course: form.course,
          graduationYear: form.graduationYear,
          collegeId: form.collegeId,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setProfile(data.profile)
        setEditing(false)
        setSaveMsg("Profile saved successfully.")
        setTimeout(() => setSaveMsg(""), 3000)
      } else {
        setSaveError(data.error || "Failed to save.")
      }
    } catch {
      setSaveError("Something went wrong.")
    }
    setSaving(false)
  }

  // ── Auth gate ──
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-cyan-300 font-semibold text-sm">
        Loading profile...
      </div>
    )
  }

  if (!session) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen flex items-center justify-center p-6 relative z-10 pb-36 outline-none">
        <div className="w-full max-w-sm rounded-[28px] liquid-glass p-8 text-center flex flex-col items-center gap-4 border border-white/15 shadow-liquid-glow">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-cyan-400/30 border border-white/20 flex items-center justify-center text-cyan-300">
            <span className="material-symbols-outlined text-[32px]" aria-hidden="true">account_circle</span>
          </div>

          <div>
            <h1 className="text-[22px] font-extrabold text-white tracking-tight m-0">Student Profile</h1>
            <p className="text-[13px] text-white/60 mt-1 mb-0 leading-relaxed">
              Sign in with your Google account to customize your academic identity and track your campus contributions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => signIn("google")}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(10,132,255,0.4)] hover:brightness-110 transition-all cursor-pointer"
          >
            <span>Sign in with Google</span>
          </button>
        </div>
      </main>
    )
  }

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
            Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Profile</span>
          </h1>

          <div className="px-2 py-0.5 rounded-full liquid-badge text-[10px] font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full px-4 pt-4 z-10 flex flex-col gap-4 max-w-md mx-auto outline-none">
        {/* User Hero Capsule */}
        <div className="rounded-[24px] liquid-glass p-5 border border-white/15 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user?.name ? `${session.user.name}'s profile avatar` : "Profile avatar"}
              className="w-16 h-16 rounded-2xl border-2 border-cyan-400/40 object-cover shadow-md shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-300 font-extrabold text-[22px] shrink-0">
              {(profile?.displayName || session.user?.name || "U").charAt(0)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-300">Student Account</span>
              <span className="material-symbols-outlined text-cyan-400 text-[14px]" aria-hidden="true">verified</span>
            </div>
            <h2 className="text-[18px] font-extrabold text-white truncate m-0">
              {profile?.displayName || session.user?.name || "Student"}
            </h2>
            <p className="text-[12px] text-white/50 truncate m-0 mt-0.5">
              {session.user?.email}
            </p>
          </div>
        </div>

        {/* Save message */}
        {saveMsg && (
          <div role="status" aria-live="polite" className="p-3.5 rounded-2xl liquid-glass border border-emerald-400/40 text-emerald-300 text-[13px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">check_circle</span>
            <span>{saveMsg}</span>
          </div>
        )}

        {/* ── EDIT MODE ── */}
        {editing ? (
          <form
            onSubmit={(e) => { e.preventDefault(); handleSave(); }}
            className="rounded-[24px] liquid-glass p-5 flex flex-col gap-4 border border-cyan-400/30 shadow-liquid-glow"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-extrabold text-white m-0">Edit Profile</h3>
              <button
                type="button"
                onClick={() => { setEditing(false); setSaveError("") }}
                className="text-[12px] text-white/50 hover:text-white"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Display Name */}
              <div>
                <label htmlFor="profile-display-name" className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Display Name
                </label>
                <input
                  id="profile-display-name"
                  className="w-full liquid-glass-input p-3 rounded-xl text-[14px] text-white placeholder-white/30 focus:outline-none"
                  placeholder="How you want to appear (e.g. Joel)"
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                />
              </div>

              {/* Course */}
              <div>
                <label htmlFor="profile-course" className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Course / Programme
                </label>
                <input
                  id="profile-course"
                  className="w-full liquid-glass-input p-3 rounded-xl text-[14px] text-white placeholder-white/30 focus:outline-none"
                  placeholder="e.g. B.Tech Computer Science"
                  value={form.course}
                  onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                />
              </div>

              {/* Graduation Year */}
              <div>
                <label htmlFor="profile-grad-year" className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  Expected Graduation Year
                </label>
                <select
                  id="profile-grad-year"
                  className="w-full liquid-glass-input p-3 rounded-xl text-[14px] text-white bg-[#0a1224] focus:outline-none"
                  value={form.graduationYear}
                  onChange={e => setForm(f => ({ ...f, graduationYear: e.target.value }))}
                >
                  <option value="">Select year...</option>
                  {GRAD_YEARS.map(y => (
                    <option key={y} value={y} className="bg-[#030611] text-white">{y}</option>
                  ))}
                </select>
              </div>

              {/* College Combobox */}
              <div>
                <label htmlFor="profile-college-search" className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                  College / Institution
                </label>
                <div className="relative">
                  <input
                    id="profile-college-search"
                    role="combobox"
                    aria-expanded={showCollegeDropdown && colleges.length > 0}
                    aria-autocomplete="list"
                    aria-controls="profile-college-results"
                    aria-activedescendant={showCollegeDropdown && colleges.length > 0 && activeCollegeIndex >= 0 && colleges[activeCollegeIndex] ? `college-opt-${colleges[activeCollegeIndex].id}` : undefined}
                    className="w-full liquid-glass-input p-3 pr-10 rounded-xl text-[14px] text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    placeholder="Search your college..."
                    value={collegeQuery}
                    onChange={e => handleCollegeInput(e.target.value)}
                    onKeyDown={handleCollegeKeyDown}
                    onFocus={() => collegeQuery && setShowCollegeDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCollegeDropdown(false), 200)}
                  />
                  {form.collegeId && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 material-symbols-outlined text-[18px]">
                      check_circle
                    </span>
                  )}

                  {/* Dropdown */}
                  {showCollegeDropdown && colleges.length > 0 && (
                    <ul
                      id="profile-college-results"
                      role="listbox"
                      aria-label="College suggestions"
                      className="absolute top-full mt-1.5 left-0 right-0 max-h-48 overflow-y-auto rounded-xl liquid-glass border border-white/20 p-1 z-50 list-none shadow-2xl"
                    >
                      {colleges.map((c, idx) => {
                        const isSelected = form.collegeId === c.id
                        const isActive = activeCollegeIndex === idx
                        return (
                          <li
                            key={c.id}
                            id={`college-opt-${c.id}`}
                            role="option"
                            aria-selected={isSelected || isActive}
                            onMouseDown={() => selectCollege(c)}
                            className={`p-2.5 rounded-lg cursor-pointer transition-colors text-left ${
                              isActive ? "bg-white/20 border border-cyan-400/40" : "hover:bg-white/10"
                            }`}
                          >
                            <p className="text-[13px] font-bold text-white m-0">{c.name}</p>
                            {c.city && <p className="text-[11px] text-white/50 m-0">{c.city}</p>}
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {showCollegeDropdown && collegeQuery && colleges.length === 0 && (
                    <div className="absolute top-full mt-1.5 left-0 right-0 rounded-xl liquid-glass border border-white/20 p-3 z-50 text-center text-[12px] text-white/60">
                      No approved colleges found.{" "}
                      <Link href="/" className="text-cyan-300 font-semibold no-underline">Submit yours →</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {saveError && (
              <p role="alert" className="text-rose-400 text-[12px] m-0">
                {saveError}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[13px] shadow-[0_4px_14px_rgba(10,132,255,0.4)] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setSaveError("") }}
                className="px-4 py-3 rounded-xl liquid-glass-pill text-white/70 hover:text-white text-[13px] font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* ── VIEW MODE ── */
          <>
            {loading ? (
              <div role="status" aria-live="polite" className="text-center py-10 text-cyan-300 font-semibold text-sm">
                Loading profile details...
              </div>
            ) : (
              <div className="rounded-[24px] liquid-glass p-5 flex flex-col gap-4 border border-white/15">
                {!profile && (
                  <div className="text-center py-3">
                    <p className="text-[14px] text-white/80 font-semibold m-0">No profile details set up yet</p>
                    <p className="text-[12px] text-white/50 mt-1 mb-0">Add your course and graduation year to enrich your reviews.</p>
                  </div>
                )}

                <div className="flex flex-col divide-y divide-white/[0.08]">
                  <div className="py-3 flex items-center justify-between gap-3 first:pt-0">
                    <span className="text-[12px] uppercase font-bold text-white/50 tracking-wider">Display Name</span>
                    <span className="text-[13px] font-bold text-white truncate">
                      {profile?.displayName || "Not set"}
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between gap-3">
                    <span className="text-[12px] uppercase font-bold text-white/50 tracking-wider">Course</span>
                    <span className="text-[13px] font-bold text-white truncate max-w-[60%] text-right">
                      {profile?.course || "Not set"}
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between gap-3">
                    <span className="text-[12px] uppercase font-bold text-white/50 tracking-wider">Graduation</span>
                    <span className="text-[13px] font-bold text-cyan-300">
                      {profile?.graduationYear ? `Class of ${profile.graduationYear}` : "Not set"}
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between gap-3">
                    <span className="text-[12px] uppercase font-bold text-white/50 tracking-wider">College</span>
                    <span className="text-[13px] font-bold text-white truncate max-w-[60%] text-right">
                      {profile?.college ? (
                        <Link href={`/colleges/${profile.collegeId}`} className="text-cyan-300 hover:text-white transition-colors no-underline">
                          {profile.college.name} ↗
                        </Link>
                      ) : (
                        "Not set"
                      )}
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between gap-3 last:pb-0">
                    <span className="text-[12px] uppercase font-bold text-white/50 tracking-wider">Account</span>
                    <span className="text-[12px] text-white/60 truncate">
                      {session.user?.email}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="w-full mt-2 py-3 rounded-xl liquid-glass-pill text-cyan-300 hover:text-white font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">edit</span>
                  <span>{profile ? "Edit Profile" : "Set Up Profile"}</span>
                </button>
              </div>
            )}

            {/* Privacy Assurance Pod */}
            <div className="rounded-2xl liquid-glass p-4 border border-white/10 flex items-start gap-3">
              <span className="material-symbols-outlined text-cyan-400 text-[20px] shrink-0 mt-0.5" aria-hidden="true">
                shield
              </span>
              <div className="text-[12px] leading-relaxed text-white/60">
                <strong className="text-white font-semibold">Privacy Commitment: </strong>
                Your personal email and identity are strictly safeguarded. Reviews and ratings you submit remain completely anonymous and are never tied to your student profile.
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
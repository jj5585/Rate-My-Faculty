"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"

// ── Types ──────────────────────────────────────────────
type College = {
  id: string
  name: string
  website: string
  emailDomain: string | null
  city: string | null
  state: string | null
  country: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  submittedBy: { email: string; name: string | null }
  _count: { faculty: number }
}

type ReportedRating = {
  id: string
  review: string | null
  teachingClarity: number
  approachability: number
  gradingFairness: number
  punctuality: number
  partiality: number
  behaviour: number
  createdAt: string
  _count: { reports: number }
  faculty: {
    id: string
    name: string
    department: string | null
    college: { name: string } | null
  }
}

// ── Main Component ─────────────────────────────────────
export default function AdminPage() {
  const { data: session, status } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  // Section tabs: "colleges" | "reports"
  const [section, setSection] = useState<"colleges" | "reports">("colleges")

  // College state
  const [colleges, setColleges] = useState<College[]>([])
  const [collegeTab, setCollegeTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING")
  const [collegesLoading, setCollegesLoading] = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)

  // Reports state
  const [reports, setReports] = useState<ReportedRating[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [reportActioning, setReportActioning] = useState<string | null>(null)
  const [expandedReport, setExpandedReport] = useState<string | null>(null)

  // ── Auth check ─────────────────────────────────────
  useEffect(() => {
    if (status === "loading") return
    if (!session) { setCheckingAdmin(false); return }
    verifyAdmin()
  }, [session, status])

  useEffect(() => {
    if (isAdmin) fetchColleges(collegeTab)
  }, [collegeTab, isAdmin])

  useEffect(() => {
    if (isAdmin && section === "reports") fetchReports()
  }, [section, isAdmin])

  async function verifyAdmin() {
    try {
      const res = await fetch("/api/admin/colleges")
      setIsAdmin(res.ok)
      if (res.ok) {
        const data = await res.json()
        setColleges(data.colleges || [])
        setCollegesLoading(false)
      }
    } catch {
      setIsAdmin(false)
    }
    setCheckingAdmin(false)
  }

  // ── College actions ────────────────────────────────
  async function fetchColleges(statusFilter: string) {
    setCollegesLoading(true)
    try {
      const res = await fetch(`/api/admin/colleges?status=${statusFilter}`)
      const data = await res.json()
      setColleges(data.colleges || [])
    } finally {
      setCollegesLoading(false)
    }
  }

  async function handleCollegeAction(id: string, newStatus: "APPROVED" | "REJECTED") {
    setActioning(id)
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) setColleges(prev => prev.filter(c => c.id !== id))
    } finally {
      setActioning(null)
    }
  }

  async function handleCollegeDelete(id: string) {
    if (!confirm("Permanently delete this college entry?")) return
    setActioning(id)
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, { method: "DELETE" })
      if (res.ok) setColleges(prev => prev.filter(c => c.id !== id))
    } finally {
      setActioning(null)
    }
  }

  // ── Report actions ─────────────────────────────────
  async function fetchReports() {
    setReportsLoading(true)
    try {
      const res = await fetch("/api/admin/reports")
      const data = await res.json()
      setReports(data.ratings || [])
    } finally {
      setReportsLoading(false)
    }
  }

  async function handleReportAction(id: string, action: "clear_comment" | "dismiss_reports") {
    setReportActioning(id)
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        if (action === "clear_comment") {
          setReports(prev => prev.map(r =>
            r.id === id ? { ...r, review: null, _count: { reports: 0 } } : r
          ).filter(r => r._count.reports > 0 || r.id !== id))
        } else {
          setReports(prev => prev.filter(r => r.id !== id))
        }
      }
    } finally {
      setReportActioning(null)
    }
  }

  async function handleDeleteRating(id: string) {
    if (!confirm("Delete the entire rating including scores? This cannot be undone.")) return
    setReportActioning(id)
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: "DELETE" })
      if (res.ok) setReports(prev => prev.filter(r => r.id !== id))
    } finally {
      setReportActioning(null)
    }
  }

  // ── Auth gates ─────────────────────────────────────
  if (status === "loading" || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cyan-300 font-semibold text-sm">
        Verifying moderation credentials...
      </div>
    )
  }

  if (!session) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen flex items-center justify-center p-6 relative z-10 pb-36 outline-none">
        <div className="w-full max-w-sm rounded-[28px] liquid-glass p-8 text-center flex flex-col items-center gap-4 border border-white/15">
          <span className="material-symbols-outlined text-[36px] text-amber-400" aria-hidden="true">lock</span>
          <h1 className="text-[20px] font-extrabold text-white m-0">Admin Access Required</h1>
          <p className="text-[13px] text-white/60 m-0">Sign in with an authorized administrative account to access this terminal.</p>
          <button
            type="button"
            onClick={() => signIn("google")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[14px]"
          >
            Sign In
          </button>
        </div>
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen flex items-center justify-center p-6 relative z-10 pb-36 outline-none">
        <div className="w-full max-w-sm rounded-[28px] liquid-glass p-8 text-center flex flex-col items-center gap-3 border border-rose-500/30">
          <span className="material-symbols-outlined text-[36px] text-rose-400" aria-hidden="true">gpp_bad</span>
          <h1 className="text-[22px] font-black text-rose-400 m-0">403 Forbidden</h1>
          <p className="text-[13px] text-white/60 m-0">You don't have administrative moderation clearance.</p>
          <Link href="/" className="mt-2 text-[12px] text-cyan-300 hover:text-white font-bold no-underline">
            ← Return to Campus Home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-start relative z-10 selection:bg-blue-600 selection:text-white pb-36">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full pt-2 pb-2 px-4 backdrop-blur-2xl bg-black/40 border-b border-white/[0.08]">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full liquid-glass-pill text-[12px] font-semibold text-cyan-300 hover:text-white transition-all no-underline"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
            <span>Site</span>
          </Link>

          <h1 className="text-[17px] font-extrabold text-white tracking-tight m-0 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-cyan-300 text-[18px]" aria-hidden="true">admin_panel_settings</span>
            <span>Dashboard</span>
          </h1>

          <div className="px-2 py-0.5 rounded-full liquid-badge text-[10px] font-bold text-cyan-200">
            {session.user?.email?.split("@")[0]}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full px-4 pt-4 z-10 flex flex-col gap-4 max-w-xl mx-auto outline-none">
        {/* Section Tabs (Colleges vs Reported Reviews) */}
        <div
          role="tablist"
          aria-label="Admin sections"
          className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl liquid-glass border border-white/10"
        >
          <button
            role="tab"
            id="tab-colleges"
            aria-selected={section === "colleges"}
            aria-controls="panel-colleges"
            onClick={() => setSection("colleges")}
            className={`py-2 px-3 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              section === "colleges"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-white/20"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">school</span>
            <span>Colleges</span>
          </button>

          <button
            role="tab"
            id="tab-reports"
            aria-selected={section === "reports"}
            aria-controls="panel-reports"
            onClick={() => setSection("reports")}
            className={`py-2 px-3 rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              section === "reports"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-white/20"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">flag</span>
            <span>Reported</span>
            {reports.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                {reports.length}
              </span>
            )}
          </button>
        </div>

        {/* ══════════════════════════════════════════
            SECTION: COLLEGES
        ══════════════════════════════════════════ */}
        {section === "colleges" && (
          <div role="tabpanel" id="panel-colleges" aria-labelledby="tab-colleges" className="flex flex-col gap-3">
            {/* Sub-tabs */}
            <div
              role="tablist"
              aria-label="Filter colleges by status"
              className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5"
            >
              {(["PENDING", "APPROVED", "REJECTED"] as const).map(t => (
                <button
                  key={t}
                  role="tab"
                  id={`tab-college-${t.toLowerCase()}`}
                  aria-selected={collegeTab === t}
                  onClick={() => setCollegeTab(t)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition-all ${
                    collegeTab === t
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40"
                      : "liquid-glass-pill text-white/60 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {collegesLoading ? (
              <div role="status" aria-live="polite" className="text-center py-10 text-cyan-300 font-semibold text-sm">
                Loading college submissions...
              </div>
            ) : colleges.length === 0 ? (
              <div className="rounded-[22px] liquid-glass p-8 text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-white/40 text-[32px]" aria-hidden="true">inbox</span>
                <p className="text-white/80 font-semibold text-[14px] m-0">No {collegeTab.toLowerCase()} submissions</p>
                <p className="text-white/50 text-[12px] m-0">Submissions from students will appear here.</p>
              </div>
            ) : (
              <ul role="list" aria-label="Submitted colleges" className="flex flex-col gap-2.5 p-0 m-0 list-none">
                {colleges.map(c => (
                  <li key={c.id} className="list-none">
                    <div className="rounded-[22px] liquid-glass p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h2 className="text-[16px] font-extrabold text-white truncate m-0">
                            {c.name}
                          </h2>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <a
                              href={c.website}
                              target="_blank"
                              rel="noopener"
                              className="text-[12px] text-cyan-300 hover:text-white transition-colors no-underline flex items-center gap-1"
                            >
                              <span className="truncate">{c.website}</span>
                              <span className="material-symbols-outlined text-[13px]" aria-hidden="true">open_in_new</span>
                            </a>
                            {(c.city || c.state) && (
                              <p className="text-[11px] text-white/50 m-0">
                                {[c.city, c.state, c.country].filter(Boolean).join(", ")}
                              </p>
                            )}
                            {c.emailDomain && (
                              <p className="text-[11px] text-white/40 font-mono m-0">
                                @{c.emailDomain}
                              </p>
                            )}
                            <p className="text-[10px] text-white/40 m-0 mt-1">
                              By: {c.submittedBy.name || c.submittedBy.email} · {new Date(c.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          {collegeTab === "PENDING" && (
                            <>
                              <button
                                disabled={actioning === c.id}
                                onClick={() => handleCollegeAction(c.id, "APPROVED")}
                                aria-label={`Approve ${c.name}`}
                                className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30 transition-all"
                              >
                                {actioning === c.id ? "..." : "Approve"}
                              </button>
                              <button
                                disabled={actioning === c.id}
                                onClick={() => handleCollegeAction(c.id, "REJECTED")}
                                aria-label={`Reject ${c.name}`}
                                className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30 hover:bg-rose-500/30 transition-all"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {collegeTab === "APPROVED" && (
                            <button
                              onClick={() => handleCollegeAction(c.id, "REJECTED")}
                              aria-label={`Revoke approval for ${c.name}`}
                              className="px-3 py-1.5 rounded-full text-[11px] font-bold liquid-glass-pill text-rose-300 hover:text-white transition-all"
                            >
                              Revoke
                            </button>
                          )}
                          {collegeTab === "REJECTED" && (
                            <>
                              <button
                                onClick={() => handleCollegeAction(c.id, "APPROVED")}
                                aria-label={`Approve ${c.name}`}
                                className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30 transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleCollegeDelete(c.id)}
                                aria-label={`Permanently delete ${c.name}`}
                                className="px-3 py-1.5 rounded-full text-[11px] font-bold liquid-glass-pill text-white/50 hover:text-white transition-all"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            SECTION: REPORTED REVIEWS
        ══════════════════════════════════════════ */}
        {section === "reports" && (
          <div role="tabpanel" id="panel-reports" aria-labelledby="tab-reports" className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-white/60 m-0">
                {reports.length === 0
                  ? "No reported reviews."
                  : `${reports.length} flagged review${reports.length !== 1 ? "s" : ""} requiring action.`}
              </p>
              <button
                type="button"
                onClick={fetchReports}
                aria-label="Refresh reported reviews list"
                className="px-2.5 py-1 rounded-full liquid-glass-pill text-[11px] font-semibold text-cyan-300 hover:text-white flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[13px]" aria-hidden="true">refresh</span>
                <span>Refresh</span>
              </button>
            </div>

            {reportsLoading ? (
              <div role="status" aria-live="polite" className="text-center py-10 text-cyan-300 font-semibold text-sm">
                Loading reported reviews...
              </div>
            ) : reports.length === 0 ? (
              <div className="rounded-[22px] liquid-glass p-8 text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[32px]" aria-hidden="true">check_circle</span>
                <p className="text-white/80 font-semibold text-[15px] m-0">All clear</p>
                <p className="text-white/50 text-[12px] m-0">No reviews have been flagged by students.</p>
              </div>
            ) : (
              <ul role="list" aria-label="Flagged reviews" className="flex flex-col gap-3 p-0 m-0 list-none">
                {reports.map(r => {
                  const isExpanded = expandedReport === r.id
                  const isActioning = reportActioning === r.id
                  const overall = (
                    (r.teachingClarity + r.approachability + r.gradingFairness +
                     r.punctuality + r.partiality + r.behaviour) / 6
                  ).toFixed(1)

                  return (
                    <li key={r.id} className="list-none">
                      <div className="rounded-[22px] liquid-glass p-4 flex flex-col gap-3 border border-rose-500/30">
                        {/* Header: Faculty + Report Count */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/faculty/${r.faculty.id}`}
                              target="_blank"
                              className="text-[15px] font-extrabold text-white hover:text-cyan-300 transition-colors no-underline flex items-center gap-1"
                            >
                              <span>{r.faculty.name}</span>
                              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">open_in_new</span>
                            </Link>
                            <p className="text-[11px] text-white/50 m-0 mt-0.5">
                              {[r.faculty.department, r.faculty.college?.name].filter(Boolean).join(" · ")}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[11px] font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]" aria-hidden="true">flag</span>
                              <span>{r._count.reports} {r._count.reports === 1 ? "report" : "reports"}</span>
                            </span>
                            <span className="text-[10px] text-white/40">
                              {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        </div>

                        {/* Scores row */}
                        <div className="grid grid-cols-4 gap-1 p-2 rounded-xl bg-black/40 border border-white/[0.05] text-center text-[10px]">
                          <div><span className="text-white/40">Teach:</span> <strong className="text-white">{r.teachingClarity}</strong></div>
                          <div><span className="text-white/40">Approach:</span> <strong className="text-white">{r.approachability}</strong></div>
                          <div><span className="text-white/40">Grading:</span> <strong className="text-white">{r.gradingFairness}</strong></div>
                          <div><span className="text-cyan-300">Avg:</span> <strong className="text-cyan-300">{overall}</strong></div>
                        </div>

                        {/* Written comment */}
                        {r.review ? (
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() => setExpandedReport(isExpanded ? null : r.id)}
                            className="p-3 rounded-xl bg-rose-500/10 border-l-2 border-rose-400 text-left text-[13px] text-white/90 leading-relaxed cursor-pointer hover:bg-rose-500/15 transition-all"
                          >
                            <p className="m-0 italic">
                              "{isExpanded ? r.review : (r.review.length > 160 ? r.review.slice(0, 160) + "..." : r.review)}"
                            </p>
                            {r.review.length > 160 && (
                              <span className="text-cyan-300 text-[11px] font-semibold mt-1 inline-block">
                                {isExpanded ? "Show less" : "Show more"}
                              </span>
                            )}
                          </button>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-white/[0.03] text-[12px] text-white/40 italic">
                            No written comment — scores only.
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-white/10 flex-wrap">
                          {r.review && (
                            <button
                              disabled={isActioning}
                              onClick={() => handleReportAction(r.id, "clear_comment")}
                              aria-label={`Clear written comment for rating on ${r.faculty.name}`}
                              className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 hover:bg-amber-500/30 transition-all disabled:opacity-40"
                            >
                              {isActioning ? "..." : "Clear Comment"}
                            </button>
                          )}
                          <button
                            disabled={isActioning}
                            onClick={() => handleReportAction(r.id, "dismiss_reports")}
                            aria-label={`Dismiss reports for rating on ${r.faculty.name}`}
                            className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30 transition-all disabled:opacity-40"
                          >
                            Dismiss Reports
                          </button>
                          <button
                            disabled={isActioning}
                            onClick={() => handleDeleteRating(r.id)}
                            aria-label={`Delete entire rating for ${r.faculty.name}`}
                            className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30 hover:bg-rose-500/30 transition-all disabled:opacity-40"
                          >
                            Delete Entire Rating
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
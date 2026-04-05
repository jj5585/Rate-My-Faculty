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
          // Update locally — null out the review text, keep rating
          setReports(prev => prev.map(r =>
            r.id === id ? { ...r, review: null, _count: { reports: 0 } } : r
          ).filter(r => r._count.reports > 0 || r.id !== id))
        } else {
          // Dismiss — remove from list
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
      <div style={{ minHeight: "100vh", backgroundColor: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#333", fontSize: "13px" }}>Verifying access...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", color: "#f0ede8", marginBottom: "20px", fontStyle: "italic" }}>Admin Access Required</p>
          <button onClick={() => signIn("google")} style={{ background: "#c8a96e", color: "#080808", border: "none", padding: "12px 24px", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "13px", cursor: "pointer", borderRadius: "2px" }}>Sign In</button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#080808", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", color: "#f0ede8", marginBottom: "8px" }}>403</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#555" }}>You don't have admin access.</p>
          <Link href="/" style={{ color: "#c8a96e", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>← Back Home</Link>
        </div>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#f0ede8" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .playfair { font-family: 'Playfair Display', Georgia, serif !important; }
        .dmsans   { font-family: 'DM Sans', sans-serif !important; }
        .tag { font-family: 'DM Sans', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #555; }

        .card {
          border: 1px solid #141414;
          border-radius: 4px;
          padding: 20px;
          background: #0d0d0d;
          transition: border-color 0.2s;
        }
        .card:hover { border-color: #1e1e1e; }

        .section-tab {
          background: none; border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600;
          color: #444; cursor: pointer;
          padding: 16px 0;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
          letter-spacing: 0.5px;
        }
        .section-tab.active { color: #f0ede8; border-bottom-color: #c8a96e; }

        .sub-tab {
          background: none; border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
          color: #444; cursor: pointer; padding: 10px 0;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
        }
        .sub-tab.active { color: #f0ede8; border-bottom-color: #c8a96e; }

        .action-btn {
          font-family: 'DM Sans', sans-serif; font-size: 11px;
          letter-spacing: 0.5px; text-transform: uppercase;
          font-weight: 600; cursor: pointer; padding: 7px 14px;
          border-radius: 2px; border: 1px solid; transition: all 0.15s;
          white-space: nowrap;
        }
        .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .report-badge {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.25);
          color: #f87171;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 700;
          padding: 3px 8px; border-radius: 4px;
        }

        .comment-box {
          background: #080808;
          border-left: 2px solid #f87171;
          padding: 12px 16px;
          border-radius: 0 4px 4px 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; line-height: 1.6;
          color: #ccc;
          margin: 12px 0;
        }

        .scores-row {
          display: flex; gap: 12px; flex-wrap: wrap;
          margin-top: 10px;
        }
        .score-chip {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; color: #555;
        }
        .score-chip span { color: #888; font-weight: 600; }
      `}} />

      {/* ── Nav ── */}
      <nav style={{
        padding: "0 32px", height: "56px",
        borderBottom: "1px solid #141414",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" className="dmsans" style={{ fontSize: "12px", color: "#555", textDecoration: "none" }}>← Back to Site</Link>
        <span className="playfair" style={{ fontSize: "16px", fontWeight: 700 }}>
          Admin <span style={{ color: "#c8a96e" }}>Dashboard</span>
        </span>
        <span className="dmsans" style={{ fontSize: "11px", color: "#444" }}>{session.user?.email?.split("@")[0]}</span>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: "32px" }}>
          <span className="tag" style={{ display: "block", marginBottom: "10px" }}>Moderation Centre</span>
          <h1 className="playfair" style={{ fontSize: "32px", fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
            Admin Dashboard
          </h1>
        </div>

        {/* ── Section tabs: Colleges / Reports ── */}
        <div style={{ display: "flex", gap: "32px", borderBottom: "1px solid #141414", marginBottom: "32px" }}>
          <button
            className={`section-tab${section === "colleges" ? " active" : ""}`}
            onClick={() => setSection("colleges")}
          >
            Colleges
          </button>
          <button
            className={`section-tab${section === "reports" ? " active" : ""}`}
            onClick={() => setSection("reports")}
          >
            Reported Reviews
            {reports.length > 0 && (
              <span style={{
                marginLeft: "8px", background: "#f87171", color: "#080808",
                fontSize: "10px", fontWeight: 700, padding: "1px 6px",
                borderRadius: "10px", verticalAlign: "middle",
              }}>
                {reports.length}
              </span>
            )}
          </button>
        </div>

        {/* ══════════════════════════════════════════
            SECTION: COLLEGES
        ══════════════════════════════════════════ */}
        {section === "colleges" && (
          <>
            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: "24px", borderBottom: "1px solid #141414", marginBottom: "24px" }}>
              {(["PENDING", "APPROVED", "REJECTED"] as const).map(t => (
                <button
                  key={t}
                  className={`sub-tab${collegeTab === t ? " active" : ""}`}
                  onClick={() => setCollegeTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            {collegesLoading ? (
              <div className="dmsans" style={{ padding: "60px 0", textAlign: "center", color: "#333", fontSize: "13px" }}>
                Loading...
              </div>
            ) : colleges.length === 0 ? (
              <div style={{ padding: "60px 0", textAlign: "center", border: "1px solid #141414" }}>
                <p className="playfair" style={{ fontSize: "18px", color: "#2a2a2a", fontStyle: "italic", margin: 0 }}>
                  No {collegeTab.toLowerCase()} submissions.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {colleges.map(c => (
                  <div key={c.id} className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <h2 className="playfair" style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.3px" }}>
                          {c.name}
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <a href={c.website} target="_blank" rel="noopener" className="dmsans" style={{ fontSize: "12px", color: "#c8a96e", textDecoration: "none" }}>
                            {c.website} ↗
                          </a>
                          {(c.city || c.state) && (
                            <span className="dmsans" style={{ fontSize: "12px", color: "#555" }}>
                              {[c.city, c.state, c.country].filter(Boolean).join(", ")}
                            </span>
                          )}
                          {c.emailDomain && (
                            <span className="dmsans" style={{ fontSize: "11px", color: "#444" }}>
                              @{c.emailDomain}
                            </span>
                          )}
                          <span className="dmsans" style={{ fontSize: "11px", color: "#444", marginTop: "4px" }}>
                            By: {c.submittedBy.name || c.submittedBy.email}
                            <span style={{ color: "#333" }}> · {new Date(c.createdAt).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "flex-start", flexWrap: "wrap" }}>
                        {collegeTab === "PENDING" && (
                          <>
                            <button className="action-btn" disabled={actioning === c.id}
                              onClick={() => handleCollegeAction(c.id, "APPROVED")}
                              style={{ borderColor: "#4ade80", color: "#4ade80", background: "rgba(74,222,128,0.07)" }}>
                              {actioning === c.id ? "..." : "Approve"}
                            </button>
                            <button className="action-btn" disabled={actioning === c.id}
                              onClick={() => handleCollegeAction(c.id, "REJECTED")}
                              style={{ borderColor: "#f87171", color: "#f87171", background: "rgba(248,113,113,0.07)" }}>
                              Reject
                            </button>
                          </>
                        )}
                        {collegeTab === "APPROVED" && (
                          <button className="action-btn"
                            onClick={() => handleCollegeAction(c.id, "REJECTED")}
                            style={{ borderColor: "#f87171", color: "#f87171", background: "transparent" }}>
                            Revoke
                          </button>
                        )}
                        {collegeTab === "REJECTED" && (
                          <>
                            <button className="action-btn"
                              onClick={() => handleCollegeAction(c.id, "APPROVED")}
                              style={{ borderColor: "#4ade80", color: "#4ade80", background: "rgba(74,222,128,0.07)" }}>
                              Approve
                            </button>
                            <button className="action-btn"
                              onClick={() => handleCollegeDelete(c.id)}
                              style={{ borderColor: "#333", color: "#555", background: "transparent" }}>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════
            SECTION: REPORTED REVIEWS
        ══════════════════════════════════════════ */}
        {section === "reports" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <p className="dmsans" style={{ fontSize: "13px", color: "#555" }}>
                {reports.length === 0
                  ? "No reported reviews."
                  : `${reports.length} review${reports.length !== 1 ? "s" : ""} flagged by students — sorted by most reported.`}
              </p>
              <button
                className="dmsans"
                onClick={fetchReports}
                style={{ fontSize: "11px", color: "#555", background: "none", border: "1px solid #1e1e1e", padding: "6px 12px", cursor: "pointer", borderRadius: "2px" }}
              >
                Refresh
              </button>
            </div>

            {reportsLoading ? (
              <div className="dmsans" style={{ padding: "60px 0", textAlign: "center", color: "#333", fontSize: "13px" }}>
                Loading reported reviews...
              </div>
            ) : reports.length === 0 ? (
              <div style={{ padding: "60px 0", textAlign: "center", border: "1px solid #141414", borderRadius: "4px" }}>
                <p className="playfair" style={{ fontSize: "18px", color: "#2a2a2a", fontStyle: "italic", margin: "0 0 8px" }}>
                  All clear.
                </p>
                <p className="dmsans" style={{ fontSize: "12px", color: "#333" }}>
                  No reviews have been reported by students.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {reports.map(r => {
                  const isExpanded = expandedReport === r.id
                  const isActioning = reportActioning === r.id
                  const overall = (
                    (r.teachingClarity + r.approachability + r.gradingFairness +
                     r.punctuality + r.partiality + r.behaviour) / 6
                  ).toFixed(1)

                  return (
                    <div key={r.id} className="card" style={{ borderColor: r._count.reports >= 3 ? "rgba(248,113,113,0.2)" : "#141414" }}>

                      {/* Top row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          {/* Faculty name + college */}
                          <Link
                            href={`/faculty/${r.faculty.id}`}
                            target="_blank"
                            className="playfair"
                            style={{ fontSize: "17px", fontWeight: 700, color: "#f0ede8", textDecoration: "none", display: "block", marginBottom: "3px" }}
                          >
                            {r.faculty.name} ↗
                          </Link>
                          <span className="dmsans" style={{ fontSize: "11px", color: "#555" }}>
                            {[r.faculty.department, r.faculty.college?.name].filter(Boolean).join(" · ")}
                          </span>
                        </div>

                        {/* Report badge + date */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                          <span className="report-badge">
                            ⚑ {r._count.reports} {r._count.reports === 1 ? "report" : "reports"}
                          </span>
                          <span className="dmsans" style={{ fontSize: "10px", color: "#444" }}>
                            {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>

                      {/* Scores row */}
                      <div className="scores-row">
                        {[
                          { label: "Teaching", val: r.teachingClarity },
                          { label: "Approach", val: r.approachability },
                          { label: "Grading", val: r.gradingFairness },
                          { label: "Punctual", val: r.punctuality },
                          { label: "No Bias", val: r.partiality },
                          { label: "Behaviour", val: r.behaviour },
                        ].map(s => (
                          <div key={s.label} className="score-chip">
                            {s.label}: <span>{s.val}/5</span>
                          </div>
                        ))}
                        <div className="score-chip">
                          Overall: <span style={{ color: "#c8a96e" }}>{overall}</span>
                        </div>
                      </div>

                      {/* Written comment */}
                      {r.review ? (
                        <>
                          <div
                            className="comment-box"
                            style={{ cursor: "pointer" }}
                            onClick={() => setExpandedReport(isExpanded ? null : r.id)}
                          >
                            {isExpanded ? r.review : (
                              r.review.length > 180
                                ? r.review.slice(0, 180) + "..."
                                : r.review
                            )}
                            {r.review.length > 180 && (
                              <span style={{ color: "#555", fontSize: "12px", marginLeft: "6px" }}>
                                {isExpanded ? "show less" : "show more"}
                              </span>
                            )}
                          </div>

                          {/* Actions when comment exists */}
                          <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
                            <button
                              className="action-btn"
                              disabled={isActioning}
                              onClick={() => handleReportAction(r.id, "clear_comment")}
                              style={{ borderColor: "#facc15", color: "#facc15", background: "rgba(250,204,21,0.07)" }}
                            >
                              {isActioning ? "..." : "Clear Comment Only"}
                            </button>
                            <button
                              className="action-btn"
                              disabled={isActioning}
                              onClick={() => handleReportAction(r.id, "dismiss_reports")}
                              style={{ borderColor: "#4ade80", color: "#4ade80", background: "rgba(74,222,128,0.07)" }}
                            >
                              Dismiss Reports
                            </button>
                            <button
                              className="action-btn"
                              disabled={isActioning}
                              onClick={() => handleDeleteRating(r.id)}
                              style={{ borderColor: "#f87171", color: "#f87171", background: "rgba(248,113,113,0.07)" }}
                            >
                              Delete Entire Rating
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* No written comment — scores only */}
                          <div style={{
                            padding: "10px 14px", margin: "12px 0",
                            background: "#080808", borderRadius: "4px",
                            border: "1px solid #141414",
                          }}>
                            <p className="dmsans" style={{ fontSize: "12px", color: "#444", margin: 0, fontStyle: "italic" }}>
                              No written comment — scores only.
                            </p>
                          </div>

                          <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                            <button
                              className="action-btn"
                              disabled={isActioning}
                              onClick={() => handleReportAction(r.id, "dismiss_reports")}
                              style={{ borderColor: "#4ade80", color: "#4ade80", background: "rgba(74,222,128,0.07)" }}
                            >
                              Dismiss Reports
                            </button>
                            <button
                              className="action-btn"
                              disabled={isActioning}
                              onClick={() => handleDeleteRating(r.id)}
                              style={{ borderColor: "#f87171", color: "#f87171", background: "rgba(248,113,113,0.07)" }}
                            >
                              Delete Entire Rating
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
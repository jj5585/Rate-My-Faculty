"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"
import Link from "next/link"

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

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING")
  const [actioning, setActioning] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) { setCheckingAdmin(false); return }
    verifyAdmin()
  }, [session, status])

  useEffect(() => {
    if (isAdmin) fetchColleges(tab)
  }, [tab, isAdmin])

  async function verifyAdmin() {
    try {
      const res = await fetch("/api/admin/colleges")
      setIsAdmin(res.ok)
      if (res.ok) {
        const data = await res.json()
        setColleges(data.colleges || [])
        setLoading(false)
      }
    } catch {
      setIsAdmin(false)
    }
    setCheckingAdmin(false)
  }

  async function fetchColleges(statusFilter: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/colleges?status=${statusFilter}`)
      const data = await res.json()
      setColleges(data.colleges || [])
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(id: string, newStatus: "APPROVED" | "REJECTED") {
    setActioning(id)
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setColleges(prev => prev.filter(c => c.id !== id))
      }
    } finally {
      setActioning(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this college entry?")) return
    setActioning(id)
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, { method: "DELETE" })
      if (res.ok) setColleges(prev => prev.filter(c => c.id !== id))
    } finally {
      setActioning(null)
    }
  }

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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#f0ede8" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900&family=DM+Sans:wght@400;500;600&display=swap');
        .playfair { font-family: 'Playfair Display', Georgia, serif !important; }
        .dmsans { font-family: 'DM Sans', sans-serif !important; }
        .tag { font-family: 'DM Sans', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #555; }
        
        .college-card {
          border: 1px solid #141414;
          border-radius: 4px;
          padding: 24px;
          background: #0d0d0d;
          transition: border-color 0.2s;
        }
        .college-card:hover { border-color: #1e1e1e; }

        .tab-btn {
          background: none; border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; letter-spacing: 1px; text-transform: uppercase;
          color: #444; cursor: pointer; padding: 12px 0;
          border-bottom: 2px solid transparent;
          transition: all 0.15s;
        }
        .tab-btn.active { color: #f0ede8; border-bottom-color: #c8a96e; }

        .action-btn {
          font-family: 'DM Sans', sans-serif; font-size: 11px;
          letter-spacing: 0.5px; text-transform: uppercase;
          font-weight: 600; cursor: pointer; padding: 8px 16px;
          border-radius: 2px; border: 1px solid; transition: all 0.15s;
        }
      `}} />

      {/* Nav */}
      <nav style={{ padding: "0 32px", height: "56px", borderBottom: "1px solid #141414", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" className="dmsans" style={{ fontSize: "12px", color: "#555", textDecoration: "none" }}>← Back to Site</Link>
        <span className="playfair" style={{ fontSize: "16px", fontWeight: 700 }}>
          Admin <span style={{ color: "#c8a96e" }}>Dashboard</span>
        </span>
        <span className="dmsans" style={{ fontSize: "11px", color: "#444" }}>{session.user?.email}</span>
      </nav>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 32px" }}>

        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <span className="tag" style={{ display: "block", marginBottom: "12px" }}>College Moderation</span>
          <h1 className="playfair" style={{ fontSize: "36px", fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
            College Submissions
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "32px", borderBottom: "1px solid #141414", marginBottom: "32px" }}>
          {(["PENDING", "APPROVED", "REJECTED"] as const).map(t => (
            <button key={t} className={`tab-btn${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" }}>
          {[
            { label: "Pending Review", color: "#facc15" },
            { label: "Approved", color: "#4ade80" },
            { label: "Rejected", color: "#f87171" },
          ].map((s, i) => (
            <div key={i} style={{ border: "1px solid #141414", padding: "20px", borderRadius: "4px", textAlign: "center" }}>
              <div className="playfair" style={{ fontSize: "32px", fontWeight: 900, color: s.color }}>—</div>
              <div className="tag">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Colleges list */}
        {loading ? (
          <div className="dmsans" style={{ padding: "60px 0", textAlign: "center", color: "#333", fontSize: "13px" }}>
            Loading...
          </div>
        ) : colleges.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center", border: "1px solid #141414" }}>
            <p className="playfair" style={{ fontSize: "20px", color: "#2a2a2a", fontStyle: "italic", margin: 0 }}>
              No {tab.toLowerCase()} submissions.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {colleges.map(c => (
              <div key={c.id} className="college-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <h2 className="playfair" style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.3px" }}>
                      {c.name}
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
                          Domain: @{c.emailDomain}
                        </span>
                      )}
                      <span className="dmsans" style={{ fontSize: "11px", color: "#444", marginTop: "4px" }}>
                        Submitted by: {c.submittedBy.name || c.submittedBy.email}
                        <span style={{ color: "#333" }}> · {new Date(c.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "flex-start" }}>
                    {tab === "PENDING" && (
                      <>
                        <button
                          className="action-btn"
                          disabled={actioning === c.id}
                          onClick={() => handleAction(c.id, "APPROVED")}
                          style={{ borderColor: "#4ade80", color: "#4ade80", background: "rgba(74,222,128,0.07)" }}
                        >
                          {actioning === c.id ? "..." : "Approve"}
                        </button>
                        <button
                          className="action-btn"
                          disabled={actioning === c.id}
                          onClick={() => handleAction(c.id, "REJECTED")}
                          style={{ borderColor: "#f87171", color: "#f87171", background: "rgba(248,113,113,0.07)" }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {tab === "APPROVED" && (
                      <button
                        className="action-btn"
                        onClick={() => handleAction(c.id, "REJECTED")}
                        style={{ borderColor: "#f87171", color: "#f87171", background: "transparent" }}
                      >
                        Revoke
                      </button>
                    )}
                    {tab === "REJECTED" && (
                      <>
                        <button
                          className="action-btn"
                          onClick={() => handleAction(c.id, "APPROVED")}
                          style={{ borderColor: "#4ade80", color: "#4ade80", background: "rgba(74,222,128,0.07)" }}
                        >
                          Approve
                        </button>
                        <button
                          className="action-btn"
                          onClick={() => handleDelete(c.id)}
                          style={{ borderColor: "#333", color: "#555", background: "transparent" }}
                        >
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
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
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

export default function HomePage() {
  const { data: session } = useSession()
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const [form, setForm] = useState({
    name: "", website: "", emailDomain: "", city: "", state: "", country: "India",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState("")
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    setMounted(true)
    fetchColleges()
  }, [])

  async function fetchColleges(q = "") {
    setLoading(true)
    try {
      const res = await fetch(`/api/colleges${q ? `?q=${encodeURIComponent(q)}` : ""}`)
      const data = await res.json()
      setColleges(data.colleges || [])
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    const timer = setTimeout(() => fetchColleges(q), 300)
    return () => clearTimeout(timer)
  }

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

  if (!mounted) return <div style={{ minHeight: "100vh", backgroundColor: "#080808" }} />

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#080808",
      color: "#f0ede8",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      position: "relative",
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }
        .playfair { font-family: 'Playfair Display', Georgia, serif !important; }
        .dmsans   { font-family: 'DM Sans', sans-serif !important; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fade-up   { animation: fadeUp 0.6s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.6s 0.1s ease forwards; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.6s 0.2s ease forwards; opacity: 0; }

        .college-card {
          background: #0f0f0f;
          border: 1px solid #1e1e1e;
          padding: 20px 24px;
          text-decoration: none;
          display: block;
          transition: border-color 0.2s, background 0.2s;
          position: relative;
          overflow: hidden;
        }
        .college-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: #c8a96e;
          transform: scaleY(0);
          transition: transform 0.2s;
        }
        .college-card:hover { border-color: #2a2a2a; background: #111; }
        .college-card:hover::before { transform: scaleY(1); }

        .search-input {
          background: #0f0f0f;
          border: 1px solid #1e1e1e;
          border-radius: 2px;
          color: #f0ede8;
          padding: 14px 20px;
          font-size: 15px;
          width: 100%;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .search-input:focus { border-color: #c8a96e; }
        .search-input::placeholder { color: #444; }

        .form-input {
          background: #0a0a0a;
          border: 1px solid #1e1e1e;
          border-radius: 2px;
          color: #f0ede8;
          padding: 12px 16px;
          font-size: 14px;
          width: 100%;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .form-input:focus { border-color: #c8a96e; }
        .form-input::placeholder { color: #333; }

        .btn-gold {
          background: #c8a96e; color: #080808; border: none;
          padding: 14px 28px; font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 13px; letter-spacing: 0.5px;
          cursor: pointer; border-radius: 2px;
          transition: background 0.2s, opacity 0.2s; text-transform: uppercase;
        }
        .btn-gold:hover { background: #d4b87a; }
        .btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          background: transparent; color: #c8a96e;
          border: 1px solid #c8a96e; padding: 8px 16px;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          font-size: 12px; cursor: pointer; border-radius: 2px;
          transition: all 0.2s; letter-spacing: 0.5px; text-transform: uppercase;
        }
        .btn-ghost:hover { background: rgba(200,169,110,0.1); }

        .tag {
          font-family: 'DM Sans', sans-serif; font-size: 10px;
          letter-spacing: 2px; text-transform: uppercase; color: #555; font-weight: 500;
        }

        /* ── Mobile menu ── */
        .hamburger {
          background: none; border: none; cursor: pointer;
          display: flex; flex-direction: column;
          gap: 5px; padding: 4px;
        }
        .hamburger span {
          display: block; width: 22px; height: 2px;
          background: #888; border-radius: 2px;
          transition: all 0.2s;
        }
        .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

        .mobile-menu {
          position: fixed; top: 52px; left: 0; right: 0;
          background: rgba(8,8,8,0.98); backdrop-filter: blur(20px);
          border-bottom: 1px solid #1a1a1a;
          z-index: 99;
          animation: slideDown 0.2s ease;
          padding: 8px 0 16px;
        }
        .menu-item {
          display: block; padding: 14px 24px;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: #888; text-decoration: none; font-weight: 500;
          border-bottom: 1px solid #111;
          transition: color 0.15s, background 0.15s;
        }
        .menu-item:last-child { border-bottom: none; }
        .menu-item:hover { color: #f0ede8; background: #0d0d0d; }
        .menu-item.gold { color: #c8a96e; }

        /* Avatar circle */
        .avatar {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid #2a2a2a; object-fit: cover;
          cursor: pointer; flex-shrink: 0;
        }
        .avatar-placeholder {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid #2a2a2a; background: #1a1a1a;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          font-family: 'Playfair Display', serif;
          font-size: 13px; color: #c8a96e; font-weight: 700;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}} />

      {/* Subtle grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: "rgba(8,8,8,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a1a1a",
        padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "52px",
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span className="playfair" style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "-0.3px", color: "#f0ede8" }}>
            Rate<span style={{ color: "#c8a96e" }}>My</span>Faculty
          </span>
        </Link>

        {/* Right side: avatar + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

          {/* Profile avatar — always visible, taps to profile */}
          {session ? (
            <Link href="/profile">
              {session.user?.image ? (
                <img src={session.user.image} alt="profile" className="avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {(session.user?.name || session.user?.email || "?")[0].toUpperCase()}
                </div>
              )}
            </Link>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="btn-ghost"
              style={{ padding: "6px 14px", fontSize: "11px" }}
            >
              Sign In
            </button>
          )}

          {/* Hamburger menu */}
          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* ── MOBILE DROPDOWN MENU ── */}
      {menuOpen && (
        <div className="mobile-menu" onClick={() => setMenuOpen(false)}>
          <Link href="/profile" className="menu-item">
            👤 My Profile
          </Link>
          <Link href="/today" className="menu-item">
            📅 Today's Reviews
          </Link>
          <Link href="/incidents" className="menu-item">
            📢 Campus Feed
          </Link>
          <Link href="/rooms" className="menu-item">
            💬 Gossip Rooms
          </Link>
          {session && (
            <button
              onClick={() => signOut()}
              className="menu-item"
              style={{
                width: "100%", textAlign: "left", background: "none",
                border: "none", cursor: "pointer", color: "#555",
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
                padding: "14px 24px", borderBottom: "1px solid #111",
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      )}

      <main style={{ position: "relative", zIndex: 1 }}>

        {/* HERO */}
        <div style={{ padding: "60px 24px 48px", maxWidth: "800px", margin: "0 auto" }}>
          <div className="fade-up" style={{ marginBottom: "8px" }}>
            <span className="tag">Student-powered reviews</span>
          </div>

          <h1 className="playfair fade-up-2" style={{
            fontSize: "clamp(36px, 7vw, 72px)", fontWeight: 900,
            lineHeight: 1.05, letterSpacing: "-1.5px",
            margin: "16px 0 20px", color: "#f0ede8"
          }}>
            Find the best<br />
            <span style={{ fontStyle: "italic", color: "#c8a96e" }}>mentors</span> at<br />
            your college.
          </h1>

          <p className="dmsans fade-up-3" style={{
            fontSize: "15px", color: "#666", lineHeight: "1.7",
            maxWidth: "480px", marginBottom: "32px", fontWeight: 300,
          }}>
            Honest, anonymous faculty reviews from students across India. Search your college or submit one that's missing.
          </p>

          {/* Search */}
          <div className="fade-up-3" style={{ position: "relative", maxWidth: "560px" }}>
            <input
              className="search-input"
              value={query}
              onChange={handleSearch}
              placeholder="Search colleges by name or city..."
            />
            <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#333", fontSize: "16px" }}>⌕</span>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #1a1a1a", margin: 0 }} />

        {/* COLLEGE LIST */}
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "36px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <span className="tag">
              {query ? `results for "${query}"` : "all colleges"}
            </span>
            <button
              className="btn-ghost"
              onClick={() => {
                if (!session) { signIn("google"); return }
                setShowSubmit(!showSubmit)
                setSubmitMsg("")
                setSubmitError("")
              }}
            >
              {showSubmit ? "✕ Cancel" : "+ Submit College"}
            </button>
          </div>

          {submitMsg && (
            <div className="dmsans" style={{
              backgroundColor: "rgba(200,169,110,0.08)", border: "1px solid rgba(200,169,110,0.3)",
              borderRadius: "2px", padding: "14px 18px", marginBottom: "24px",
              fontSize: "13px", color: "#c8a96e"
            }}>
              {submitMsg}
            </div>
          )}

          {showSubmit && (
            <div style={{
              backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e",
              borderRadius: "4px", padding: "24px", marginBottom: "32px",
            }}>
              <h3 className="playfair" style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 6px", color: "#f0ede8" }}>
                Submit a College
              </h3>
              <p className="dmsans" style={{ fontSize: "13px", color: "#555", marginBottom: "24px", lineHeight: "1.6" }}>
                We'll verify and approve within 24 hours. Faculty can be added once approved.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="tag" style={{ display: "block", marginBottom: "8px", color: "#555" }}>College Name *</label>
                  <input className="form-input" placeholder="e.g. IIT Bombay" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="tag" style={{ display: "block", marginBottom: "8px", color: "#555" }}>Official Website *</label>
                  <input className="form-input" placeholder="https://college.edu.in" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                </div>
                <div>
                  <label className="tag" style={{ display: "block", marginBottom: "8px", color: "#555" }}>Email Domain</label>
                  <input className="form-input" placeholder="college.edu.in" value={form.emailDomain} onChange={e => setForm({ ...form, emailDomain: e.target.value })} />
                </div>
                <div>
                  <label className="tag" style={{ display: "block", marginBottom: "8px", color: "#555" }}>City</label>
                  <input className="form-input" placeholder="Chennai" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <label className="tag" style={{ display: "block", marginBottom: "8px", color: "#555" }}>State</label>
                  <input className="form-input" placeholder="Tamil Nadu" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
                </div>
                <div>
                  <label className="tag" style={{ display: "block", marginBottom: "8px", color: "#555" }}>Country</label>
                  <input className="form-input" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                </div>
              </div>

              {submitError && (
                <p className="dmsans" style={{ color: "#c0392b", fontSize: "13px", marginTop: "14px" }}>
                  {submitError}
                </p>
              )}

              <div style={{ marginTop: "20px", display: "flex", gap: "12px", alignItems: "center" }}>
                <button className="btn-gold" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit for Review"}
                </button>
                <span className="dmsans" style={{ fontSize: "11px", color: "#444" }}>
                  Reviewed within 24 hours.
                </span>
              </div>
            </div>
          )}

          {/* College list */}
          {loading ? (
            <div className="dmsans" style={{ padding: "60px 0", textAlign: "center", color: "#333", fontSize: "14px" }}>
              Loading colleges...
            </div>
          ) : colleges.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <p className="playfair" style={{ fontSize: "20px", color: "#2a2a2a", marginBottom: "10px", fontStyle: "italic" }}>
                No colleges found.
              </p>
              <p className="dmsans" style={{ fontSize: "13px", color: "#444" }}>
                Be the first to submit yours.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", border: "1px solid #1a1a1a" }}>
              {colleges.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/colleges/${c.id}`}
                  className="college-card"
                  style={{
                    borderRadius: 0,
                    borderLeft: "none", borderRight: "none",
                    borderTop: i === 0 ? "none" : "1px solid #141414",
                    borderBottom: "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: "12px" }}>
                      <h2 className="playfair" style={{
                        fontSize: "17px", fontWeight: 700, margin: "0 0 5px",
                        color: "#f0ede8", letterSpacing: "-0.3px", lineHeight: "1.3",
                      }}>
                        {c.name}
                      </h2>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        {(c.city || c.state) && (
                          <span className="dmsans" style={{ fontSize: "12px", color: "#555" }}>
                            {[c.city, c.state].filter(Boolean).join(", ")}
                          </span>
                        )}
                        <span className="dmsans" style={{ fontSize: "11px", color: "#c8a96e" }}>
                          {c._count.faculty} {c._count.faculty === 1 ? "faculty" : "faculty members"}
                        </span>
                      </div>
                    </div>
                    <span style={{ color: "#333", fontSize: "16px", flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: "1px solid #141414", padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <p className="dmsans" style={{ fontSize: "11px", color: "#333", lineHeight: "1.6" }}>
              All content represents user opinions. We do not verify claims.{" "}
              <Link href="/terms" style={{ color: "#555", textDecoration: "underline" }}>Terms</Link>
              {" · "}
              <Link href="/privacy" style={{ color: "#555", textDecoration: "underline" }}>Privacy</Link>
            </p>
            <span className="playfair" style={{ fontSize: "13px", color: "#2a2a2a", fontStyle: "italic" }}>
              RateMyFaculty
            </span>
          </div>
        </div>

      </main>
    </div>
  )
}

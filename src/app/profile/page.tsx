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
    const timer = setTimeout(() => searchColleges(val), 300)
    return () => clearTimeout(timer)
  }

  function selectCollege(c: College) {
    setForm(f => ({ ...f, collegeId: c.id, collegeName: c.name }))
    setCollegeQuery(c.name)
    setColleges([])
    setShowCollegeDropdown(false)
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
    return <div style={{ minHeight: "100vh", backgroundColor: "#080808" }} />
  }

  if (!session) {
    return (
      <div style={{
        minHeight: "100vh", backgroundColor: "#080808",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}>
        <div style={{ textAlign: "center", maxWidth: "320px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            border: "1px solid rgba(200,169,110,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px", fontSize: "28px",
          }}>
            👤
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "26px", fontWeight: 700, color: "#f0ede8", marginBottom: "12px" }}>
            Your Profile
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#666", marginBottom: "32px", lineHeight: "1.6" }}>
            Sign in to set up your student profile.
          </p>
          <button
            onClick={() => signIn("google")}
            style={{
              width: "100%", background: "#c8a96e", color: "#080808",
              border: "none", padding: "14px", borderRadius: "2px",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              fontSize: "13px", letterSpacing: "0.5px", cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#f0ede8" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .playfair { font-family: 'Playfair Display', Georgia, serif !important; }
        .dmsans   { font-family: 'DM Sans', sans-serif !important; }
        .tag { font-family: 'DM Sans', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #555; }

        .form-input {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid #1e1e1e;
          border-radius: 2px;
          color: #f0ede8;
          padding: 13px 16px;
          font-size: 14px;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .form-input:focus { border-color: #c8a96e; }
        .form-input::placeholder { color: #333; }

        select.form-input option { background: #111; }

        .save-btn {
          width: 100%;
          background: #c8a96e;
          color: #080808;
          border: none;
          padding: 14px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, opacity 0.2s;
        }
        .save-btn:hover { background: #d4b87a; }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .edit-btn {
          background: transparent;
          border: 1px solid #c8a96e;
          color: #c8a96e;
          padding: 8px 20px;
          border-radius: 2px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }
        .edit-btn:hover { background: rgba(200,169,110,0.1); }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 16px 0;
          border-bottom: 1px solid #111;
          gap: 16px;
        }
        .info-row:last-child { border-bottom: none; }

        .college-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0; right: 0;
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 2px;
          z-index: 50;
          max-height: 200px;
          overflow-y: auto;
        }
        .college-option {
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #141414;
          transition: background 0.1s;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #f0ede8;
        }
        .college-option:last-child { border-bottom: none; }
        .college-option:hover { background: #1a1a1a; }
      `}} />

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: "rgba(8,8,8,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #141414",
        padding: "0 20px", height: "52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" className="dmsans" style={{ fontSize: "12px", color: "#555", textDecoration: "none" }}>
          ← Home
        </Link>
        <span className="playfair" style={{ fontSize: "15px", fontWeight: 700 }}>
          Rate<span style={{ color: "#c8a96e" }}>My</span>Faculty
        </span>
        <div style={{ width: "48px" }} />
      </nav>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          <span className="tag" style={{ display: "block", marginBottom: "10px" }}>Student Profile</span>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 className="playfair" style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-0.5px", margin: "0 0 6px" }}>
                {profile?.displayName || session.user?.name || "Your Profile"}
              </h1>
              <p className="dmsans" style={{ fontSize: "13px", color: "#555" }}>
                {session.user?.email}
              </p>
            </div>
            {/* Google avatar */}
            {session.user?.image && (
              <img
                src={session.user.image}
                alt="avatar"
                style={{ width: "48px", height: "48px", borderRadius: "50%", border: "1px solid #1e1e1e", flexShrink: 0 }}
              />
            )}
          </div>
        </div>

        {/* Success / error messages */}
        {saveMsg && (
          <div className="dmsans" style={{
            background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)",
            borderRadius: "2px", padding: "12px 16px", marginBottom: "20px",
            fontSize: "13px", color: "#4ade80",
          }}>
            ✓ {saveMsg}
          </div>
        )}

        {/* ── EDIT MODE ── */}
        {editing ? (
          <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: "4px", padding: "24px" }}>
            <h2 className="playfair" style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 20px" }}>
              Edit Profile
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* Display name */}
              <div>
                <label className="tag" style={{ display: "block", marginBottom: "8px" }}>Display Name</label>
                <input
                  className="form-input"
                  placeholder="How you want to appear (e.g. Joel)"
                  value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                />
              </div>

              {/* Course */}
              <div>
                <label className="tag" style={{ display: "block", marginBottom: "8px" }}>Course / Programme</label>
                <input
                  className="form-input"
                  placeholder="e.g. B.Tech Computer Science and Engineering"
                  value={form.course}
                  onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                />
              </div>

              {/* Graduation year */}
              <div>
                <label className="tag" style={{ display: "block", marginBottom: "8px" }}>Expected Graduation Year</label>
                <select
                  className="form-input"
                  value={form.graduationYear}
                  onChange={e => setForm(f => ({ ...f, graduationYear: e.target.value }))}
                >
                  <option value="">Select year...</option>
                  {GRAD_YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* College picker */}
              <div>
                <label className="tag" style={{ display: "block", marginBottom: "8px" }}>College</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="form-input"
                    placeholder="Search your college..."
                    value={collegeQuery}
                    onChange={e => handleCollegeInput(e.target.value)}
                    onFocus={() => collegeQuery && setShowCollegeDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCollegeDropdown(false), 150)}
                  />
                  {/* Selected indicator */}
                  {form.collegeId && (
                    <span style={{
                      position: "absolute", right: "12px", top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "11px", color: "#4ade80",
                    }}>✓</span>
                  )}
                  {/* Dropdown */}
                  {showCollegeDropdown && colleges.length > 0 && (
                    <div className="college-dropdown">
                      {colleges.map(c => (
                        <div key={c.id} className="college-option" onMouseDown={() => selectCollege(c)}>
                          <div style={{ fontWeight: 500 }}>{c.name}</div>
                          {c.city && <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{c.city}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  {showCollegeDropdown && collegeQuery && colleges.length === 0 && (
                    <div className="college-dropdown">
                      <div style={{ padding: "12px 16px", fontSize: "12px", color: "#444", fontFamily: "'DM Sans', sans-serif" }}>
                        No approved colleges found. <Link href="/" style={{ color: "#c8a96e" }}>Submit yours →</Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {saveError && (
              <p className="dmsans" style={{ color: "#f87171", fontSize: "13px", marginTop: "16px" }}>
                {saveError}
              </p>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Profile"}
              </button>
              <button
                className="dmsans"
                onClick={() => { setEditing(false); setSaveError("") }}
                style={{
                  background: "none", border: "1px solid #1e1e1e", color: "#555",
                  padding: "14px 20px", borderRadius: "2px", cursor: "pointer",
                  fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap",
                }}
              >
                Cancel
              </button>
            </div>
          </div>

        ) : (
          /* ── VIEW MODE ── */
          <>
            {loading ? (
              <div className="dmsans" style={{ padding: "40px 0", textAlign: "center", color: "#333", fontSize: "13px" }}>
                Loading...
              </div>
            ) : (
              <div style={{ background: "#0d0d0d", border: "1px solid #141414", borderRadius: "4px", padding: "24px" }}>

                {/* Profile not set yet */}
                {!profile && (
                  <div style={{ textAlign: "center", padding: "20px 0 28px" }}>
                    <p className="playfair" style={{ fontSize: "18px", color: "#2a2a2a", fontStyle: "italic", marginBottom: "8px" }}>
                      No profile set up yet.
                    </p>
                    <p className="dmsans" style={{ fontSize: "12px", color: "#444", marginBottom: "24px" }}>
                      Add your course and graduation year so others know who's reviewing.
                    </p>
                  </div>
                )}

                {/* Info rows */}
                <div>
                  <div className="info-row">
                    <span className="tag">Display Name</span>
                    <span className="dmsans" style={{ fontSize: "14px", color: profile?.displayName ? "#f0ede8" : "#333", textAlign: "right" }}>
                      {profile?.displayName || "Not set"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="tag">Course</span>
                    <span className="dmsans" style={{ fontSize: "14px", color: profile?.course ? "#f0ede8" : "#333", textAlign: "right", maxWidth: "60%" }}>
                      {profile?.course || "Not set"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="tag">Graduation</span>
                    <span className="dmsans" style={{ fontSize: "14px", color: profile?.graduationYear ? "#c8a96e" : "#333" }}>
                      {profile?.graduationYear ? `Class of ${profile.graduationYear}` : "Not set"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="tag">College</span>
                    <span className="dmsans" style={{ fontSize: "14px", color: profile?.college ? "#f0ede8" : "#333", textAlign: "right", maxWidth: "60%" }}>
                      {profile?.college
                        ? <Link href={`/colleges/${profile.collegeId}`} style={{ color: "#c8a96e", textDecoration: "none" }}>{profile.college.name} ↗</Link>
                        : "Not set"
                      }
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="tag">Google Account</span>
                    <span className="dmsans" style={{ fontSize: "13px", color: "#555" }}>
                      {session.user?.email}
                    </span>
                  </div>
                </div>

                {/* Edit button */}
                <div style={{ marginTop: "24px" }}>
                  <button className="edit-btn" onClick={() => setEditing(true)}>
                    {profile ? "Edit Profile" : "Set Up Profile"}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy note */}
            <div style={{ marginTop: "20px", padding: "16px", border: "1px solid #111", borderRadius: "4px" }}>
              <p className="dmsans" style={{ fontSize: "11px", color: "#444", lineHeight: "1.6", margin: 0 }}>
                <span style={{ color: "#555", fontWeight: 600 }}>Privacy: </span>
                Your email is never shown publicly. Your display name and college are only used to personalise your experience — they are not attached to any reviews you write, which remain fully anonymous.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
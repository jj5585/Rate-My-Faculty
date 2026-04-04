"use client"

import { useState, useEffect, use } from "react"
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

function ratingColor(avg: string | null) {
  if (!avg) return "#2a2a2a"
  const n = parseFloat(avg)
  if (n >= 4.5) return "#4ade80"
  if (n >= 3.5) return "#facc15"
  if (n >= 2.5) return "#fb923c"
  return "#f87171"
}

export default function CollegePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const router = useRouter()

  const [college, setCollege] = useState<College | null>(null)
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [sortBy, setSortBy] = useState<"rating" | "name" | "reviews">("rating")

  // Add faculty form
  const [form, setForm] = useState({ name: "", designation: "", department: "", experience: "" })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState("")
  const [addSuccess, setAddSuccess] = useState("")

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/colleges/${id}`)
      const data = await res.json()
      if (res.ok) {
        setCollege(data.college)
        setFaculty(data.faculty || [])
      }
    } finally {
      setLoading(false)
    }
  }

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
        body: JSON.stringify({ ...form, collegeId: id }),
      })
      const data = await res.json()
      if (res.ok) {
        setAddSuccess(data.existing ? "Faculty already exists — navigating to their profile." : "Faculty added successfully!")
        setForm({ name: "", designation: "", department: "", experience: "" })
        setTimeout(() => {
          router.push(`/faculty/${data.facultyId}`)
        }, 1000)
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

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#080808",
      color: "#f0ede8",
      fontFamily: "'Georgia', serif",
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        .playfair { font-family: 'Playfair Display', Georgia, serif !important; }
        .dmsans { font-family: 'DM Sans', sans-serif !important; }
        .tag { font-family: 'DM Sans', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #555; }
        
        .faculty-row {
          display: flex;
          align-items: center;
          padding: 18px 24px;
          border-bottom: 1px solid #111;
          text-decoration: none;
          color: inherit;
          transition: background 0.15s;
          gap: 16px;
        }
        .faculty-row:hover { background: #0d0d0d; }
        .faculty-row:last-child { border-bottom: none; }
        
        .sort-btn {
          background: transparent;
          border: 1px solid #1e1e1e;
          color: #555;
          padding: 6px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.15s;
        }
        .sort-btn.active { border-color: #c8a96e; color: #c8a96e; background: rgba(200,169,110,0.07); }
        .sort-btn:hover { border-color: #333; color: #888; }
        
        .form-input {
          background: #0a0a0a; border: 1px solid #1e1e1e; border-radius: 2px;
          color: #f0ede8; padding: 12px 16px; font-size: 14px; width: 100%;
          outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s;
        }
        .form-input:focus { border-color: #c8a96e; }
        .form-input::placeholder { color: #333; }
        
        .search-input {
          background: #0f0f0f; border: 1px solid #1a1a1a; border-radius: 2px;
          color: #f0ede8; padding: 10px 16px; font-size: 14px; width: 100%;
          outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s;
        }
        .search-input:focus { border-color: #c8a96e; }
        .search-input::placeholder { color: #333; }
      `}} />

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: "rgba(8,8,8,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #141414",
        padding: "0 32px", height: "56px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" className="dmsans" style={{ fontSize: "12px", color: "#555", textDecoration: "none", letterSpacing: "0.5px" }}>
          ← All Colleges
        </Link>
        <Link href="/" className="playfair" style={{ fontSize: "16px", fontWeight: 700, color: "#f0ede8", textDecoration: "none", letterSpacing: "-0.3px" }}>
          Rate<span style={{ color: "#c8a96e" }}>My</span>Faculty
        </Link>
        <button
          className="dmsans"
          onClick={() => session ? signIn("google") : signIn("google")}
          style={{ fontSize: "11px", color: "#555", background: "none", border: "none", cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase" }}
        >
          {session ? session.user?.name?.split(" ")[0] : "Sign In"}
        </button>
      </nav>

      {loading ? (
        <div className="dmsans" style={{ padding: "80px", textAlign: "center", color: "#333" }}>
          Loading...
        </div>
      ) : !college ? (
        <div style={{ padding: "80px", textAlign: "center" }}>
          <p className="playfair" style={{ fontSize: "24px", color: "#333", fontStyle: "italic" }}>College not found.</p>
          <Link href="/" className="dmsans" style={{ color: "#c8a96e", fontSize: "13px" }}>← Back Home</Link>
        </div>
      ) : (
        <>
          {/* COLLEGE HEADER */}
          <div style={{ borderBottom: "1px solid #141414", padding: "48px 32px 40px", maxWidth: "900px", margin: "0 auto" }}>
            <span className="tag" style={{ display: "block", marginBottom: "16px" }}>
              {[college.city, college.state, college.country].filter(Boolean).join(" · ")}
            </span>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px", flexWrap: "wrap" }}>
              <div>
                <h1 className="playfair" style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, margin: "0 0 12px", letterSpacing: "-1px", lineHeight: 1.1 }}>
                  {college.name}
                </h1>
                <a href={college.website} target="_blank" rel="noopener noreferrer" className="dmsans" style={{ fontSize: "12px", color: "#555", textDecoration: "none", letterSpacing: "0.5px" }}>
                  {college.website} ↗
                </a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
                <span className="dmsans" style={{ fontSize: "32px", fontWeight: 600, color: "#c8a96e", letterSpacing: "-1px" }}>
                  {faculty.length}
                </span>
                <span className="tag">faculty members</span>
              </div>
            </div>
          </div>

          {/* FACULTY SECTION */}
          <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px" }}>

            {/* Controls row */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "32px", flexWrap: "wrap" }}>
              <input
                className="search-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Filter by name or department..."
                style={{ flex: "1 1 200px", minWidth: "180px" }}
              />
              <div style={{ display: "flex", gap: "6px" }}>
                {(["rating", "reviews", "name"] as const).map(s => (
                  <button key={s} className={`sort-btn${sortBy === s ? " active" : ""}`} onClick={() => setSortBy(s)}>
                    {s}
                  </button>
                ))}
              </div>
              <button
                className="dmsans"
                onClick={() => {
                  if (!session) { signIn("google"); return }
                  setShowAdd(!showAdd)
                  setAddError(""); setAddSuccess("")
                }}
                style={{
                  background: "none", border: "1px solid #c8a96e", color: "#c8a96e",
                  padding: "6px 16px", fontSize: "11px", letterSpacing: "0.5px",
                  textTransform: "uppercase", cursor: "pointer", borderRadius: "2px",
                  transition: "all 0.2s", flexShrink: 0,
                }}
              >
                {showAdd ? "✕ Cancel" : "+ Add Faculty"}
              </button>
            </div>

            {/* Add faculty form */}
            {showAdd && (
              <div style={{
                backgroundColor: "#0d0d0d", border: "1px solid #1e1e1e",
                borderRadius: "4px", padding: "28px", marginBottom: "32px",
              }}>
                <h3 className="playfair" style={{ fontSize: "20px", margin: "0 0 6px", fontWeight: 700 }}>Add a Faculty Member</h3>
                <p className="dmsans" style={{ fontSize: "12px", color: "#555", marginBottom: "24px" }}>
                  Adding to {college.name}. Anyone can add faculty — please be accurate.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="tag" style={{ display: "block", marginBottom: "8px" }}>Full Name *</label>
                    <input className="form-input" placeholder="Dr. John Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="tag" style={{ display: "block", marginBottom: "8px" }}>Designation</label>
                    <input className="form-input" placeholder="Associate Professor" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} />
                  </div>
                  <div>
                    <label className="tag" style={{ display: "block", marginBottom: "8px" }}>Department</label>
                    <input className="form-input" placeholder="Computer Science" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                  </div>
                </div>

                {addError && <p className="dmsans" style={{ color: "#f87171", fontSize: "12px", marginTop: "14px" }}>{addError}</p>}
                {addSuccess && <p className="dmsans" style={{ color: "#4ade80", fontSize: "12px", marginTop: "14px" }}>{addSuccess}</p>}

                <button
                  className="dmsans"
                  onClick={handleAddFaculty}
                  disabled={adding}
                  style={{
                    marginTop: "20px",
                    background: "#c8a96e", color: "#080808",
                    border: "none", padding: "12px 24px",
                    fontWeight: 600, fontSize: "12px", letterSpacing: "0.5px",
                    textTransform: "uppercase", cursor: "pointer",
                    borderRadius: "2px", opacity: adding ? 0.6 : 1, transition: "opacity 0.2s"
                  }}
                >
                  {adding ? "Adding..." : "Add Faculty Member"}
                </button>
              </div>
            )}

            {/* Faculty list */}
            {sorted.length === 0 ? (
              <div style={{ padding: "60px 0", textAlign: "center", border: "1px solid #141414" }}>
                <p className="playfair" style={{ fontSize: "20px", color: "#2a2a2a", fontStyle: "italic" }}>
                  {query ? "No matching faculty." : "No faculty yet."}
                </p>
                <p className="dmsans" style={{ fontSize: "12px", color: "#444", marginTop: "8px" }}>
                  {!query && "Be the first to add a faculty member to this college."}
                </p>
              </div>
            ) : (
              <div style={{ border: "1px solid #141414" }}>
                {sorted.map((f, i) => (
                  <Link key={f.id} href={`/faculty/${f.id}`} className="faculty-row">
                    {/* Rank number */}
                    <span className="dmsans" style={{ fontSize: "13px", color: "#2a2a2a", fontWeight: 600, width: "28px", flexShrink: 0, textAlign: "right" }}>
                      {i + 1}
                    </span>

                    {/* Avatar initial */}
                    <div style={{
                      width: "38px", height: "38px", flexShrink: 0,
                      backgroundColor: "#111", border: "1px solid #1e1e1e",
                      borderRadius: "2px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "16px", fontWeight: 700, color: "#c8a96e",
                    }}>
                      {f.name[0]}
                    </div>

                    {/* Name + dept */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="playfair" style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#f0ede8", letterSpacing: "-0.2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {f.name}
                      </p>
                      {(f.designation || f.department) && (
                        <p className="dmsans" style={{ margin: "3px 0 0", fontSize: "11px", color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {[f.designation, f.department].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>

                    {/* Rating */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {f.avgRating ? (
                        <>
                          <span className="playfair" style={{ fontSize: "22px", fontWeight: 700, color: ratingColor(f.avgRating) }}>
                            {f.avgRating}
                          </span>
                          <span className="dmsans" style={{ fontSize: "11px", color: "#333", marginLeft: "2px" }}>/5</span>
                          <p className="dmsans" style={{ margin: "2px 0 0", fontSize: "10px", color: "#444", letterSpacing: "0.5px" }}>
                            {f.ratingCount} review{f.ratingCount !== 1 ? "s" : ""}
                          </p>
                        </>
                      ) : (
                        <span className="dmsans" style={{ fontSize: "12px", color: "#2a2a2a" }}>No ratings</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Bottom nav links */}
          <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 32px 60px", borderTop: "1px solid #111", paddingTop: "32px" }}>
            <div style={{ display: "flex", gap: "24px" }}>
              <Link href={`/incidents?college=${id}`} className="dmsans" style={{ fontSize: "12px", color: "#555", textDecoration: "none", letterSpacing: "0.5px" }}>
                Campus Feed →
              </Link>
              <Link href={`/rooms?college=${id}`} className="dmsans" style={{ fontSize: "12px", color: "#555", textDecoration: "none", letterSpacing: "0.5px" }}>
                Gossip Rooms →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
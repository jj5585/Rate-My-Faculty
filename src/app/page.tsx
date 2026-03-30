"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState("")
  const [allFaculty, setAllFaculty] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [importUrl, setImportUrl] = useState("")
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState("")
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchFaculty()
  }, [])

  async function fetchFaculty() {
    setLoading(true)
    try {
      const res = await fetch("/api/faculty")
      const data = await res.json()
      setAllFaculty(data.faculty || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleImport() {
    if (!importUrl) return
    setImporting(true)
    setImportMsg("")
    const res = await fetch("/api/import-faculty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: importUrl }),
    })
    const data = await res.json()
    if (data.facultyId) {
      setImportMsg("✓ Profile Sync Successful")
      setImportUrl("")
      fetchFaculty()
      router.push(`/faculty/${data.facultyId}`)
    } else {
      setImportMsg(`✗ ${data.error || "Import failed"}`)
    }
    setImporting(false)
  }

  const isSearching = query.trim().length > 0

  const displayList = isSearching
    ? allFaculty.filter((f) => {
        const q = query.toLowerCase()
        return f.name?.toLowerCase().includes(q) || f.department?.toLowerCase().includes(q)
      })
    : allFaculty
        .filter((f) => f.ratingCount >= 1)
        .sort((a: any, b: any) => {
          const diff = parseFloat(b.avgRating) - parseFloat(a.avgRating)
          return diff !== 0 ? diff : b.ratingCount - a.ratingCount
        })
        .slice(0, 40)

  const getRatingStyle = (avg: string) => {
    const n = parseFloat(avg)
    if (n >= 4.5) return { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" }
    if (n >= 3.5) return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" }
    return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" }
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#0a0a0a", 
      color: "#f4f4f5",
      fontFamily: "Inter, -apple-system, sans-serif",
      paddingBottom: "100px"
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        input:focus { border-color: #ef4444 !important; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2); }
      `}</style>

      {/* Navigation */}
      <nav style={{
        backdropFilter: "blur(12px)",
        backgroundColor: "rgba(10, 10, 10, 0.8)",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid #27272a"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: "linear-gradient(135deg, #ef4444, #991b1b)",
            width: "32px", height: "32px",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "bold", fontSize: "14px"
          }}>R</div>
          <span style={{ fontWeight: 700, letterSpacing: "-0.5px", fontSize: "18px" }}>RateMyFaculty</span>
        </div>
        
        {mounted && (
          <button 
            onClick={() => (session ? signOut() : signIn("google"))}
            style={{
              fontSize: "13px", fontWeight: 500,
              padding: "8px 16px", borderRadius: "20px",
              backgroundColor: session ? "transparent" : "#fff",
              color: session ? "#a1a1aa" : "#000",
              border: session ? "1px solid #27272a" : "none",
              cursor: "pointer", transition: "all 0.2s"
            }}
          >
            {session ? "Sign Out" : "Sign In"}
          </button>
        )}
      </nav>

      {/* Hero Section */}
      <div style={{ padding: "60px 24px 40px", textAlign: "center" }}>
        <h1 style={{
          fontSize: "clamp(40px, 8vw, 72px)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          marginBottom: "16px",
          background: "linear-gradient(to bottom, #ffffff, #a1a1aa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Find the best <br/>
          <span style={{ color: "#ef4444", WebkitTextFillColor: "initial" }}>mentors at SRM.</span>
        </h1>
        <p style={{ color: "#71717a", fontSize: "16px", maxWidth: "500px", margin: "0 auto 32px" }}>
          The community-driven platform for honest faculty reviews and academic insights.
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, department, or subject..."
            style={{
              width: "100%",
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "14px",
              color: "white",
              padding: "16px 20px",
              fontSize: "16px",
              outline: "none",
              transition: "all 0.2s"
            }}
          />
        </div>
      </div>

      {/* Dynamic List Section */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "1px" }}>
            {isSearching ? "Search Results" : "Top Performing Faculty"}
          </h2>
          <button 
            onClick={() => setShowImport(!showImport)}
            style={{ background: "none", border: "none", color: "#ef4444", fontSize: "13px", cursor: "pointer", fontWeight: 500 }}
          >
            {showImport ? "Close Import" : "+ Import Profile"}
          </button>
        </div>

        {showImport && (
          <div className="fade-in" style={{ 
            backgroundColor: "#111113", 
            border: "1px solid #27272a", 
            borderRadius: "12px", 
            padding: "20px", 
            marginBottom: "24px" 
          }}>
             <p style={{ fontSize: "13px", color: "#71717a", marginBottom: "12px" }}>Paste the SRM Staff Finder URL below:</p>
             <div style={{ display: "flex", gap: "10px" }}>
                <input 
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  placeholder="https://www.srmist.edu.in/faculty/..."
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #27272a", backgroundColor: "#000", color: "white" }}
                />
                <button 
                  onClick={handleImport}
                  disabled={importing}
                  style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "0 20px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}
                >
                  {importing ? "..." : "Import"}
                </button>
             </div>
             {importMsg && <p style={{ marginTop: "10px", fontSize: "12px", color: importMsg.includes("✓") ? "#10b981" : "#ef4444" }}>{importMsg}</p>}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
             <div style={{ width: "30px", height: "30px", border: "2px solid #27272a", borderTopColor: "#ef4444", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {displayList.map((f, i) => {
              const rating = getRatingStyle(f.avgRating);
              return (
                <Link key={f.id} href={`/faculty/${f.id}`} className="fade-in" style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px",
                  backgroundColor: "#111113",
                  border: "1px solid #1f1f22",
                  borderRadius: "16px",
                  textDecoration: "none",
                  transition: "transform 0.2s, border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.01)";
                  e.currentTarget.style.borderColor = "#3f3f46";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = "#1f1f22";
                }}>
                  {/* Avatar */}
                  <div style={{ position: "relative", marginRight: "16px" }}>
                    {f.photoUrl ? (
                      <img 
                        src={`/api/image-proxy?url=${encodeURIComponent(f.photoUrl)}`} 
                        style={{ width: "50px", height: "50px", borderRadius: "12px", objectFit: "cover" }} 
                      />
                    ) : (
                      <div style={{ width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "#27272a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "bold" }}>
                        {f.name?.[0]}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#fff" }}>{f.name}</h3>
                    <p style={{ margin: "2px 0 0", fontSize: "13px", color: "#71717a" }}>{f.department}</p>
                  </div>

                  {/* Rating Badge */}
                  <div style={{ textAlign: "right" }}>
                    {f.avgRating ? (
                      <div style={{ 
                        backgroundColor: rating.bg, 
                        color: rating.color,
                        padding: "6px 12px",
                        borderRadius: "10px",
                        fontWeight: 800,
                        fontSize: "18px"
                      }}>
                        {f.avgRating}
                      </div>
                    ) : (
                      <span style={{ color: "#3f3f46" }}>No ratings</span>
                    )}
                    <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#3f3f46" }}>{f.ratingCount} reviews</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Nav */}
      <div style={{
        position: "fixed",
        bottom: "24px", left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(24, 24, 27, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid #3f3f46",
        borderRadius: "30px",
        display: "flex",
        padding: "8px 12px",
        gap: "8px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
      }}>
        {[
          { href: "/", label: "Home", icon: "Home" },
          { href: "/today", label: "Today", icon: "Calendar" },
          { href: "/incidents", label: "Feed", icon: "Zap" },
          { href: "/rooms", label: "Rooms", icon: "Grid" },
        ].map((item) => (
          <Link key={item.href} href={item.href} style={{
            padding: "8px 16px",
            borderRadius: "20px",
            color: item.href === "/" ? "#fff" : "#a1a1aa",
            backgroundColor: item.href === "/" ? "#ef4444" : "transparent",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 500,
            transition: "all 0.2s"
          }}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
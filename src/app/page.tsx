"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedStars, setSelectedStars] = useState<number | null>(null)
  const [showRedFlags, setShowRedFlags] = useState(false)
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

  const isFiltering = query.trim().length > 0 || selectedStars !== null || showRedFlags

  const filteredFaculty = allFaculty.filter((f) => {
    const q = query.toLowerCase()
    const matchesSearch = f.name?.toLowerCase().includes(q) || f.department?.toLowerCase().includes(q)
    const rating = parseFloat(f.avgRating || "0")
    const matchesStars = selectedStars === null || (rating >= selectedStars && rating < selectedStars + 1)
    const matchesRedFlag = !showRedFlags || (rating > 0 && rating < 2.5)
    return matchesSearch && matchesStars && matchesRedFlag
  })

  const sortedFaculty = [...filteredFaculty].sort((a, b) => {
    const ratingA = parseFloat(a.avgRating || "0")
    const ratingB = parseFloat(b.avgRating || "0")
    if (showRedFlags) return ratingA - ratingB
    if (ratingA !== ratingB) return ratingB - ratingA
    return (b.ratingCount || 0) - (a.ratingCount || 0)
  })

  const displayList = isFiltering ? sortedFaculty : sortedFaculty.slice(0, 50)

  const getRatingStyle = (avg: string) => {
    const n = parseFloat(avg)
    if (n >= 4.0) return { color: "#00ff88", bg: "rgba(0, 255, 136, 0.1)" }
    if (n >= 3.0) return { color: "#FFD700", bg: "rgba(255, 215, 0, 0.1)" }
    if (n >= 2.0) return { color: "#FF8C00", bg: "rgba(255, 140, 0, 0.1)" }
    return { color: "#ff4444", bg: "rgba(255, 68, 68, 0.1)" }
  }

  if (!mounted) return <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a" }} />

  return (
    <div style={{ 
      minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#f4f4f5",
      fontFamily: "Inter, -apple-system, sans-serif", position: "relative"
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        input:focus { border-color: #ef4444 !important; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2); outline: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .nav-item:active { transform: scale(0.95); transition: transform 0.1s; }
      `}} />

      <main style={{ paddingBottom: "200px", position: "relative", zIndex: 1 }} className="fade-in">
        <nav style={{
          backdropFilter: "blur(12px)", backgroundColor: "rgba(10, 10, 10, 0.8)",
          padding: "0 24px", height: "64px", display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #27272a"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "linear-gradient(135deg, #ef4444, #991b1b)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" }}>R</div>
            <span style={{ fontWeight: 700, letterSpacing: "-0.5px", fontSize: "18px" }}>RateMyFaculty</span>
          </div>
          <button onClick={() => (session ? signOut() : signIn("google"))} style={{ fontSize: "12px", fontWeight: 700, padding: "8px 16px", borderRadius: "20px", backgroundColor: "#fff", color: "#000", border: "none", cursor: "pointer" }}>
            {session ? "LOGOUT" : "SIGN IN"}
          </button>
        </nav>

        {/* Hero Section */}
        <div style={{ padding: "80px 24px 40px", textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(48px, 9vw, 84px)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: "1.05", marginBottom: "12px", color: "#ffffff" }}>
            Find the best <br/><span style={{ color: "#ef4444" }}>mentors at SRM.</span>
          </h1>
          <p style={{ color: "#71717a", fontSize: "clamp(14px, 2vw, 17px)", maxWidth: "500px", margin: "0 auto 40px", lineHeight: "1.6" }}>
            The community-driven platform for honest faculty reviews and academic insights.
          </p>

          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or department..." style={{ width: "100%", backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "14px", color: "white", padding: "18px 24px", fontSize: "16px" }} />
          </div>

          <div className="hide-scrollbar" style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px", overflowX: "auto", paddingBottom: "10px" }}>
            <button onClick={() => {setSelectedStars(null); setShowRedFlags(false);}} style={{ padding: "8px 16px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, border: "1px solid", borderColor: (!selectedStars && !showRedFlags) ? "#ef4444" : "#27272a", backgroundColor: (!selectedStars && !showRedFlags) ? "rgba(239, 68, 68, 0.1)" : "transparent", color: (!selectedStars && !showRedFlags) ? "#ef4444" : "#71717a", cursor: "pointer" }}>TOP 50</button>
            <button onClick={() => {setShowRedFlags(!showRedFlags); setSelectedStars(null);}} style={{ padding: "8px 16px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, border: "1px solid", borderColor: showRedFlags ? "#ef4444" : "#27272a", backgroundColor: showRedFlags ? "rgba(239, 68, 68, 0.2)" : "transparent", color: showRedFlags ? "#fff" : "#ff4444", cursor: "pointer" }}>🚩 RED FLAGS</button>
            {[4, 3, 2, 1].map((s) => (
              <button key={s} onClick={() => {setSelectedStars(selectedStars === s ? null : s); setShowRedFlags(false);}} style={{ padding: "8px 16px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, border: "1px solid", borderColor: selectedStars === s ? "#ef4444" : "#27272a", backgroundColor: selectedStars === s ? "rgba(239, 68, 68, 0.1)" : "transparent", color: selectedStars === s ? "#ef4444" : "#71717a", cursor: "pointer", whiteSpace: "nowrap" }}>{s} STAR{s > 1 ? 'S' : ''}</button>
            ))}
          </div>
        </div>

        {/* Faculty List Section */}
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "11px", fontWeight: 800, color: showRedFlags ? "#ef4444" : "#3f3f46", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              {showRedFlags ? "CRITICAL: LOW RATED" : isFiltering ? `MATCHING (${displayList.length})` : "TOP 50 MEMBERS"}
            </h2>
            <button onClick={() => setShowImport(!showImport)} style={{ background: "none", border: "none", color: "#ef4444", fontSize: "12px", cursor: "pointer", fontWeight: 700 }}>
              {showImport ? "CLOSE" : "+ IMPORT PROFILE"}
            </button>
          </div>

          {showImport && (
            <div className="fade-in" style={{ backgroundColor: "#111113", border: "1px solid #27272a", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
               <div style={{ display: "flex", gap: "10px" }}>
                  <input value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="SRM Profile URL..." style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #27272a", backgroundColor: "#000", color: "white", fontSize: "13px" }} />
                  <button onClick={handleImport} disabled={importing} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "0 20px", borderRadius: "10px", fontWeight: 700 }}>{importing ? "..." : "GO"}</button>
               </div>
               {importMsg && <p style={{ marginTop: "10px", fontSize: "12px", color: importMsg.includes("✓") ? "#10b981" : "#ef4444" }}>{importMsg}</p>}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}><div style={{ width: "24px", height: "24px", border: "2px solid #27272a", borderTopColor: "#ef4444", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} /></div>
            ) : (
              displayList.map((f) => {
                const rs = getRatingStyle(f.avgRating);
                return (
                  <Link key={f.id} href={`/faculty/${f.id}`} style={{ display: "flex", alignItems: "center", padding: "16px", backgroundColor: "#111113", border: "1px solid #1f1f22", borderRadius: "16px", textDecoration: "none" }}>
                    <div style={{ marginRight: "16px" }}>
                      {f.photoUrl ? (
                        <img src={`/api/image-proxy?url=${encodeURIComponent(f.photoUrl)}`} style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "44px", height: "44px", borderRadius: "10px", backgroundColor: "#27272a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>{f.name?.[0]}</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</h3>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#71717a" }}>{f.department}</p>
                    </div>
                    <div style={{ backgroundColor: rs.bg, color: rs.color, padding: "6px 12px", borderRadius: "10px", fontWeight: 800, fontSize: "16px" }}>{f.avgRating}</div>
                  </Link>
                )
              })
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: "80px", padding: "0 20px" }}>
            <p style={{ fontSize: "11px", color: "#3f3f46", lineHeight: "1.6", margin: "0 0 16px", fontWeight: 500 }}>
              All content represents user-submitted opinions and experiences. We do not verify the accuracy of any claims. <br/>Users are solely responsible for their submissions. We reserve the right to remove content at our discretion. <br/>By using this platform, you agree to our Terms of Service.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
              <Link href="/privacy" style={{ fontSize: "11px", color: "#71717a", textDecoration: "underline", fontWeight: 700 }}>PRIVACY POLICY</Link>
              <Link href="/terms" style={{ fontSize: "11px", color: "#71717a", textDecoration: "underline", fontWeight: 700 }}>TERMS OF SERVICE</Link>
            </div>
          </div>
        </div>
      </main>

      {/* FIXED NAVIGATION */}
      <div style={{ 
        position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)", 
        backgroundColor: "rgba(24, 24, 27, 0.95)", backdropFilter: "blur(20px)", 
        border: "1px solid #3f3f46", borderRadius: "40px", display: "flex", 
        padding: "8px", gap: "4px", zIndex: 9999, pointerEvents: "auto",
        boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
      }}>
        {[
          { href: "/", label: "Home" },
          { href: "/today", label: "Today" },
          { href: "/incidents", label: "Feed" },
          { href: "/rooms", label: "Rooms" },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="nav-item" style={{
            padding: "10px 22px", borderRadius: "30px", 
            color: item.href === "/" ? "#fff" : "#a1a1aa", 
            backgroundColor: item.href === "/" ? "#ef4444" : "transparent", 
            textDecoration: "none", fontSize: "13px", fontWeight: 700,
            cursor: "pointer", display: "inline-block"
          }}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

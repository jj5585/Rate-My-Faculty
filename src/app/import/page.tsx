"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ImportPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleImport = async () => {
    if (!url) return;
    
    setLoading(true)
    try {
      const res = await fetch("/api/import-faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (data.facultyId) {
        router.push(`/faculty/${data.facultyId}`)
      } else {
        alert("Import failed. Please check the URL and try again.")
      }
    } catch (err) {
      console.error(err)
      alert("An error occurred during synchronization.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#0a0a0a", 
      color: "#f4f4f5",
      fontFamily: "Inter, sans-serif",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Top Navigation */}
      <nav style={{
        padding: "16px 20px",
        borderBottom: "1px solid #1f1f22",
        display: "flex",
        alignItems: "center"
      }}>
        <Link href="/" style={{ textDecoration: "none", color: "#71717a", fontSize: "14px" }}>
          ← Back to Search
        </Link>
      </nav>

      <div style={{ 
        flex: 1, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "20px"
      }}>
        <div style={{ 
          width: "100%", 
          maxWdth: "450px",
          animation: "fadeIn 0.5s ease-out" 
        }}>
          {/* Hero Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ 
              width: "56px", height: "56px", 
              backgroundColor: "rgba(239, 68, 68, 0.1)", 
              borderRadius: "16px", 
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
              color: "#ef4444",
              fontSize: "24px"
            }}>
              📥
            </div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 8px" }}>
              Sync Faculty Profile
            </h1>
            <p style={{ color: "#71717a", fontSize: "15px" }}>
              Add new faculty members directly from the SRM database.
            </p>
          </div>

          {/* Instructions Card */}
          <div style={{
            backgroundColor: "#111113",
            border: "1px solid #1f1f22",
            borderRadius: "24px",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
          }}>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#3f3f46", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                Profile URL
              </label>
              <input
                type="text"
                placeholder="https://www.srmist.edu.in/faculty/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "#0a0a0a",
                  border: "1px solid #27272a",
                  borderRadius: "12px",
                  color: "white",
                  padding: "14px 16px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
              />
            </div>

            <button
              onClick={handleImport}
              disabled={loading || !url}
              style={{
                width: "100%",
                backgroundColor: url ? "#ef4444" : "#27272a",
                color: url ? "white" : "#71717a",
                padding: "16px",
                borderRadius: "14px",
                fontWeight: 700,
                fontSize: "16px",
                border: "none",
                cursor: url ? "pointer" : "not-allowed",
                transition: "all 0.2s"
              }}
            >
              {loading ? "Synchronizing..." : "Import Profile"}
            </button>

            {/* Step Guide */}
            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #1f1f22" }}>
               <h4 style={{ fontSize: "11px", fontWeight: 700, color: "#3f3f46", marginBottom: "12px", textTransform: "uppercase" }}>Quick Guide</h4>
               <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    "Go to SRM Staff Finder",
                    "Search for the faculty member",
                    "Copy their profile URL from the browser bar",
                    "Paste it here to sync their data"
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", alignItems: "start" }}>
                      <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "bold" }}>{i + 1}.</span>
                      <p style={{ fontSize: "12px", color: "#a1a1aa", margin: 0 }}>{step}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "#3f3f46" }}>
            Data is fetched directly from the official university portal.
          </p>
        </div>
      </div>

      {/* Floating Bottom Nav (Consistent) */}
      <div style={{
        position: "fixed",
        bottom: "24px", left: "50%", transform: "translateX(-50%)",
        backgroundColor: "rgba(24, 24, 27, 0.8)", backdropFilter: "blur(20px)",
        border: "1px solid #3f3f46", borderRadius: "30px",
        display: "flex", padding: "8px 12px", gap: "8px"
      }}>
        <Link href="/" style={{ padding: "8px 16px", borderRadius: "20px", color: "#a1a1aa", textDecoration: "none", fontSize: "13px" }}>Home</Link>
        <Link href="/incidents" style={{ padding: "8px 16px", borderRadius: "20px", color: "#a1a1aa", textDecoration: "none", fontSize: "13px" }}>Feed</Link>
      </div>
    </div>
  )
}
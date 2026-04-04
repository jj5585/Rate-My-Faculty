"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ImportPage() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

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
        alert("Import failed. Please verify the URL and try again.")
      }
    } catch (err) {
      console.error(err)
      alert("An error occurred during synchronization.")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return <div style={{ minHeight: "100vh", backgroundColor: "#080808" }} />

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#080808", 
      color: "#f0ede8",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex",
      flexDirection: "column",
      position: "relative"
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;700&display=swap');
        .playfair { font-family: 'Playfair Display', serif !important; }
        
        .import-input {
          width: 100%;
          backgroundColor: #0d0d0d;
          border: 1px solid #1a1a1a;
          border-radius: 2px;
          color: #f0ede8;
          padding: 18px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.3s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .import-input:focus { border-color: #c8a96e; }
        
        .btn-gold {
          width: 100%;
          background: #c8a96e;
          color: #080808;
          padding: 18px;
          border: none;
          border-radius: 2px;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-gold:hover { background: #d4b87a; transform: translateY(-1px); }
        .btn-gold:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      `}} />

      {/* Top Navigation */}
      <nav style={{
        padding: "0 32px",
        height: "70px",
        borderBottom: "1px solid #1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <Link href="/" style={{ textDecoration: "none", color: "#c8a96e", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
          ← Back to Directory
        </Link>
        <span className="playfair" style={{ fontSize: "18px", fontWeight: 700 }}>
          Rate<span style={{ color: "#c8a96e" }}>My</span>Faculty
        </span>
        <div style={{ width: "80px" }} />
      </nav>

      <div style={{ 
        flex: 1, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "40px 20px"
      }}>
        <div style={{ width: "100%", maxWidth: "500px" }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
             <div style={{ color: "#c8a96e", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "16px", fontWeight: 600 }}>
              Database Synchronization
            </div>
            <h1 className="playfair" style={{ fontSize: "42px", fontWeight: 700, margin: "0 0 16px", lineHeight: 1.1 }}>
              Import Faculty <br />
              <span style={{ fontStyle: "italic", color: "#c8a96e" }}>Records</span>
            </h1>
            <p style={{ color: "#555", fontSize: "15px", lineHeight: 1.6, maxWidth: "400px", margin: "0 auto" }}>
              Sync profiles directly from official institutional portals to ensure data integrity.
            </p>
          </div>

          {/* Card */}
          <div style={{
            backgroundColor: "#0d0d0d",
            border: "1px solid #1a1a1a",
            padding: "40px",
            boxShadow: "0 30px 60px rgba(0,0,0,0.5)"
          }}>
            <div style={{ marginBottom: "32px" }}>
              <label style={{ display: "block", fontSize: "10px", fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
                Official Profile URL
              </label>
              <input
                type="text"
                className="import-input"
                placeholder="https://institution.edu.in/faculty/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ backgroundColor: "#080808" }}
              />
            </div>

            <button
              onClick={handleImport}
              disabled={loading || !url}
              className="btn-gold"
            >
              {loading ? "Synchronizing..." : "Initialize Import"}
            </button>

            {/* Guide */}
            <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid #1a1a1a" }}>
               <h4 className="playfair" style={{ fontSize: "18px", color: "#f0ede8", marginBottom: "16px", fontStyle: "italic" }}>Submission Protocol</h4>
               <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    "Locate the faculty member on your college's official staff directory.",
                    "Ensure you are viewing their individual profile page.",
                    "Copy the full URL from your browser's address bar.",
                    "Paste the link above to begin the automated extraction."
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: "16px", alignItems: "start" }}>
                      <span style={{ fontSize: "11px", color: "#c8a96e", fontWeight: "bold", marginTop: "2px" }}>0{i + 1}</span>
                      <p style={{ fontSize: "13px", color: "#666", margin: 0, lineHeight: 1.5 }}>{step}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: "32px", fontSize: "11px", color: "#333", letterSpacing: "0.5px" }}>
            All data is sourced directly from institutional domains. <br />
            We do not store cookies from external portals.
          </p>
        </div>
      </div>
    </div>
  )
}
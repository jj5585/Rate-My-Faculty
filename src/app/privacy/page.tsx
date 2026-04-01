"use client"

import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div style={{ 
      minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#f4f4f5",
      fontFamily: "Inter, -apple-system, sans-serif", paddingBottom: "100px"
    }}>
      {/* Header */}
      <header style={{
        padding: "24px 20px", borderBottom: "1px solid #1f1f22",
        backdropFilter: "blur(12px)", backgroundColor: "rgba(10, 10, 10, 0.8)",
        position: "sticky", top: 0, zIndex: 100, display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>Privacy Policy</h1>
          <p style={{ fontSize: "11px", color: "#71717a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
            Last Updated: April 2, 2026
          </p>
        </div>
        <Link href="/" style={{ fontSize: "13px", fontWeight: 600, color: "#ef4444", textDecoration: "none" }}>BACK</Link>
      </header>

      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 20px", lineHeight: "1.7" }}>
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>1. Data Collection</h2>
          <p style={{ color: "#a1a1aa", fontSize: "15px" }}>
            Rate My Faculty (RMF) collects your <strong>Google Email</strong> and <strong>Name</strong> via NextAuth to verify that reviews come from legitimate students. We also store the ratings and text reviews you submit.
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>2. Anonymity</h2>
          <p style={{ color: "#a1a1aa", fontSize: "15px" }}>
            Your privacy is our priority. While we link reviews to your account in our database to prevent spam, <strong>your identity is never revealed</strong> to other students or faculty members on the platform. All reviews are displayed as "Anonymous."
          </p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>3. Faculty Information</h2>
          <p style={{ color: "#a1a1aa", fontSize: "15px" }}>
            Faculty data (names, photos, departments) is sourced from public SRMIST directories. This information is used solely to facilitate the review process. If a faculty member wishes to request a correction, they may reach out to the development team.
          </p>
        </section>

        <section style={{ marginBottom: "40px", padding: "24px", backgroundColor: "#111113", borderRadius: "16px", border: "1px solid #1f1f22" }}>
          <h2 style={{ color: "#ef4444", fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>4. Your Rights</h2>
          <ul style={{ color: "#a1a1aa", fontSize: "15px", paddingLeft: "20px" }}>
            <li style={{ marginBottom: "8px" }}>View any reviews you have previously posted.</li>
            <li style={{ marginBottom: "8px" }}>Delete your account and all associated review data at any time.</li>
            <li>Request a full export of the data we have stored for your account.</li>
          </ul>
        </section>

        <div style={{ textAlign: "center", marginTop: "60px", borderTop: "1px solid #1f1f22", paddingTop: "40px" }}>
          <p style={{ color: "#3f3f46", fontSize: "12px", fontWeight: 600 }}>
            DEVELOPED BY STUDENTS FOR STUDENTS. <br/>
            SRMIST KTR CAMPUS.
          </p>
        </div>
      </main>

      {/* Re-using your Floating Nav */}
      <div style={{
        position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
        backgroundColor: "rgba(24, 24, 27, 0.8)", backdropFilter: "blur(20px)",
        border: "1px solid #3f3f46", borderRadius: "30px", display: "flex", padding: "8px 12px", gap: "8px", zIndex: 1000
      }}>
        <Link href="/" style={{ padding: "8px 16px", borderRadius: "20px", color: "#a1a1aa", textDecoration: "none", fontSize: "13px" }}>Home</Link>
        <Link href="/today" style={{ padding: "8px 16px", borderRadius: "20px", color: "#a1a1aa", textDecoration: "none", fontSize: "13px" }}>Today</Link>
        <Link href="/incidents" style={{ padding: "8px 16px", borderRadius: "20px", color: "#a1a1aa", textDecoration: "none", fontSize: "13px" }}>Feed</Link>
      </div>
    </div>
  )
}
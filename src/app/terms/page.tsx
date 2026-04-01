"use client"

import Link from "next/link"

export default function TermsPage() {
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
          <h1 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>Terms of Service</h1>
          <p style={{ fontSize: "11px", color: "#71717a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
            Effective: April 2, 2026
          </p>
        </div>
        <Link href="/" style={{ fontSize: "13px", fontWeight: 600, color: "#ef4444", textDecoration: "none" }}>BACK</Link>
      </header>

      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 20px", lineHeight: "1.7" }}>
        
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>1. Acceptance of Terms</h2>
          <p style={{ color: "#a1a1aa", fontSize: "14px" }}>
            By accessing Rate My Faculty (RMF), you agree to be bound by these terms. This platform is a community resource intended for students of SRMIST to share academic experiences.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>2. User Conduct & Content</h2>
          <p style={{ color: "#a1a1aa", fontSize: "14px", marginBottom: "12px" }}>
            You are solely responsible for the reviews you post. By using RMF, you agree NOT to:
          </p>
          <ul style={{ color: "#a1a1aa", fontSize: "14px", paddingLeft: "20px" }}>
            <li>Post intentionally false, defamatory, or malicious information.</li>
            <li>Use hate speech, threats, or harassment toward any faculty member or student.</li>
            <li>Post private personal information (phone numbers, home addresses).</li>
            <li>Spam the system with multiple entries for the same faculty member.</li>
          </ul>
        </section>

        <section style={{ marginBottom: "32px", padding: "20px", backgroundColor: "#111113", borderLeft: "4px solid #ef4444", borderRadius: "4px" }}>
          <h2 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>3. Disclaimer of Liability</h2>
          <p style={{ color: "#a1a1aa", fontSize: "13px" }}>
            RMF does not verify the accuracy of user-generated reviews. Content represents the opinions of individual students and does not reflect the views of the RMF development team or SRMIST. We are not liable for any professional or personal impact resulting from content posted on this platform.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>4. Content Moderation</h2>
          <p style={{ color: "#a1a1aa", fontSize: "14px" }}>
            We reserve the right to remove any content that violates these terms or is reported as inappropriate. Repeated violations may result in a permanent ban of your student account from the platform.
          </p>
        </section>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>5. Faculty Rights</h2>
          <p style={{ color: "#a1a1aa", fontSize: "14px" }}>
            Faculty members may request the removal of reviews that contain verifiable false information or violate the conduct policies listed in Section 2.
          </p>
        </section>

        <div style={{ textAlign: "center", marginTop: "60px", opacity: 0.5 }}>
          <p style={{ fontSize: "11px", fontWeight: 600 }}>© 2026 RMF DEV TEAM</p>
        </div>
      </main>

      {/* Floating Nav */}
      <div style={{
        position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)",
        backgroundColor: "rgba(24, 24, 27, 0.9)", backdropFilter: "blur(20px)",
        border: "1px solid #3f3f46", borderRadius: "40px", display: "flex", padding: "8px", gap: "4px", zIndex: 9999
      }}>
        <Link href="/" style={{ padding: "10px 20px", borderRadius: "30px", color: "#a1a1aa", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>Home</Link>
        <Link href="/privacy" style={{ padding: "10px 20px", borderRadius: "30px", color: "#a1a1aa", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>Privacy</Link>
      </div>
    </div>
  )
}
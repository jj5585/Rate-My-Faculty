"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function TermsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div style={{ minHeight: "100vh", backgroundColor: "#080808" }} />

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#080808", 
      color: "#f0ede8",
      fontFamily: "'DM Sans', sans-serif", 
      paddingBottom: "100px",
      position: "relative"
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        .playfair { font-family: 'Playfair Display', serif !important; }
        .dmsans { font-family: 'DM Sans', sans-serif !important; }
        
        section { margin-bottom: 60px; }
        h2 { 
          font-family: 'Playfair Display', serif; 
          font-size: 28px; 
          font-weight: 700; 
          margin-bottom: 24px; 
          color: #f0ede8;
          font-style: italic;
        }
        p, li { 
          font-size: 16px; 
          line-height: 1.8; 
          color: #888; 
          font-weight: 300;
        }
        .gold-box {
          border-left: 2px solid #c8a96e;
          padding-left: 32px;
          margin: 40px 0;
          background: rgba(200, 169, 110, 0.02);
          padding-top: 20px;
          padding-bottom: 20px;
        }
      `}} />

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: "rgba(8,8,8,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #1a1a1a",
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "70px",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span className="playfair" style={{ fontSize: "18px", fontWeight: 700, color: "#f0ede8" }}>
            Rate<span style={{ color: "#c8a96e" }}>My</span>Faculty
          </span>
        </Link>
        <Link href="/" style={{ 
          fontSize: "11px", fontWeight: 700, color: "#c8a96e", 
          textDecoration: "none", letterSpacing: "2px", textTransform: "uppercase" 
        }}>
          Exit Site
        </Link>
      </nav>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "100px 32px" }}>
        
        <header style={{ marginBottom: "80px", textAlign: "center" }}>
          <span style={{ color: "#c8a96e", textTransform: "uppercase", letterSpacing: "3px", fontSize: "12px", fontWeight: 600 }}>
            Legal Framework
          </span>
          <h1 className="playfair" style={{ fontSize: "clamp(40px, 8vw, 64px)", fontWeight: 700, margin: "20px 0" }}>
            Terms of <span style={{ fontStyle: "italic" }}>Service</span>
          </h1>
          <div style={{ width: "40px", height: "1px", background: "#c8a96e", margin: "0 auto 20px" }} />
          <p className="dmsans" style={{ fontSize: "14px", color: "#444" }}>Last Revised: April 4, 2026</p>
        </header>

        <div className="gold-box">
          <h3 className="dmsans" style={{ fontSize: "12px", fontWeight: 700, color: "#c8a96e", letterSpacing: "1px", marginBottom: "12px", textTransform: "uppercase" }}>
            Arbitration Notice
          </h3>
          <p style={{ fontSize: "14px", color: "#666", fontStyle: "italic" }}>
            THESE TERMS CONTAIN AN ARBITRATION CLAUSE AND A CLASS ACTION WAIVER. BY USING THIS SITE, YOU AGREE THAT DISPUTES WILL BE RESOLVED BY BINDING, INDIVIDUAL ARBITRATION AND YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT.
          </p>
        </div>

        <section>
          <h2>1. Acceptance of Protocol</h2>
          <p>
            By accessing Rate My Faculty, you enter into a legally binding agreement to abide by these terms. This platform is a student-powered repository designed to provide transparency in higher education through anonymous, peer-reviewed faculty feedback.
          </p>
        </section>

        <section>
          <h2>2. Rules of Engagement</h2>
          <p style={{ marginBottom: "20px" }}>
            As a contributor to this editorial platform, you are solely responsible for the integrity of your submissions. You agree not to:
          </p>
          <ul style={{ paddingLeft: "20px", listStyleType: "none" }}>
            <li style={{ marginBottom: "12px" }}><span style={{ color: "#c8a96e", marginRight: "10px" }}>—</span> Post intentionally false or malicious information regarding a faculty member.</li>
            <li style={{ marginBottom: "12px" }}><span style={{ color: "#c8a96e", marginRight: "10px" }}>—</span> Utilize hate speech, intimidation, or harassment in any review or gossip room.</li>
            <li style={{ marginBottom: "12px" }}><span style={{ color: "#c8a96e", marginRight: "10px" }}>—</span> Reveal private personal data, such as personal contact numbers or residential addresses.</li>
            <li style={{ marginBottom: "12px" }}><span style={{ color: "#c8a96e", marginRight: "10px" }}>—</span> Use automated scripts, "spiders," or scrapers to extract data from this directory.</li>
          </ul>
        </section>

        <section>
          <h2>3. Institutional Submissions</h2>
          <p>
            Users may submit new colleges for inclusion. All submissions enter a "Pending" state and are subject to manual verification by the Rate My Faculty administrative team. We reserve the right to verify, reject, or modify any institution name or website link to ensure database accuracy.
          </p>
        </section>

        <section>
          <h2>4. Disclaimer of Liability</h2>
          <p>
            Rate My Faculty acts as a neutral hosting provider. We do not verify the accuracy of user-generated ratings or reviews. Content represents the subjective opinions of individual students and does not reflect the views of the administration or the specific institutions listed. We are not liable for any professional impact resulting from data published on this platform.
          </p>
        </section>

        <section>
          <h2>5. Intellectual Property</h2>
          <p>
            The aesthetic design, "look and feel," custom typography, and the Champagne Gold branding are the exclusive property of Rate My Faculty. Reproduction or redistribution of this Material without express written consent is strictly prohibited.
          </p>
        </section>

        <footer style={{ borderTop: "1px solid #1a1a1a", paddingTop: "60px", textAlign: "center" }}>
          <p className="playfair" style={{ fontStyle: "italic", fontSize: "18px", color: "#333" }}>Transparency in Education.</p>
          <p style={{ fontSize: "11px", color: "#222", marginTop: "20px", letterSpacing: "1px" }}>© 2026 RATEMYFACULTY DIRECTORY</p>
        </footer>
      </main>

      {/* Floating Footer Nav */}
      <div style={{
        position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)",
        backgroundColor: "rgba(13, 13, 13, 0.9)", backdropFilter: "blur(20px)",
        border: "1px solid #1a1a1a", borderRadius: "2px", display: "flex", padding: "6px", gap: "4px", zIndex: 9999
      }}>
        <Link href="/" style={{ padding: "10px 24px", color: "#f0ede8", textDecoration: "none", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>Directory</Link>
        <Link href="/privacy" style={{ padding: "10px 24px", color: "#666", textDecoration: "none", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>Privacy</Link>
      </div>
    </div>
  )
}
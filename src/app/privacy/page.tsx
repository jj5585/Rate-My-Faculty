"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function PrivacyPage() {
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
        .policy-box {
          border: 1px solid #1a1a1a;
          padding: 32px;
          margin: 40px 0;
          background: rgba(255, 255, 255, 0.01);
          border-left: 3px solid #c8a96e;
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
          Exit Policy
        </Link>
      </nav>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "100px 32px" }}>
        
        <header style={{ marginBottom: "80px", textAlign: "center" }}>
          <span style={{ color: "#c8a96e", textTransform: "uppercase", letterSpacing: "3px", fontSize: "12px", fontWeight: 600 }}>
            Data Governance & Privacy
          </span>
          <h1 className="playfair" style={{ fontSize: "clamp(40px, 8vw, 64px)", fontWeight: 700, margin: "20px 0" }}>
            Privacy <span style={{ fontStyle: "italic" }}>Policy</span>
          </h1>
          <div style={{ width: "40px", height: "1px", background: "#c8a96e", margin: "0 auto 20px" }} />
          <p className="dmsans" style={{ fontSize: "14px", color: "#444" }}>Effective Date: April 4, 2026</p>
        </header>

        <section>
          <h2>1. Scope of Governance</h2>
          <p>
            This Privacy Policy describes our practices for the Rate My Faculty platform across all devices and technologies. By utilizing our directory, features, or Gossip Rooms, you consent to the collection and processing of information as outlined herein. This policy remains in effect even after the deactivation of your account.
          </p>
        </section>

        <div className="policy-box">
          <h3 className="dmsans" style={{ fontSize: "12px", fontWeight: 700, color: "#c8a96e", letterSpacing: "1px", marginBottom: "12px", textTransform: "uppercase" }}>
            Student Anonymity Commitment
          </h3>
          <p style={{ fontSize: "15px", color: "#666" }}>
            Rate My Faculty is built on the principle of student-led transparency. While we collect verification data to ensure the integrity of the platform, we do not disclose your personal identity to faculty members or institutions. Your contributions are attributed only to your chosen pseudonym.
          </p>
        </div>

        <section>
          <h2>2. Information Collection</h2>
          <p>We collect information in two distinct ways to maintain platform integrity:</p>
          <ul style={{ paddingLeft: "20px", marginTop: "20px" }}>
            <li style={{ marginBottom: "12px" }}><strong style={{ color: "#c8a96e" }}>Voluntary Submissions:</strong> Information provided during registration via Google OAuth, including your name and email address, and any content you post in reviews or gossip rooms.</li>
            <li style={{ marginBottom: "12px" }}><strong style={{ color: "#c8a96e" }}>Automated Tracking:</strong> We utilize cookies, web beacons, and unique Device Identifiers to monitor traffic patterns, prevent "spamming" of ratings, and tailor the editorial experience to your specific institution.</li>
          </ul>
        </section>

        <section>
          <h2>3. Utilization of Data</h2>
          <p>
            Your information is used to administer your account, verify your eligibility to rate faculty at specific colleges, and customize the content recommendations you see. We also use aggregated, de-identified data to prepare statistical reports on faculty performance across the national directory.
          </p>
        </section>

        <section>
          <h2>4. Third-Party Disclosures</h2>
          <p>
            We do not sell your personal Information to third-party marketers. Disclosure only occurs in limited circumstances: to comply with legal process, to protect the safety of our users, or in the event of a business transition such as a merger. We may share de-identified information with "Operational Service Providers" who assist in site maintenance and security.
          </p>
        </section>

        <section>
          <h2>5. Rights & Choices</h2>
          <p>
            You may review, update, or delete your account information at any time by logging into your dashboard. Residents of California and other specific jurisdictions may have additional rights regarding the "Right to Know" and the "Right to Delete" their personal data. We honor opt-out requests for tracking technologies as described in our cookie management settings.
          </p>
        </section>

        <section>
          <h2>6. Protection of Information</h2>
          <p>
            We maintain commercially reasonable safeguards to protect your data. However, as no internet transmission is 100% secure, you acknowledge that you provide your information at your own risk. We specifically advise users to be cautious when disclosing personal details in public community venues within the site.
          </p>
        </section>

        <footer style={{ borderTop: "1px solid #1a1a1a", paddingTop: "60px", textAlign: "center" }}>
          <p className="playfair" style={{ fontStyle: "italic", fontSize: "18px", color: "#333" }}>Integrity in Education.</p>
          <div style={{ marginTop: "30px" }}>
            <p style={{ fontSize: "11px", color: "#222", letterSpacing: "1px" }}>© 2026 RATEMYFACULTY DIRECTORY</p>
            <p style={{ fontSize: "11px", color: "#222", marginTop: "8px" }}>Chennai, India</p>
          </div>
        </footer>
      </main>

      {/* Floating Nav */}
      <div style={{
        position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)",
        backgroundColor: "rgba(13, 13, 13, 0.9)", backdropFilter: "blur(20px)",
        border: "1px solid #1a1a1a", borderRadius: "2px", display: "flex", padding: "6px", gap: "4px", zIndex: 9999
      }}>
        <Link href="/" style={{ padding: "10px 24px", color: "#666", textDecoration: "none", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>Directory</Link>
        <Link href="/terms" style={{ padding: "10px 24px", color: "#f0ede8", textDecoration: "none", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>Terms</Link>
      </div>
    </div>
  )
}
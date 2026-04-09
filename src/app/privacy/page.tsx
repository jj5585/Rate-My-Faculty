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
      paddingBottom: "120px",
      position: "relative"
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        .playfair { font-family: 'Playfair Display', serif !important; }
        .dmsans { font-family: 'DM Sans', sans-serif !important; }
        
        section { margin-bottom: 80px; }
        h2 { 
          font-family: 'Playfair Display', serif; 
          font-size: 32px; 
          font-weight: 700; 
          margin-bottom: 28px; 
          color: #f0ede8;
          font-style: italic;
          border-bottom: 1px solid #1a1a1a;
          padding-bottom: 15px;
        }
        p, li { 
          font-size: 15px; 
          line-height: 1.9; 
          color: #999; 
          font-weight: 300;
          text-align: justify;
        }
        strong { color: #c8a96e; font-weight: 600; }
        
        .statutory-card {
          border: 1px solid #1a1a1a;
          padding: 40px;
          margin: 50px 0;
          background: rgba(200, 169, 110, 0.01);
          border-left: 4px solid #c8a96e;
        }

        .legal-header {
            text-transform: uppercase;
            letter-spacing: 4px;
            font-size: 10px;
            color: #c8a96e;
            font-weight: 700;
            margin-bottom: 15px;
            display: block;
        }
      `}} />

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: "rgba(8,8,8,0.98)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #1a1a1a",
        padding: "0 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "80px",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span className="playfair" style={{ fontSize: "20px", fontWeight: 700, color: "#f0ede8" }}>
            Rate<span style={{ color: "#c8a96e" }}>My</span>Faculty
          </span>
        </Link>
        <Link href="/" style={{ 
          fontSize: "11px", fontWeight: 700, color: "#c8a96e", 
          textDecoration: "none", letterSpacing: "2px", textTransform: "uppercase" 
        }}>
          Close Document
        </Link>
      </nav>

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "100px 40px" }}>
        
        <header style={{ marginBottom: "100px", textAlign: "center" }}>
          <span className="legal-header">Digital Data Protection Directive</span>
          <h1 className="playfair" style={{ fontSize: "clamp(48px, 10vw, 72px)", fontWeight: 700, margin: "24px 0" }}>
            Privacy <span style={{ fontStyle: "italic" }}>Jurisdiction</span>
          </h1>
          <div style={{ width: "60px", height: "1px", background: "#c8a96e", margin: "0 auto 30px" }} />
          <p className="dmsans" style={{ fontSize: "13px", color: "#444", letterSpacing: "1px" }}>
            STATUTORY COMPLIANCE VERSION 2.0.1 — EFFECTIVE APRIL 5, 2026
          </p>
        </header>

        <section>
          <h2>1. Preamble and Scope of Applicability</h2>
          <p>
            This Privacy Policy (the "Policy") constitutes a comprehensive legal instrument governing the collection, processing, storage, and dissemination of personal data within the <strong>Rate My Faculty</strong> ecosystem (the "Platform"). 
          </p>
          <p>
            Operated as a centralized faculty directory and student-peer review repository, the Platform is committed to the principles of <strong>Data Minimization</strong> and <strong>Purpose Limitation</strong> as mandated by the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>Information Technology Act, 2000</strong>. By accessing this Platform, you (the "Data Principal") grant explicit and informed consent to the processing of your data as delineated herein.
          </p>
        </section>

        <section>
          <h2>2. Taxonomy of Collected Personal Data</h2>
          <p>
            The Platform shall only requisition information essential for the verification of institutional eligibility and the prevention of fraudulent activity. The categories of data processed include:
          </p>
          <ul style={{ paddingLeft: "20px", marginTop: "20px" }}>
            <li style={{ marginBottom: "20px" }}>
                <strong>Verified Identity Identifiers:</strong> Upon authentication via Google OAuth, the Platform harvests the Data Principal's primary email address (<strong>joeljoby999@gmail.com</strong>), nomenclature, and profile metadata.
            </li>
            <li style={{ marginBottom: "20px" }}>
                <strong>Technical and Telemetry Metadata:</strong> The Platform automatically logs IP addresses, Device Identifiers, browser architecture, and time-stamp logs to maintain the integrity of our Rating Engine and deter "Sybil Attacks."
            </li>
          </ul>
        </section>

        <section className="statutory-card">
          <h3 className="legal-header">Inherent Anonymity Protections</h3>
          <p style={{ fontSize: "16px", color: "#666", fontStyle: "italic" }}>
            The Platform operates under a "Pseudo-Anonymous" architectural framework. No Faculty Member or Institutional Administrator shall be granted access to the specific identity of a Data Principal in connection with a specific review, except as mandated by a valid Judicial Writ from a competent Indian Court of Law.
          </p>
        </section>

        <section>
          <h2>3. Statutory Rights of the Data Principal</h2>
          <p>
            Pursuant to the <strong>DPDP Act, 2023</strong>, the Data Principal is entitled to the following non-derogable rights:
          </p>
          <ul style={{ paddingLeft: "20px", marginTop: "20px" }}>
            <li style={{ marginBottom: "15px" }}><strong>Right of Access and Summary:</strong> You may petition the Platform for a summary of all personal data processed.</li>
            <li style={{ marginBottom: "15px" }}><strong>Right to Rectification and Erasure:</strong> You possess the absolute right to request the permanent deletion of your profile.</li>
            <li style={{ marginBottom: "15px" }}><strong>Right of Grievance Redressal:</strong> You may register a formal complaint regarding data mishandling with our Resident Grievance Officer.</li>
          </ul>
        </section>

        <section>
          <h2>4. Intermediary Compliance and Safe Harbor</h2>
          <p>
            The Platform is categorized as an <strong>"Intermediary"</strong> as defined under <strong>Section 2(1)(w) of the Information Technology Act, 2000</strong>. Consequently, the Platform claims "Safe Harbor" protection under <strong>Section 79</strong> of the said Act. Access to content deemed defamatory or harmful shall be disabled within thirty-six (36) hours of receiving a valid Government Directive.
          </p>
        </section>

        <section className="statutory-card">
          <h3 className="legal-header">Grievance Redressal Officer</h3>
          <p style={{ color: "#f0ede8", marginBottom: "20px" }}>
            Per the requirements of the IT (Intermediary Guidelines) Rules, 2021, any legal service, data inquiry, or takedown request must be formally submitted to:
          </p>
          <div style={{ paddingLeft: "20px", borderLeft: "1px solid #333" }}>
            <p style={{ margin: "5px 0" }}><strong>Resident Grievance Officer:</strong> Joel Joby</p>
            <p style={{ margin: "5px 0" }}><strong>Official Correspondence:</strong> zteeel@gmail.com</p>
          </div>
          <p style={{ fontSize: "11px", marginTop: "20px" }}>
            The Grievance Officer shall acknowledge receipt within 24 hours and provide a definitive resolution within fifteen (15) working days.
          </p>
        </section>

        <footer style={{ borderTop: "1px solid #1a1a1a", paddingTop: "60px", textAlign: "center" }}>
          <p className="playfair" style={{ fontStyle: "italic", fontSize: "18px", color: "#333" }}>Lex Data Veritas.</p>
          <div style={{ marginTop: "40px" }}>
            <p style={{ fontSize: "11px", color: "#222", letterSpacing: "2px", textTransform: "uppercase" }}>© 2026 RATEMYFACULTY DIRECTORY & CO.</p>
            <p style={{ fontSize: "11px", color: "#222", marginTop: "10px" }}>Authorized and Regulated in India</p>
          </div>
        </footer>
      </main>

      {/* Floating Footer Nav */}
      <div style={{
        position: "fixed", bottom: "40px", left: "50%", transform: "translateX(-50%)",
        backgroundColor: "rgba(13, 13, 13, 0.95)", backdropFilter: "blur(20px)",
        border: "1px solid #1a1a1a", borderRadius: "2px", display: "flex", padding: "8px", gap: "4px", zIndex: 9999
      }}>
        <Link href="/" style={{ padding: "10px 32px", color: "#666", textDecoration: "none", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>Directory</Link>
        <Link href="/terms" style={{ padding: "10px 32px", color: "#f0ede8", textDecoration: "none", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>Terms</Link>
      </div>
    </div>
  )
}
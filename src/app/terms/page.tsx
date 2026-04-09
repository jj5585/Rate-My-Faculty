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
          font-size: 24px; 
          font-weight: 700; 
          margin-bottom: 20px; 
          color: #f0ede8;
          font-style: italic;
        }
        h3 {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #c8a96e;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 28px;
          margin-bottom: 12px;
        }
        p, li { 
          font-size: 15px; 
          line-height: 1.85; 
          color: #888; 
          font-weight: 300;
          margin-bottom: 14px;
        }
        li { margin-bottom: 10px; }
        ul { padding-left: 0; list-style-type: none; }
        .uppercase-block {
          font-size: 13px;
          font-weight: 600;
          color: #666;
          line-height: 1.7;
          letter-spacing: 0.2px;
        }
        .gold-box {
          border-left: 2px solid #c8a96e;
          padding-left: 32px;
          margin: 40px 0;
          background: rgba(200, 169, 110, 0.02);
          padding-top: 20px;
          padding-bottom: 20px;
          padding-right: 20px;
        }
        .section-divider {
          width: 100%;
          height: 1px;
          background: #111;
          margin-bottom: 60px;
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
            Terms of <span style={{ fontStyle: "italic" }}>Use</span>
          </h1>
          <div style={{ width: "40px", height: "1px", background: "#c8a96e", margin: "0 auto 20px" }} />
          <p className="dmsans" style={{ fontSize: "14px", color: "#444", marginBottom: "6px" }}>Effective Date: July 1, 2026</p>
          <p className="dmsans" style={{ fontSize: "14px", color: "#333" }}>
            <a href="https://www.ratemyfaculty.in" style={{ color: "#c8a96e", textDecoration: "none" }}>www.ratemyfaculty.in</a>
          </p>
        </header>

        {/* Arbitration Notice */}
        <div className="gold-box" style={{ marginBottom: "60px" }}>
          <h3 style={{ marginTop: 0 }}>Arbitration &amp; Class Action Notice</h3>
          <p className="uppercase-block">
            THESE TERMS CONTAIN A BINDING ARBITRATION CLAUSE AND A CLASS ACTION WAIVER. BY USING THIS PLATFORM, YOU AGREE THAT DISPUTES WILL BE RESOLVED BY BINDING, INDIVIDUAL ARBITRATION IN ACCORDANCE WITH THE ARBITRATION AND CONCILIATION ACT, 1996 (INDIA), AND YOU WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.
          </p>
        </div>

        {/* Preamble */}
        <section>
          <h2>Preamble</h2>
          <p>
            These Terms of Use ("Terms", "Agreement") constitute a legally binding contract between you ("User", "you", "your") and Rate My Faculty (operated by Joel Joby, an individual proprietor) ("Company", "we", "us", "our"), governing your access to and use of the Rate My Faculty platform, including its website, mobile applications, progressive web application, APIs, and all associated services (collectively, the "Platform"). By accessing or using the Platform in any manner, you represent that you have read, understood, and unconditionally agree to be bound by these Terms in their entirety.
          </p>
          <div className="gold-box">
            <p className="uppercase-block" style={{ marginBottom: 0 }}>
              IF YOU DO NOT AGREE TO THESE TERMS IN THEIR ENTIRETY, YOU MUST IMMEDIATELY CEASE ALL ACCESS TO AND USE OF THE PLATFORM. YOUR CONTINUED USE OF THE PLATFORM FOLLOWING THE POSTING OF ANY AMENDMENTS CONSTITUTES YOUR BINDING ACCEPTANCE OF SUCH AMENDMENTS.
            </p>
          </div>
          <p>
            These Terms must be read in conjunction with our Privacy Policy, which is incorporated herein by reference and forms an integral part of this Agreement. In the event of any conflict between these Terms and the Privacy Policy, these Terms shall prevail to the extent of such conflict, unless expressly stated otherwise.
          </p>
        </section>

        <div className="section-divider" />

        {/* Section 1 */}
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>1.1</strong> By accessing the Platform, creating an account, submitting any content, or otherwise using any feature of the Platform, you acknowledge that you have attained the age of majority in your applicable jurisdiction and that you are entering into this Agreement voluntarily and with full legal capacity to do so.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>1.2</strong> These Terms apply to all users of the Platform, including but not limited to: (a) registered account holders; (b) unregistered visitors who browse the Platform; (c) users who contribute User-Generated Content; (d) educational institutions, administrators, and faculty members whose profiles may be listed on the Platform; and (e) any third party who accesses the Platform through a registered user's credentials.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>1.3</strong> These Terms may be accepted electronically through any of the following means, each of which shall be deemed legally equivalent to a written signature: (a) clicking "I Agree," "Accept," "Sign Up," or any similar button or checkbox; (b) creating a user account; (c) submitting any content through the Platform; or (d) accessing or using the Platform after the posting of revised Terms.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>1.4</strong> The Company reserves the right to require you to re-affirm your acceptance of these Terms at any time, including in connection with updates, new features, or changes to the Company's legal obligations.
          </p>
        </section>

        <div className="section-divider" />

        {/* Section 2 */}
        <section>
          <h2>2. Eligibility</h2>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>2.1 General Eligibility.</strong> The Platform is intended for use by individuals who (a) are enrolled as students at, are employed by, or are otherwise affiliated with a post-secondary educational institution; (b) are at least 18 years of age or have attained the age of majority in their applicable jurisdiction, whichever is greater; and (c) have the legal authority to enter into binding agreements under applicable law.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>2.2 Minor Users.</strong> The Platform is not directed toward individuals under the age of 18 years. If you are under 18, you may not use the Platform under any circumstances. If the Company becomes aware that a minor has created an account or submitted content, the Company will immediately terminate such account and delete the associated content without notice.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>2.3 Institutional Affiliation.</strong> By creating an account and submitting a review, you represent that you have personal, direct knowledge of the faculty member or course you are reviewing, arising from a genuine educational relationship. Submitting reviews about faculty members with whom you have had no genuine academic interaction is a material breach of these Terms.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>2.4 Geographic Restrictions.</strong> While the Platform is accessible globally, users are responsible for ensuring that their use of the Platform complies with all applicable laws, rules, and regulations of their local jurisdiction. The Company makes no representation that the Platform or its content is lawful or appropriate for use in any particular jurisdiction outside India.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>2.5 Disqualification.</strong> You are ineligible to use the Platform if you have been previously banned or suspended by the Company, if you are a competitor of the Platform operating under a false identity, or if your use would violate any applicable court order, injunction, or regulatory directive.
          </p>
        </section>

        <div className="section-divider" />

        {/* Section 3 */}
        <section>
          <h2>3. User Accounts &amp; Responsibilities</h2>
          <h3>3.1 Account Creation</h3>
          <p>
            You may be required to register for an account to access certain features of the Platform. Account registration is currently facilitated through Google OAuth, and by registering, you authorize the Company to collect and process the information provided through such authentication mechanism, in accordance with the Privacy Policy. You agree to provide accurate, current, and complete information at the time of registration and to update such information promptly as required.
          </p>
          <h3>3.2 Account Security</h3>
          <p>
            You are solely responsible for maintaining the confidentiality and security of your account credentials. You agree to notify the Company immediately at <a href="mailto:zteeel@gmail.com" style={{ color: "#c8a96e", textDecoration: "none" }}>zteeel@gmail.com</a> upon discovery of any unauthorized access to or use of your account. The Company shall not be liable for any loss or damage arising from your failure to comply with this security obligation.
          </p>
          <h3>3.3 Anonymous Posting</h3>
          <p>
            The Platform permits users to submit reviews and certain other content without displaying their identity to other users or to the public ("Anonymous Posting"). Notwithstanding the anonymous nature of publicly displayed content, you acknowledge and agree that: (a) the Company retains internal records associating your account with all content you submit; (b) such records may be disclosed to competent courts, law enforcement authorities, or regulatory bodies in accordance with applicable law; (c) anonymity is a feature of the display interface and not a guarantee of legal protection; and (d) the Company may be compelled by a court of competent jurisdiction or a statutory authority to disclose your identity in connection with content you have submitted.
          </p>
          <p>
            By using Anonymous Posting, you explicitly accept that you bear full personal legal responsibility for all content you submit and that anonymity does not diminish, limit, or extinguish any legal liability you may incur.
          </p>
          <h3>3.4 Account Conduct</h3>
          <p>You agree that you will not: (a) share, sell, transfer, or otherwise permit any third party to access your account; (b) create multiple accounts for the purpose of evading a suspension or ban or inflating review ratings; (c) use automated means to create accounts, submit content, or interact with the Platform; or (d) impersonate any individual, institution, or authority in connection with your account.</p>
          <h3>3.5 Account Termination by User</h3>
          <p>
            You may request deletion of your account at any time by contacting <a href="mailto:zteeel@gmail.com" style={{ color: "#c8a96e", textDecoration: "none" }}>zteeel@gmail.com</a>. Upon deletion, your account profile will be deactivated. Notwithstanding the foregoing, content you have submitted may, at the Company's discretion, be retained in anonymized or aggregated form for the purposes of platform integrity, research, and historical record, subject to the Privacy Policy.
          </p>
        </section>

        <div className="section-divider" />

        {/* Section 4 */}
        <section>
          <h2>4. Platform Description</h2>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>4.1</strong> Rate My Faculty is an online platform that enables students and alumni of participating educational institutions in India and internationally to submit anonymous reviews and ratings of faculty members based on direct academic interactions. The Platform aggregates these reviews to generate composite ratings across defined assessment criteria, which are made publicly accessible.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>4.2</strong> The Platform currently supports the following features, which are subject to addition, modification, or removal at the Company's sole discretion: (a) anonymous faculty reviews across multiple rating dimensions; (b) a searchable faculty directory organized by institution; (c) a leaderboard of highest-rated faculty; (d) a Campus Feed for time-limited institutional announcements and discussion; (e) Gossip Rooms for anonymous, ephemeral peer communication; (f) an administrative dashboard for institutional administrators; and (g) student profiles and peer interaction features.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>4.3</strong> The Platform is provided as an informational and expressive forum. It does not constitute academic advice, institutional endorsement, or any form of official evaluation of any faculty member. The Company expressly disclaims any intent to be treated as an authoritative or definitive source of information regarding any educational institution or faculty member.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>4.4</strong> The Company may, from time to time, modify, expand, or discontinue any feature or aspect of the Platform without prior notice and shall not be liable to you or any third party for any such modification, suspension, or discontinuation.
          </p>
        </section>

        <div className="section-divider" />

        {/* Section 5 */}
        <section>
          <h2>5. User-Generated Content</h2>
          <h3>5.1 Definition</h3>
          <p>"User-Generated Content" or "UGC" means any text, ratings, comments, messages, posts, data, feedback, or any other content submitted, posted, uploaded, or otherwise transmitted by you to or through the Platform, including but not limited to faculty reviews, Campus Feed posts, Gossip Room messages, and profile information.</p>
          <h3>5.2 Ownership</h3>
          <p>Subject to the license granted below, you retain all ownership rights in original UGC that you create and submit. You represent and warrant that: (a) you are the sole author of all UGC you submit; (b) such UGC does not infringe, misappropriate, or violate any intellectual property rights, privacy rights, publicity rights, or any other rights of any third party; (c) such UGC is truthful to the best of your knowledge and is based on genuine personal experience; and (d) you have all necessary rights and authorizations to grant the license described herein.</p>
          <h3>5.3 License Grant to the Company</h3>
          <p>By submitting any UGC to the Platform, you hereby grant the Company a worldwide, perpetual, irrevocable, non-exclusive, royalty-free, fully sub-licensable, and fully transferable license to use, reproduce, modify, adapt, publish, translate, distribute, publicly display, publicly perform, and create derivative works from such UGC, in any media formats and through any media channels, for any purpose related to the operation, promotion, improvement, or commercialization of the Platform or the Company's business, without compensation to you.</p>
          <h3>5.4 Moderation Rights</h3>
          <p>The Company reserves the right, but does not assume the obligation, to: (a) review, moderate, edit, remove, refuse to publish, or disable access to any UGC at any time, for any reason or for no reason, with or without notice; (b) investigate any report of a policy violation and take appropriate action; (c) preserve UGC and associated metadata for compliance with legal obligations; and (d) disclose UGC to law enforcement authorities, courts, or regulatory bodies as required by applicable law.</p>
          <h3>5.5 Content Standards</h3>
          <p>You agree that all UGC you submit must be: (a) based on genuine, personal, firsthand academic experience with the faculty member or course reviewed; (b) truthful, accurate, and not intentionally misleading; (c) relevant to the academic performance, teaching style, accessibility, or professional conduct of the faculty member; and (d) free from personal attacks, abuse, discriminatory language, or content unrelated to the academic context.</p>
          <h3>5.6 Reporting Mechanism</h3>
          <p>The Platform provides a reporting mechanism through which users and affected parties may flag UGC that they believe violates these Terms, applicable law, or the rights of any individual. Upon receiving a report, the Company will conduct a good-faith review and take such action as it deems appropriate in its sole discretion. The Company is not obligated to take any particular action in response to a report.</p>
        </section>

        <div className="section-divider" />

        {/* Section 6 */}
        <section>
          <h2>6. Prohibited Uses</h2>
          <p>You agree that you will not, under any circumstances, use the Platform to:</p>
          <ul>
            {[
              "Submit false, fabricated, or deliberately misleading reviews or ratings of any faculty member, including reviews based on secondhand information or submitted as a result of harassment campaigns, coordinated rating manipulation, or personal vendettas unrelated to academic performance;",
              "Submit content that constitutes defamation, libel, slander, or malicious falsehood under applicable Indian law, including the Indian Penal Code, 1860 (as amended), and the Bharatiya Nyaya Sanhita, 2023;",
              "Disclose any personally identifiable information of any individual, including but not limited to contact information, home address, financial information, identification numbers, medical information, or any other information that could identify a private individual without their express consent;",
              "Submit content that is harassing, abusive, threatening, intimidating, discriminatory, or that targets any individual on the basis of race, caste, religion, national origin, gender, sexual orientation, disability, age, or any other protected characteristic;",
              "Submit content that violates any applicable data protection or privacy law, including the Digital Personal Data Protection Act, 2023 (India);",
              "Use the Platform to solicit, collect, or harvest personal data about other users or faculty members for any commercial or unauthorized purpose;",
              "Use automated tools, bots, scrapers, scripts, or any other means to access the Platform in a manner that circumvents access controls or places an unreasonable load on the Platform's infrastructure;",
              "Reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code, algorithms, or trade secrets of the Platform;",
              "Create a false impression of institutional affiliation, student status, or any other credential for the purpose of accessing the Platform or submitting content;",
              "Use the Platform to advertise or promote any commercial product, service, business, or website without the Company's express written consent;",
              "Engage in any activity that interferes with or disrupts the integrity, security, or performance of the Platform or the servers and networks connected to it;",
              "Submit content that constitutes or facilitates any criminal offense under applicable Indian law, including but not limited to the Information Technology Act, 2000, and its amendments;",
              "Attempt to gain unauthorized access to any portion of the Platform, other user accounts, or any related systems or networks; or",
              "Use the Platform for any purpose that violates applicable local, national, or international law, regulation, or treaty.",
            ].map((item, i) => (
              <li key={i} style={{ marginBottom: "12px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ color: "#c8a96e", flexShrink: 0, marginTop: "2px" }}>—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: "20px" }}>
            Violation of any of the foregoing prohibitions may result in immediate suspension or permanent termination of your account, removal of your UGC, and/or referral to competent law enforcement or regulatory authorities. The Company reserves the right to seek all available legal remedies for violations, including injunctive relief and monetary damages.
          </p>
        </section>

        <div className="section-divider" />

        {/* Section 7 */}
        <section>
          <h2>7. Intellectual Property Rights</h2>
          <h3>7.1 Company Intellectual Property</h3>
          <p>The Platform, including its design, layout, architecture, code, graphics, logos, trademarks, service marks, trade names, text, databases, software, and all other content and materials created by or for the Company (collectively, "Company IP"), is owned exclusively by the Company or its licensors and is protected by Indian and international intellectual property laws, including the Copyright Act, 1957, the Trade Marks Act, 1999, and applicable treaty obligations.</p>
          <h3>7.2 Restrictions on Use</h3>
          <p>No portion of the Company IP may be copied, reproduced, republished, uploaded, posted, publicly displayed, encoded, translated, transmitted, distributed, sold, licensed, or otherwise exploited for any purpose without the prior express written consent of the Company. Any unauthorized use of Company IP constitutes a material breach of these Terms and an infringement of the Company's intellectual property rights.</p>
          <h3>7.3 Feedback</h3>
          <p>If you provide the Company with any suggestions, ideas, feedback, or recommendations regarding the Platform ("Feedback"), you hereby assign to the Company all intellectual property rights in and to such Feedback, and the Company shall be free to use, implement, and commercialize such Feedback without any obligation of compensation, attribution, or confidentiality to you.</p>
          <h3>7.4 Third-Party Intellectual Property</h3>
          <p>The Platform may display or link to content, trademarks, logos, or other intellectual property belonging to third parties, including educational institutions. Such display does not constitute any affiliation with, endorsement by, or authorization from such third parties. If you believe your intellectual property rights have been infringed on the Platform, please contact <a href="mailto:zteeel@gmail.com" style={{ color: "#c8a96e", textDecoration: "none" }}>zteeel@gmail.com</a> with the subject line "IP Infringement Notice."</p>
        </section>

        <div className="section-divider" />

        {/* Section 8 */}
        <section>
          <h2>8. Privacy &amp; Data Protection</h2>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>8.1</strong> The collection, processing, storage, and use of your personal data by the Company is governed by the Company's <a href="/privacy" style={{ color: "#c8a96e", textDecoration: "none" }}>Privacy Policy</a>, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection and use of your personal data as described in the Privacy Policy.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>8.2</strong> The Platform operates in compliance with applicable Indian data protection law, including the Digital Personal Data Protection Act, 2023 ("DPDPA"). The Company acts as the Data Fiduciary with respect to personal data collected through the Platform and processes such data on the lawful bases described in the Privacy Policy.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>8.3</strong> Notwithstanding the anonymous display of reviews, the Company may collect and retain certain technical identifiers and log data, including IP addresses, device identifiers, and browser fingerprints, in association with submitted content. This information may be used to enforce these Terms, prevent abuse, and comply with legal obligations.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>8.4</strong> You have rights with respect to your personal data as specified under applicable law and as described in the Privacy Policy. To exercise such rights, please contact <a href="mailto:zteeel@gmail.com" style={{ color: "#c8a96e", textDecoration: "none" }}>zteeel@gmail.com</a>.
          </p>
        </section>

        <div className="section-divider" />

        {/* Section 9 */}
        <section>
          <h2>9. Monetization &amp; Advertising</h2>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>9.1</strong> The Company may generate revenue through advertising, sponsorships, institutional partnerships, subscription plans, and other monetization mechanisms. By using the Platform, you acknowledge and consent to the display of advertisements and sponsored content, which may be targeted based on your usage of the Platform.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>9.2</strong> The Company does not endorse any advertised product, service, or entity and shall not be liable for the accuracy, quality, or legality of any advertised content. Your interactions with any advertiser are solely between you and the advertiser.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>9.3</strong> Premium features, if and when introduced, shall be governed by supplemental terms published at the time of their introduction. Such supplemental terms will form part of this Agreement upon your acceptance thereof.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>9.4</strong> All fees, if any, are non-refundable unless expressly stated otherwise or required by applicable law. The Company reserves the right to modify its pricing and monetization model at any time, subject to providing reasonable advance notice.
          </p>
        </section>

        <div className="section-divider" />

        {/* Section 10 */}
        <section>
          <h2>10. Termination &amp; Suspension</h2>
          <h3>10.1 Termination by the Company</h3>
          <p>The Company reserves the right, in its sole and absolute discretion, to suspend, restrict, or permanently terminate your access to the Platform and/or your account, with or without notice and with or without cause, including but not limited to: (a) breach of any provision of these Terms; (b) submission of content that violates applicable law or the rights of any third party; (c) conduct the Company determines is harmful, offensive, or disruptive; (d) requests from law enforcement or regulatory authorities; (e) legal or regulatory compliance requirements; or (f) discontinuation of the Platform.</p>
          <h3>10.2 Effects of Termination</h3>
          <p>Upon termination of your account for any reason: (a) your right to access and use the Platform ceases immediately; (b) you remain bound by all provisions of these Terms that, by their nature, should survive termination, including Sections 5.3, 7, 11, 12, 13, 15, and 16; (c) the Company may, at its discretion, retain or delete your UGC; and (d) the Company may retain internal records of your account and activity for purposes of enforcement, legal compliance, and abuse prevention.</p>
          <h3>10.3 Appeals</h3>
          <p>If you believe your account has been suspended or terminated in error, you may contact <a href="mailto:zteeel@gmail.com" style={{ color: "#c8a96e", textDecoration: "none" }}>zteeel@gmail.com</a> with a detailed explanation. The Company's determination on any appeal shall be final and binding.</p>
        </section>

        <div className="section-divider" />

        {/* Section 11 */}
        <section>
          <h2>11. Disclaimers &amp; No Warranties</h2>
          <div className="gold-box">
            <p className="uppercase-block">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, COMPLETENESS, OR UNINTERRUPTED OR ERROR-FREE OPERATION.
            </p>
            <p className="uppercase-block" style={{ marginTop: "16px" }}>
              THE COMPANY DOES NOT WARRANT THAT: (a) THE PLATFORM WILL MEET YOUR REQUIREMENTS OR EXPECTATIONS; (b) THE PLATFORM WILL BE AVAILABLE AT ALL TIMES, UNINTERRUPTED, TIMELY, SECURE, OR FREE FROM ERRORS, VIRUSES, OR OTHER HARMFUL COMPONENTS; (c) ANY DEFECTS WILL BE CORRECTED; (d) ANY REVIEWS, RATINGS, OR OTHER CONTENT ARE ACCURATE, COMPLETE, TRUTHFUL, OR RELIABLE; OR (e) ANY RESULTS OBTAINED FROM USE OF THE PLATFORM WILL BE ACCURATE OR RELIABLE.
            </p>
          </div>
          <p>
            The Company expressly disclaims any and all liability arising from or related to: (a) the content of user-generated reviews, which are the sole opinions of individual users; (b) any employment or academic consequences experienced by any faculty member or institution as a result of content published on the Platform; (c) your reliance on any content or information published on the Platform; or (d) interactions between users of the Platform.
          </p>
          <p>The Company makes no representation that any content on the Platform has been independently verified, fact-checked, or corroborated. The accuracy of content is the sole responsibility of the user who submitted it.</p>
        </section>

        <div className="section-divider" />

        {/* Section 12 */}
        <section>
          <h2>12. Limitation of Liability</h2>
          <div className="gold-box">
            <p className="uppercase-block">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE COMPANY, ITS OPERATORS, OFFICERS, DIRECTORS, EMPLOYEES, AFFILIATES, CONTRACTORS, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, REVENUE, DATA, GOODWILL, USE, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR YOUR USE OF OR INABILITY TO USE THE PLATFORM.
            </p>
            <p className="uppercase-block" style={{ marginTop: "16px" }}>
              THE COMPANY'S TOTAL CUMULATIVE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE GREATER OF: (a) THE TOTAL AMOUNT, IF ANY, PAID BY YOU TO THE COMPANY IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE CLAIM; OR (b) ONE THOUSAND INDIAN RUPEES (INR 1,000).
            </p>
          </div>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>12.3</strong> These limitations shall apply even if any limited remedy set forth in these Terms is found to have failed of its essential purpose. Some jurisdictions do not allow the exclusion or limitation of certain warranties or liability, so some of the above limitations may not apply to you.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>12.4</strong> The Company shall not be liable for any delay or failure to perform its obligations under these Terms resulting from causes beyond its reasonable control, including but not limited to acts of God, governmental actions, natural disasters, power outages, internet failures, or cyberattacks ("Force Majeure").
          </p>
        </section>

        <div className="section-divider" />

        {/* Section 13 */}
        <section>
          <h2>13. Indemnification</h2>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>13.1</strong> To the maximum extent permitted by applicable law, you agree to defend, indemnify, and hold harmless the Company and its operators, officers, employees, contractors, agents, successors, and assigns from and against any and all claims, actions, demands, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) your access to or use of the Platform; (b) any UGC you submit, post, or transmit through the Platform; (c) your violation of any provision of these Terms; (d) your violation of any applicable law or regulation; (e) your infringement of any intellectual property, privacy, or other rights of any third party; or (f) any claim by a third party that your UGC has caused harm, including defamation claims by faculty members.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>13.2</strong> The Company reserves the right, at its own expense, to assume exclusive control of any matter otherwise subject to indemnification by you, in which case you agree to cooperate fully with the Company's defense of such matter.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>13.3</strong> You agree to notify the Company promptly upon becoming aware of any claim or threatened claim for which indemnification may be sought under this Section, and to provide such cooperation and assistance as the Company may reasonably request.
          </p>
        </section>

        <div className="section-divider" />

        {/* Section 14 */}
        <section>
          <h2>14. Third-Party Links &amp; Services</h2>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>14.1</strong> The Platform may contain hyperlinks to third-party websites, applications, and services that are not owned, operated, or controlled by the Company. Such links are provided for convenience only and do not constitute an endorsement of, affiliation with, or responsibility for the content, accuracy, privacy practices, or terms of any third-party service.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>14.2</strong> Your access to and use of any third-party service is entirely at your own risk and subject to the terms and conditions and privacy policies of such third-party service. The Company shall have no liability whatsoever in connection with your use of or reliance on any third-party service.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>14.3</strong> The Platform may integrate third-party authentication services (e.g., Google OAuth), analytics tools, and infrastructure providers. Your use of such integrated services is subject to the respective terms and privacy policies of those providers.
          </p>
        </section>

        <div className="section-divider" />

        {/* Section 15 */}
        <section>
          <h2>15. Dispute Resolution</h2>
          <h3>15.1 Mandatory Pre-Dispute Mediation</h3>
          <p>Before initiating any arbitration or legal proceeding against the Company, you agree to first notify the Company in writing of your dispute by sending a detailed description of your claim to <a href="mailto:zteeel@gmail.com" style={{ color: "#c8a96e", textDecoration: "none" }}>zteeel@gmail.com</a> with the subject line "Legal Notice." The Company and you shall negotiate in good faith for a period of thirty (30) days from the date of receipt of such notice ("Resolution Period"). Neither party shall initiate any formal proceeding until the Resolution Period has expired without resolution, unless immediate relief is required to prevent irreparable harm.</p>
          <h3>15.2 Binding Arbitration</h3>
          <p>If a dispute is not resolved within the Resolution Period, it shall be finally and exclusively resolved by binding arbitration in accordance with the Arbitration and Conciliation Act, 1996 (India), as amended. The arbitration shall be conducted before a sole arbitrator mutually agreed upon by the parties, or, failing agreement within fifteen (15) days, appointed by the relevant authority under the Act. The seat and venue of arbitration shall be Chennai, Tamil Nadu, India. The arbitration proceedings shall be conducted in the English language. The arbitrator's award shall be final, binding, and enforceable in any court of competent jurisdiction.</p>
          <h3>15.3 Class Action Waiver</h3>
          <div className="gold-box">
            <p className="uppercase-block" style={{ marginBottom: 0 }}>
              YOU AND THE COMPANY EACH AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS, WHETHER IN ARBITRATION OR OTHERWISE, SHALL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN ANY CLASS, CONSOLIDATED, MASS, OR REPRESENTATIVE ACTION. YOU EXPRESSLY WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION AGAINST THE COMPANY.
            </p>
          </div>
          <h3>15.4 Injunctive Relief</h3>
          <p>Notwithstanding the foregoing arbitration agreement, either party may seek emergency injunctive or other provisional relief from a court of competent jurisdiction in the courts of Chennai, Tamil Nadu, India where such relief is necessary to prevent irreparable harm, including but not limited to unauthorized use of intellectual property or breach of confidentiality obligations.</p>
          <h3>15.5 Limitation Period</h3>
          <p>Any claim arising out of or related to these Terms or your use of the Platform must be brought within one (1) year of the date on which the claim arose, after which such claim shall be permanently barred, regardless of any statute of limitations to the contrary.</p>
        </section>

        <div className="section-divider" />

        {/* Section 16 */}
        <section>
          <h2>16. Governing Law &amp; Jurisdiction</h2>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>16.1</strong> These Terms and any dispute or claim arising out of or in connection with them or their subject matter or formation (including non-contractual disputes or claims) shall be governed by and construed in accordance with the laws of the Republic of India, without regard to its conflict of laws principles.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>16.2</strong> Subject to the arbitration provisions in Section 15, any dispute that is excluded from arbitration or for which court proceedings are permissible shall be submitted to the exclusive jurisdiction of the courts of Chennai, Tamil Nadu, India. You hereby irrevocably waive any objection to the laying of venue in such courts and any claim that any proceedings brought in such courts have been brought in an inconvenient forum.
          </p>
        </section>

        <div className="section-divider" />

        {/* Section 17 */}
        <section>
          <h2>17. Changes to These Terms</h2>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>17.1</strong> The Company reserves the right to modify, amend, or update these Terms at any time in its sole discretion. When material changes are made, the Company will provide notice by posting the revised Terms on the Platform and updating the "Effective Date" at the top of this document. Where required by applicable law, additional notice (such as via email) will be provided.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>17.2</strong> Your continued use of the Platform after the posting of revised Terms constitutes your unconditional acceptance of the revised Terms. If you do not agree with any revised Terms, you must immediately cease using the Platform and request deletion of your account.
          </p>
          <p>
            <strong style={{ color: "#aaa", fontWeight: 500 }}>17.3</strong> The Company may also modify the Platform, its features, its monetization model, or its content policies at any time without specific notice to you, and such modifications shall be governed by the then-current version of these Terms.
          </p>
        </section>

        <div className="section-divider" />

        {/* Section 18 */}
        <section>
          <h2>18. General Provisions</h2>
          <h3>18.1 Entire Agreement</h3>
          <p>These Terms, together with the Privacy Policy and any supplemental terms applicable to specific features or services, constitute the entire agreement between you and the Company with respect to the subject matter hereof, and supersede all prior or contemporaneous agreements, representations, warranties, and understandings, whether written or oral.</p>
          <h3>18.2 Severability</h3>
          <p>If any provision of these Terms is held by a court or arbitrator of competent jurisdiction to be invalid, illegal, or unenforceable, such provision shall be modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall continue in full force and effect.</p>
          <h3>18.3 Waiver</h3>
          <p>No failure or delay by the Company in exercising any right under these Terms shall constitute a waiver of that right. No single or partial exercise of any right shall preclude the further exercise of that right or any other right.</p>
          <h3>18.4 Assignment</h3>
          <p>You may not assign, transfer, or delegate any of your rights or obligations under these Terms without the prior written consent of the Company. The Company may freely assign these Terms or any of its rights or obligations hereunder to any affiliate, successor, or acquirer without restriction.</p>
          <h3>18.5 Relationship of the Parties</h3>
          <p>Nothing in these Terms shall be construed to create any partnership, joint venture, employment, franchise, or agency relationship between you and the Company. You and the Company are independent parties.</p>
          <h3>18.6 Language</h3>
          <p>These Terms are written in English, and the English version shall govern in the event of any conflict with any translation.</p>
        </section>

        <div className="section-divider" />

        {/* Section 19 */}
        <section>
          <h2>19. Contact Information</h2>
          <p>For any questions, concerns, legal notices, or requests relating to these Terms or the Platform, please contact:</p>
          <div className="gold-box">
            <p style={{ marginBottom: "8px", color: "#f0ede8", fontWeight: 500 }}>Rate My Faculty — Legal &amp; Compliance</p>
            <p style={{ marginBottom: "6px" }}>
              Email: <a href="mailto:zteeel@gmail.com" style={{ color: "#c8a96e", textDecoration: "none" }}>zteeel@gmail.com

              </a>
            </p>
            <p style={{ marginBottom: "6px" }}>
              Website: <a href="https://rate-my-faculty.vercel.app/" style={{ color: "#c8a96e", textDecoration: "none" }}>www.ratemyfaculty.in</a>
            </p>
          </div>
          <p>For urgent legal matters, including court summons, data subject access requests, and copyright infringement notices, please use the above email with an appropriately descriptive subject line. The Company aims to respond to all formal legal correspondence within fourteen (14) business days.</p>
        </section>

        <footer style={{ borderTop: "1px solid #1a1a1a", paddingTop: "60px", textAlign: "center" }}>
          <p className="playfair" style={{ fontStyle: "italic", fontSize: "18px", color: "#333" }}>Transparency in Education.</p>
          <p style={{ fontSize: "11px", color: "#222", marginTop: "20px", letterSpacing: "1px" }}>© 2026 RATEMYFACULTY DIRECTORY. ALL RIGHTS RESERVED.</p>
          <p style={{ fontSize: "11px", color: "#1a1a1a", marginTop: "8px", letterSpacing: "0.5px" }}>This document was prepared for informational purposes and should be reviewed by a qualified legal professional before publication.</p>
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
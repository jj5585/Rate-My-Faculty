import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import RatingReportButton from "@/components/RatingReportButton";

// On-demand revalidation to ensure ratings update
export const revalidate = 0;

export default async function FacultyProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const faculty = await prisma.faculty.findUnique({
    where: { id },
    include: { 
      ratings: { orderBy: { createdAt: "desc" } },
      college: true
    },
  });

  if (!faculty) return notFound();

  const totalReviews = faculty.ratings.length;

  const getAvg = (key: string) => {
    if (totalReviews === 0) return "0.0";
    const sum = faculty.ratings.reduce((acc: any, r: any) => {
      const val = r[key] || 0;
      // Invert partiality so 1 is bad and 5 is good for the average
      return acc + (key === 'partiality' ? (6 - val) : val);
    }, 0);
    return (sum / totalReviews).toFixed(1);
  };

  const metrics = [
    { label: "Teaching Clarity", key: "teachingClarity" },
    { label: "Approachability", key: "approachability" },
    { label: "Grading Fairness", key: "gradingFairness" },
    { label: "Punctuality", key: "punctuality" },
    { label: "Non-Partiality", key: "partiality" },
    { label: "Behaviour", key: "behaviour" },
  ];

  const overallAvg =
    totalReviews === 0
      ? null
      : (
          metrics.reduce((sum, m) => sum + parseFloat(getAvg(m.key)), 0) /
          metrics.length
        ).toFixed(1);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#080808",
      color: "#f0ede8",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        .playfair { font-family: 'Playfair Display', serif !important; }
        .dmsans { font-family: 'DM Sans', sans-serif !important; }
        
        .metric-card {
          background: #0d0d0d;
          border: 1px solid #1a1a1a;
          padding: 24px;
          transition: border-color 0.3s;
        }
        .metric-card:hover { border-color: #c8a96e; }

        .review-row {
          border-bottom: 1px solid #1a1a1a;
          padding: 40px 0;
        }
        
        .btn-gold {
          background: #c8a96e;
          color: #080808;
          border: none;
          padding: 14px 28px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 1px;
          cursor: pointer;
          border-radius: 2px;
          transition: all 0.2s;
          text-transform: uppercase;
          text-decoration: none;
          display: inline-block;
        }
        .btn-gold:hover { background: #d4b87a; transform: translateY(-1px); }

        .nav-island {
          position: sticky; top: 0; z-index: 100;
          background: rgba(8,8,8,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #1a1a1a;
          padding: 0 32px;
          height: 60px;
          display: flex; alignItems: center; justifyContent: space-between;
        }
      `}} />

      {/* Nav */}
      <nav className="nav-island">
        <Link href={faculty.collegeId ? `/colleges/${faculty.collegeId}` : "/"} style={{ color: "#c8a96e", textDecoration: "none", fontSize: "11px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
          ← {faculty.college?.name || "Directory"}
        </Link>
        <span className="playfair" style={{ fontSize: "16px", fontWeight: 700 }}>
          Rate<span style={{ color: "#c8a96e" }}>My</span>Faculty
        </span>
        <div style={{ width: "60px" }} /> {/* Spacer */}
      </nav>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 32px" }}>
        
        {/* Profile Header */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <div style={{ 
            width: "80px", height: "80px", border: "1px solid #c8a96e", 
            borderRadius: "50%", margin: "0 auto 32px", display: "flex", 
            alignItems: "center", justifyContent: "center", fontSize: "32px",
            color: "#c8a96e", background: "rgba(200,169,110,0.03)"
          }} className="playfair">
            {faculty.name.charAt(0)}
          </div>
          
          <span style={{ color: "#555", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase" }}>Faculty Profile</span>
          <h1 className="playfair" style={{ fontSize: "clamp(32px, 5vw, 56px)", margin: "16px 0", fontWeight: 700 }}>
            {faculty.name}
          </h1>
          <p className="dmsans" style={{ color: "#888", fontSize: "16px", fontWeight: 300 }}>
            {faculty.designation} <span style={{ color: "#c8a96e", margin: "0 8px" }}>/</span> {faculty.department}
          </p>
          
          {overallAvg && (
            <div style={{ marginTop: "40px" }}>
              <span className="playfair" style={{ fontSize: "72px", fontWeight: 700, color: "#c8a96e" }}>{overallAvg}</span>
              <span style={{ color: "#333", fontSize: "20px", marginLeft: "12px" }}>out of 5.0</span>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "100px" }}>
          <Link href={`/rate/${faculty.id}`} className="btn-gold">
            Rate this Faculty
          </Link>
          <ShareButton name={faculty.name} avgRating={overallAvg} />
        </div>

        {/* Metrics Grid */}
        <div style={{ marginBottom: "100px" }}>
          <h2 className="playfair" style={{ fontSize: "24px", marginBottom: "32px", fontStyle: "italic" }}>Performance Metrics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1px", background: "#1a1a1a", border: "1px solid #1a1a1a" }}>
            {metrics.map((m) => (
              <div key={m.key} style={{ background: "#080808", padding: "32px" }}>
                <p style={{ color: "#555", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>{m.label}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span className="playfair" style={{ fontSize: "28px", color: "#f0ede8" }}>{getAvg(m.key)}</span>
                  <span style={{ color: "#222", fontSize: "12px" }}>/ 5.0</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div>
          <h2 className="playfair" style={{ fontSize: "24px", marginBottom: "12px", fontStyle: "italic" }}>Student Testimonials</h2>
          <p style={{ color: "#555", fontSize: "13px", marginBottom: "40px" }}>Chronological feedback from verified sessions.</p>

          {faculty.ratings.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", border: "1px dashed #1a1a1a" }}>
              <p className="playfair" style={{ color: "#333", fontSize: "18px" }}>No reviews recorded yet.</p>
            </div>
          ) : (
            faculty.ratings.map((r) => (
              <div key={r.id} className="review-row">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                  <span style={{ color: "#c8a96e", fontSize: "10px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Anonymous Review</span>
                  <span style={{ color: "#333", fontSize: "11px" }}>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                
                {r.review && (
                  <p className="playfair" style={{ fontSize: "20px", lineHeight: "1.6", color: "#f0ede8", marginBottom: "32px", fontWeight: 400 }}>
                    "{r.review}"
                  </p>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div style={{ display: "flex", gap: "24px" }}>
                      <div>
                        <p style={{ color: "#444", fontSize: "9px", textTransform: "uppercase", marginBottom: "4px" }}>Teaching</p>
                        <p style={{ fontSize: "13px", fontWeight: 600 }}>{r.teachingClarity}/5</p>
                      </div>
                      <div>
                        <p style={{ color: "#444", fontSize: "9px", textTransform: "uppercase", marginBottom: "4px" }}>Behaviour</p>
                        <p style={{ fontSize: "13px", fontWeight: 600 }}>{r.behaviour}/5</p>
                      </div>
                   </div>
                   <RatingReportButton ratingId={r.id} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer style={{ marginTop: "120px", borderTop: "1px solid #1a1a1a", padding: "40px 0", textAlign: "center" }}>
           <p style={{ color: "#333", fontSize: "11px", maxWidth: "400px", margin: "0 auto", lineHeight: "1.8" }}>
             Content represents subjective student experiences. We maintain a neutral stance and do not verify individual claims.
           </p>
        </footer>

      </main>
    </div>
  );
}
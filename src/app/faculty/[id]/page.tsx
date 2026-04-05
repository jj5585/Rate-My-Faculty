import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import RatingReportButton from "@/components/RatingReportButton";

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
      college: true,
    },
  });

  if (!faculty) return notFound();

  const totalReviews = faculty.ratings.length;

  const getAvg = (key: string) => {
    if (totalReviews === 0) return 0;
    const sum = faculty.ratings.reduce((acc: number, r: any) => acc + (r[key] || 0), 0);
    return sum / totalReviews;
  };

  const metrics = [
    { label: "Teaching", key: "teachingClarity" },
    { label: "Approachable", key: "approachability" },
    { label: "Fair Grading", key: "gradingFairness" },
    { label: "Punctual", key: "punctuality" },
    { label: "No Bias", key: "partiality" },
    { label: "Behaviour", key: "behaviour" },
  ];

  const overallAvg =
    totalReviews === 0
      ? null
      : metrics.reduce((sum, m) => sum + getAvg(m.key), 0) / metrics.length;

  const writtenReviews = faculty.ratings.filter((r) => r.review && r.review.trim().length > 0);

  // Color scale: red → orange → yellow → green
  function scoreColor(val: number) {
    if (val === 0) return { text: "#2a2a2a", bar: "#1a1a1a" };
    if (val >= 4.5) return { text: "#4ade80", bar: "#4ade80" };
    if (val >= 3.5) return { text: "#facc15", bar: "#facc15" };
    if (val >= 2.5) return { text: "#fb923c", bar: "#fb923c" };
    return { text: "#f87171", bar: "#f87171" };
  }

  const overall = overallAvg ?? 0;
  const overallColor = scoreColor(overall);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#080808",
      color: "#f0ede8",
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .playfair { font-family: 'Playfair Display', Georgia, serif !important; }
        .dmsans   { font-family: 'DM Sans', sans-serif !important; }

        /* Bar fill animation */
        @keyframes fillBar {
          from { width: 0%; }
          to   { width: var(--target-width); }
        }
        .bar-fill {
          animation: fillBar 0.7s ease forwards;
          animation-delay: var(--delay, 0s);
          width: 0%;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; }

        /* Sticky nav */
        .top-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(8,8,8,0.96);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #141414;
          height: 52px;
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 20px;
        }

        /* Metric row */
        .metric-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #111;
        }
        .metric-row:last-child { border-bottom: none; }

        .bar-track {
          flex: 1;
          height: 5px;
          background: #141414;
          border-radius: 3px;
          overflow: hidden;
        }

        /* Review card */
        .review-card {
          background: #0d0d0d;
          border: 1px solid #141414;
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 10px;
        }

        /* Rate button */
        .rate-btn {
          display: block;
          text-align: center;
          background: #f0ede8;
          color: #080808;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.5px;
          padding: 15px;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.15s;
        }
        .rate-btn:active { background: #d4d1cc; }

        /* Score badge */
        .score-badge {
          display: inline-flex;
          align-items: baseline;
          gap: 3px;
        }
      `}} />

      {/* ── TOP NAV ── */}
      <nav className="top-nav">
        <Link
          href={faculty.collegeId ? `/colleges/${faculty.collegeId}` : "/"}
          className="dmsans"
          style={{ fontSize: "13px", color: "#888", textDecoration: "none" }}
        >
          ← {faculty.college?.name || "Directory"}
        </Link>
        <span className="playfair" style={{ fontSize: "15px", fontWeight: 700 }}>
          Rate<span style={{ color: "#c8a96e" }}>My</span>Faculty
        </span>
        <div style={{ width: "60px" }} />
      </nav>

      {/* ── HERO — NAME + OVERALL SCORE ── */}
      <div className="fade-up" style={{
        padding: "28px 20px 24px",
        borderBottom: "1px solid #141414",
      }}>
        {/* Initial avatar */}
        <div style={{
          width: "52px", height: "52px", borderRadius: "10px",
          background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "16px",
        }}>
          <span className="playfair" style={{ fontSize: "24px", color: "#c8a96e", fontWeight: 700 }}>
            {faculty.name.charAt(0)}
          </span>
        </div>

        <h1 className="playfair" style={{
          fontSize: "clamp(22px, 6vw, 32px)",
          fontWeight: 900, letterSpacing: "-0.5px",
          lineHeight: 1.1, marginBottom: "6px",
        }}>
          {faculty.name}
        </h1>

        <p className="dmsans" style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>
          {[faculty.designation, faculty.department].filter(Boolean).join(" · ")}
        </p>

        {/* Overall score — BIG */}
        {overallAvg !== null ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
            <span className="playfair" style={{
              fontSize: "72px", fontWeight: 900, lineHeight: 1,
              color: overallColor.text,
            }}>
              {overall.toFixed(1)}
            </span>
            <div className="dmsans" style={{ paddingBottom: "8px" }}>
              <div style={{ fontSize: "13px", color: "#555", marginBottom: "2px" }}>out of 5.0</div>
              <div style={{ fontSize: "12px", color: "#444" }}>
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </div>
            </div>
          </div>
        ) : (
          <p className="dmsans" style={{ fontSize: "14px", color: "#444", fontStyle: "italic" }}>
            No ratings yet — be the first.
          </p>
        )}
      </div>

      {/* ── 6 METRICS — ALL VISIBLE AT ONCE ── */}
      <div style={{ padding: "20px 20px 0" }}>
        <p className="dmsans" style={{
          fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
          color: "#444", marginBottom: "12px",
        }}>
          Breakdown
        </p>
        <div style={{ background: "#0d0d0d", border: "1px solid #141414", borderRadius: "12px", padding: "4px 16px" }}>
          {metrics.map((m, i) => {
            const val = getAvg(m.key);
            const pct = (val / 5) * 100;
            const col = scoreColor(val);
            return (
              <div key={m.key} className="metric-row">
                {/* Label */}
                <span className="dmsans" style={{
                  fontSize: "13px", color: "#888", fontWeight: 500,
                  width: "90px", flexShrink: 0,
                }}>
                  {m.label}
                </span>

                {/* Bar */}
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      "--target-width": `${pct}%`,
                      "--delay": `${i * 0.08}s`,
                      height: "100%",
                      borderRadius: "3px",
                      background: col.bar,
                    } as React.CSSProperties}
                  />
                </div>

                {/* Score */}
                <span className="dmsans" style={{
                  fontSize: "15px", fontWeight: 700,
                  color: col.text, width: "32px",
                  textAlign: "right", flexShrink: 0,
                }}>
                  {totalReviews === 0 ? "—" : val.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RATE BUTTON ── */}
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href={`/rate/${faculty.id}`} className="rate-btn" style={{ flex: 1 }}>
            Rate This Faculty
          </Link>
          <ShareButton name={faculty.name} avgRating={overallAvg ? overall.toFixed(1) : null} />
        </div>
      </div>

      {/* ── WRITTEN REVIEWS ONLY ── */}
      <div style={{ padding: "0 20px 100px" }}>
        <p className="dmsans" style={{
          fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase",
          color: "#444", marginBottom: "14px",
        }}>
          Student Comments ({writtenReviews.length})
        </p>

        {writtenReviews.length === 0 ? (
          <div style={{
            border: "1px dashed #1a1a1a", borderRadius: "12px",
            padding: "40px 20px", textAlign: "center",
          }}>
            <p className="playfair" style={{ fontSize: "18px", color: "#2a2a2a", fontStyle: "italic" }}>
              No written comments yet.
            </p>
            <p className="dmsans" style={{ fontSize: "12px", color: "#333", marginTop: "8px" }}>
              Leave a review to help other students.
            </p>
          </div>
        ) : (
          writtenReviews.map((r) => {
            const reviewOverall = (
              (r.teachingClarity + r.approachability + r.gradingFairness +
               r.punctuality + r.partiality + r.behaviour) / 6
            );
            const rc = scoreColor(reviewOverall);
            return (
              <div key={r.id} className="review-card">
                {/* Top row: score + date */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div className="score-badge">
                    <span className="playfair" style={{ fontSize: "22px", fontWeight: 700, color: rc.text }}>
                      {reviewOverall.toFixed(1)}
                    </span>
                    <span className="dmsans" style={{ fontSize: "11px", color: "#333" }}>/5</span>
                  </div>
                  <span className="dmsans" style={{ fontSize: "11px", color: "#444" }}>
                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                </div>

                {/* The comment */}
                <p className="dmsans" style={{
                  fontSize: "14px", lineHeight: "1.65", color: "#ccc",
                  borderLeft: `2px solid ${rc.bar}`,
                  paddingLeft: "12px",
                }}>
                  {r.review}
                </p>

                {/* Footer */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #111",
                }}>
                  <span className="dmsans" style={{ fontSize: "10px", color: "#2a2a2a", letterSpacing: "1px", textTransform: "uppercase" }}>
                    Anonymous
                  </span>
                  <RatingReportButton ratingId={r.id} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── LEGAL FOOTER ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(8,8,8,0.97)", backdropFilter: "blur(12px)",
        borderTop: "1px solid #141414",
        padding: "10px 20px",
      }}>
        <p className="dmsans" style={{ fontSize: "9px", color: "#2a2a2a", textAlign: "center", lineHeight: "1.5" }}>
          Content represents user opinions. We do not verify claims.{" "}
          <Link href="/terms" style={{ color: "#3a3a3a", textDecoration: "underline" }}>Terms</Link>
          {" · "}
          <Link href="/privacy" style={{ color: "#3a3a3a", textDecoration: "underline" }}>Privacy</Link>
        </p>
      </div>
    </div>
  );
}
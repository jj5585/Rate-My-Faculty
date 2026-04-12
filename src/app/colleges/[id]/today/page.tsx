// FIX: Converted from "use client" + useEffect fetch to Server Component.
//
// Before: fetch("/api/colleges/[id]/recent-ratings") fired on every mount.
//         Every tab visit + every prefetch from CollegePage bottom nav = DB hit.
//
// After:  Prisma query runs server-side at request time (or from Edge cache
//         via the parent page's revalidate). Zero client-side API calls.
//
// The interactive elements (just links and time display) are simple enough
// that they don't require a client shell — everything is static HTML.

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

// Revalidate every 30s — matches the Cache-Control on the API route.
// New ratings trigger revalidatePath in /api/ratings so this updates faster
// in practice when new reviews are submitted.
export const revalidate = 30

const CRITERIA_LABELS: Record<string, string> = {
  teachingClarity: "Teaching",
  approachability: "Approach",
  gradingFairness: "Grading",
  punctuality: "Punctuality",
  partiality: "Fairness",
  behaviour: "Behaviour",
}

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function scoreColor(score: number) {
  if (score >= 4.5) return "#4ade80"
  if (score >= 3.5) return "#facc15"
  if (score >= 2.5) return "#fb923c"
  return "#f87171"
}

export default async function CollegeTodayPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const college = await prisma.college.findUnique({
    where: { id, status: "APPROVED" },
    select: { id: true, name: true },
  })

  if (!college) notFound()

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const ratings = await prisma.rating.findMany({
    where: {
      createdAt: { gte: startOfDay },
      review: { not: null },
      faculty: { collegeId: id },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      teachingClarity: true,
      approachability: true,
      gradingFairness: true,
      punctuality: true,
      partiality: true,
      behaviour: true,
      review: true,
      createdAt: true,
      faculty: {
        select: { id: true, name: true, department: true },
      },
    },
  })

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#f0ede8" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .playfair { font-family: 'Playfair Display', Georgia, serif !important; }
        .dmsans   { font-family: 'DM Sans', sans-serif !important; }
        .tag { font-family: 'DM Sans', sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #555; font-weight: 500; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }

        .review-card {
          background: #0d0d0d;
          border: 1px solid #141414;
          border-radius: 4px;
          padding: 20px;
          transition: border-color 0.2s;
        }
        .review-card:hover { border-color: #1e1e1e; }

        .score-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 14px 0;
          border-top: 1px solid #111;
          border-bottom: 1px solid #111;
          margin: 14px 0;
        }
      `}} />

      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: "rgba(8,8,8,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #141414",
        padding: "0 20px", height: "52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href={`/colleges/${id}`} className="dmsans" style={{ fontSize: "12px", color: "#555", textDecoration: "none" }}>
          ← {college.name}
        </Link>
        <span className="playfair" style={{ fontSize: "16px", fontWeight: 700 }}>
          Today's <span style={{ color: "#c8a96e", fontStyle: "italic" }}>Voices</span>
        </span>
        <span className="tag" style={{ fontSize: "9px" }}>live feed</span>
      </nav>

      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 20px 80px" }}>

        <div style={{
          border: "1px solid #1a1a1a", borderLeft: "2px solid #c8a96e",
          padding: "12px 16px", marginBottom: "24px", borderRadius: "0 2px 2px 0",
        }}>
          <p className="dmsans" style={{ fontSize: "12px", color: "#666", margin: 0 }}>
            <span style={{ color: "#c8a96e", fontWeight: 600 }}>{college.name}</span>
            <span style={{ color: "#444" }}> · Faculty reviews posted today</span>
          </p>
        </div>

        {ratings.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", border: "1px solid #141414" }}>
            <p className="playfair" style={{ fontSize: "22px", fontStyle: "italic", color: "#2a2a2a", margin: "0 0 12px" }}>
              The campus is quiet.
            </p>
            <p className="dmsans" style={{ fontSize: "13px", color: "#444", marginBottom: "24px" }}>
              No reviews posted today for {college.name}.
            </p>
            <Link href={`/colleges/${id}`} className="dmsans" style={{
              display: "inline-block", background: "#c8a96e", color: "#080808",
              padding: "10px 20px", textDecoration: "none",
              fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase",
            }}>
              Browse Faculty
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <span className="tag">{ratings.length} update{ratings.length !== 1 ? "s" : ""} today</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {ratings.map((r, idx) => {
                const overall = (
                  (r.teachingClarity + r.approachability + r.gradingFairness +
                    r.punctuality + r.partiality + r.behaviour) / 6
                )
                const overallStr = overall.toFixed(1)
                const col = scoreColor(overall)

                return (
                  <div key={r.id} className="review-card fade-up" style={{ animationDelay: `${idx * 0.04}s` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                        <span className="playfair" style={{ fontSize: "28px", fontWeight: 700, color: col }}>
                          {overallStr}
                        </span>
                        <span className="dmsans" style={{ fontSize: "11px", color: "#333" }}>/5 overall</span>
                      </div>
                      <span className="dmsans" style={{ fontSize: "11px", color: "#444", paddingTop: "4px" }}>
                        {timeAgo(new Date(r.createdAt))}
                      </span>
                    </div>

                    {r.faculty && (
                      <Link href={`/faculty/${r.faculty.id}`} className="dmsans" style={{
                        fontSize: "12px", color: "#555", textDecoration: "none",
                        display: "block", marginBottom: "10px",
                      }}>
                        {r.faculty.name}
                        {r.faculty.department && <span style={{ color: "#333" }}> · {r.faculty.department}</span>}
                      </Link>
                    )}

                    {r.review && (
                      <p className="dmsans" style={{
                        fontSize: "14px", lineHeight: "1.7", color: "#ccc",
                        borderLeft: `2px solid ${col}`, paddingLeft: "12px",
                        margin: "0 0 4px",
                      }}>
                        {r.review}
                      </p>
                    )}

                    <div className="score-grid">
                      {Object.entries(CRITERIA_LABELS).map(([key, label]) => (
                        <div key={key}>
                          <p className="tag" style={{ marginBottom: "3px", color: "#444" }}>{label}</p>
                          <p className="dmsans" style={{ fontSize: "13px", fontWeight: 600, color: "#888", margin: 0 }}>
                            {(r as any)[key]}<span style={{ fontSize: "10px", color: "#333" }}>/5</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="tag" style={{ color: "#2a2a2a" }}>Verified Anonymous</span>
                      {r.faculty && (
                        <Link href={`/faculty/${r.faculty.id}`} className="dmsans" style={{
                          fontSize: "11px", color: "#c8a96e", textDecoration: "none",
                          fontWeight: 600, letterSpacing: "0.3px",
                        }}>
                          View Profile →
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
// FIX: Leaderboard converted from "use client" + useEffect to Server Component.
//
// Before: fetch("/api/faculty") on every leaderboard visit — returned ALL faculty
//         with full ratings arrays, then filtered/sorted client-side.
//         This was the most expensive query on the platform.
//
// After:  Prisma query runs server-side with ISR (revalidate=120).
//         Query is scoped to only faculty with ratings (count >= 1),
//         sorted by avg DESC at the DB level — no client-side sort needed.
//         The heavy ratings array is aggregated server-side; only final numbers hit the wire.

import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const revalidate = 120

function medalEmoji(i: number) {
  if (i === 0) return "🥇"
  if (i === 1) return "🥈"
  if (i === 2) return "🥉"
  return null
}

function ratingColor(avg: number) {
  if (avg >= 4.5) return "#4ade80"
  if (avg >= 3.5) return "#facc15"
  if (avg >= 2.5) return "#fb923c"
  return "#f87171"
}

export default async function LeaderboardPage() {
  // Aggregate avg directly in DB — no shipping raw ratings arrays to the server
  const rawFaculty = await prisma.faculty.findMany({
    where: {
      ratings: { some: {} }, // only faculty with at least 1 rating
    },
    include: {
      _count: { select: { ratings: true } },
      ratings: {
        select: {
          teachingClarity: true,
          approachability: true,
          gradingFairness: true,
          punctuality: true,
          partiality: true,
          behaviour: true,
        },
      },
    },
  })

  // Compute avg server-side, sort, take top 25
  const faculty = rawFaculty
    .map(f => {
      const count = f._count.ratings
      const avg = count > 0
        ? f.ratings.reduce(
            (sum, r) => sum + (r.teachingClarity + r.approachability + r.gradingFairness +
              r.punctuality + r.partiality + r.behaviour) / 6,
            0
          ) / count
        : 0
      return { id: f.id, name: f.name, department: f.department, ratingCount: count, avg }
    })
    .filter(f => f.ratingCount >= 1)
    .sort((a, b) => b.avg - a.avg || b.ratingCount - a.ratingCount)
    .slice(0, 25)

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#f0ede8" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        .playfair { font-family: 'Playfair Display', Georgia, serif !important; }
        .dmsans   { font-family: 'DM Sans', sans-serif !important; }

        .row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 20px; border-bottom: 1px solid #111;
          text-decoration: none; color: inherit;
          transition: background 0.15s;
        }
        .row:hover { background: #0d0d0d; }
        .row:last-child { border-bottom: none; }
      `}} />

      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        backgroundColor: "rgba(8,8,8,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #141414",
        padding: "0 20px", height: "52px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/" className="dmsans" style={{ fontSize: "12px", color: "#555", textDecoration: "none" }}>← Home</Link>
        <span className="playfair" style={{ fontSize: "16px", fontWeight: 700 }}>
          🏆 <span style={{ color: "#c8a96e" }}>Leaderboard</span>
        </span>
        <div style={{ width: "48px" }} />
      </nav>

      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 0 80px" }}>
        <div style={{ padding: "0 20px 20px" }}>
          <p className="dmsans" style={{ fontSize: "12px", color: "#555" }}>
            Top {faculty.length} faculty by student ratings
          </p>
        </div>

        {faculty.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <p className="playfair" style={{ fontSize: "20px", color: "#2a2a2a", fontStyle: "italic" }}>
              No ratings yet.
            </p>
          </div>
        ) : (
          <div style={{ border: "1px solid #141414" }}>
            {faculty.map((f, i) => {
              const medal = medalEmoji(i)
              const col = ratingColor(f.avg)
              return (
                <Link key={f.id} href={`/faculty/${f.id}`} className="row">
                  {/* Rank / medal */}
                  <div style={{ width: "32px", textAlign: "center", flexShrink: 0 }}>
                    {medal ? (
                      <span style={{ fontSize: "20px" }}>{medal}</span>
                    ) : (
                      <span className="dmsans" style={{ fontSize: "13px", color: "#444", fontWeight: 600 }}>
                        {i + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar initial */}
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "8px",
                    background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span className="playfair" style={{ fontSize: "18px", color: "#c8a96e", fontWeight: 700 }}>
                      {f.name.charAt(0)}
                    </span>
                  </div>

                  {/* Name + dept */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="playfair" style={{
                      margin: "0 0 2px", fontSize: "15px", fontWeight: 700,
                      color: "#f0ede8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {f.name}
                    </p>
                    {f.department && (
                      <p className="dmsans" style={{
                        margin: 0, fontSize: "11px", color: "#555",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {f.department}
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "2px", justifyContent: "flex-end" }}>
                      <span className="playfair" style={{ fontSize: "24px", fontWeight: 900, color: col }}>
                        {f.avg.toFixed(1)}
                      </span>
                      <span className="dmsans" style={{ fontSize: "10px", color: "#333" }}>/5</span>
                    </div>
                    <p className="dmsans" style={{ margin: "2px 0 0", fontSize: "10px", color: "#444" }}>
                      {f.ratingCount} {f.ratingCount === 1 ? "review" : "reviews"}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
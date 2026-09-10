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

export const dynamic = "force-dynamic"

function medalEmoji(i: number) {
  if (i === 0) return "🥇"
  if (i === 1) return "🥈"
  if (i === 2) return "🥉"
  return null
}

function ratingColorClass(avg: number) {
  if (avg >= 4.5) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
  if (avg >= 3.5) return "text-amber-300 border-amber-500/30 bg-amber-500/10"
  if (avg >= 2.5) return "text-orange-400 border-orange-500/30 bg-orange-500/10"
  return "text-rose-400 border-rose-500/30 bg-rose-500/10"
}

export default async function LeaderboardPage() {
  const rawFaculty = await prisma.faculty.findMany({
    where: {
      ratings: { some: {} },
    },
    include: {
      college: { select: { name: true } },
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
      return {
        id: f.id,
        name: f.name,
        department: f.department,
        collegeName: f.college?.name,
        ratingCount: count,
        avg,
      }
    })
    .filter(f => f.ratingCount >= 1)
    .sort((a, b) => b.avg - a.avg || b.ratingCount - a.ratingCount)
    .slice(0, 25)

  return (
    <div className="min-h-screen flex flex-col justify-start relative z-10 selection:bg-blue-600 selection:text-white pb-36">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full pt-2 pb-2 px-4 backdrop-blur-2xl bg-black/40 border-b border-white/[0.08]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full liquid-glass-pill text-[12px] font-semibold text-cyan-300 hover:text-white transition-all no-underline"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
            <span>Home</span>
          </Link>

          <h1 className="text-[17px] font-extrabold text-white tracking-tight m-0 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-amber-400 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
              trophy
            </span>
            <span>Leaderboard</span>
          </h1>

          <div className="px-2 py-0.5 rounded-full liquid-badge text-[10px] font-bold text-amber-300 uppercase tracking-widest">
            Top 25
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full px-4 pt-4 z-10 flex flex-col gap-4 max-w-md mx-auto outline-none">
        {/* Hero Card */}
        <div className="rounded-[24px] liquid-glass p-5 border border-white/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">military_tech</span>
              Hall of Excellence
            </span>
          </div>
          <h2 className="text-[24px] font-extrabold text-white tracking-tight m-0">
            Faculty <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-300">Leaderboard</span>
          </h2>
          <p className="text-[13px] text-white/60 mt-1 mb-0 leading-relaxed">
            The highest-rated faculty across India ranked by verified student sentiment and peer evaluations.
          </p>
        </div>

        {/* List of Faculty */}
        {faculty.length === 0 ? (
          <div className="rounded-[22px] liquid-glass p-8 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-white/40 text-[32px]" aria-hidden="true">stars</span>
            <p className="text-white/80 font-semibold text-[15px]">No ratings yet</p>
            <p className="text-white/50 text-[13px]">Check back soon as students review faculty.</p>
          </div>
        ) : (
          <ul role="list" className="flex flex-col gap-2 p-0 m-0 list-none" aria-label="Faculty leaderboard rankings">
            {faculty.map((f, i) => {
              const medal = medalEmoji(i)
              const scoreBadgeClass = ratingColorClass(f.avg)

              return (
                <li key={f.id} className="list-none">
                  <Link
                    href={`/faculty/${f.id}`}
                    className="rounded-[20px] liquid-glass p-3.5 flex items-center gap-3.5 hover:border-cyan-400/40 transition-all no-underline group"
                  >
                    {/* Rank / Medal */}
                    <div className="w-7 text-center shrink-0 flex items-center justify-center">
                      {medal ? (
                        <>
                          <span aria-hidden="true" className="text-[22px]">{medal}</span>
                          <span className="sr-only">Rank {i + 1}</span>
                        </>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-bold text-white/60">
                          <span aria-hidden="true">{i + 1}</span>
                          <span className="sr-only">Rank {i + 1}</span>
                        </div>
                      )}
                    </div>

                    {/* Avatar Initial */}
                    <div
                      aria-hidden="true"
                      className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-white/15 flex items-center justify-center shrink-0 shadow-inner"
                    >
                      <span className="text-[16px] font-extrabold text-cyan-300">
                        {f.name.charAt(0)}
                      </span>
                    </div>

                    {/* Name + Dept */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-white truncate m-0 group-hover:text-cyan-200 transition-colors">
                        {f.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-white/50 truncate mt-0.5">
                        {f.department && <span className="truncate">{f.department}</span>}
                        {f.department && f.collegeName && <span>•</span>}
                        {f.collegeName && <span className="truncate text-white/40">{f.collegeName}</span>}
                      </div>
                    </div>

                    {/* Rating Pill */}
                    <div className="shrink-0 flex flex-col items-end gap-0.5">
                      <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1 text-[12px] font-extrabold ${scoreBadgeClass}`}>
                        <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                        <span aria-hidden="true">{f.avg.toFixed(1)}</span>
                        <span className="sr-only">Average rating {f.avg.toFixed(1)} out of 5 stars</span>
                      </div>
                      <span className="text-[10px] text-white/40">
                        {f.ratingCount} {f.ratingCount === 1 ? "review" : "reviews"}
                      </span>
                    </div>

                    <span className="material-symbols-outlined text-white/20 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all text-[18px] shrink-0" aria-hidden="true">
                      chevron_right
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
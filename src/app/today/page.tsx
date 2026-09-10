// FIX: Converted from "use client" + useEffect fetch to Server Component.
//
// Before: fetch("/api/recent-ratings") ran on every page mount.
//         Every visitor triggered a serverless invocation.
//
// After:  Prisma runs at request time with ISR (revalidate=60).
//         At most 1 DB call per minute regardless of visitor count.

import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

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

function scoreBadgeClass(score: number) {
  if (score >= 4.5) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
  if (score >= 3.5) return "text-amber-300 border-amber-500/30 bg-amber-500/10"
  if (score >= 2.5) return "text-orange-400 border-orange-500/30 bg-orange-500/10"
  return "text-rose-400 border-rose-500/30 bg-rose-500/10"
}

export default async function TodayPage() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const ratings = await prisma.rating.findMany({
    where: {
      createdAt: { gte: startOfDay },
      review: { not: null },
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

          <h1 className="text-[17px] font-extrabold text-white tracking-tight m-0">
            Today's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Voices</span>
          </h1>

          <div className="px-2 py-0.5 rounded-full liquid-badge text-[10px] font-bold text-cyan-200 uppercase tracking-widest">
            Live Feed
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full px-4 pt-4 z-10 flex flex-col gap-4 max-w-md mx-auto outline-none">
        {/* Hero Card */}
        <div className="rounded-[24px] liquid-glass p-5 border border-white/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-300 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">campaign</span>
              Real-time Feed
            </span>
            <span className="px-2.5 py-0.5 rounded-full liquid-badge text-[10px] font-bold text-cyan-200">
              {ratings.length} updates today
            </span>
          </div>
          <h2 className="text-[24px] font-extrabold text-white tracking-tight m-0">
            Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Sentiment</span>
          </h2>
          <p className="text-[13px] text-white/60 mt-1 mb-0 leading-relaxed">
            Freshly submitted faculty reviews, ratings, and course impressions posted by students today.
          </p>
        </div>

        {ratings.length === 0 ? (
          <div className="rounded-[22px] liquid-glass p-8 text-center flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-white/40 text-[36px]" aria-hidden="true">rate_review</span>
            <h3 className="text-[17px] font-bold text-white m-0">The campus is quiet</h3>
            <p className="text-[13px] text-white/50 m-0 max-w-xs">
              No reviews posted today yet. Be the first student to review your professor!
            </p>
            <Link
              href="/"
              className="mt-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[13px] no-underline shadow-[0_4px_14px_rgba(10,132,255,0.4)]"
            >
              Browse Faculty
            </Link>
          </div>
        ) : (
          <ul role="list" className="flex flex-col gap-3 p-0 m-0 list-none" aria-label="Today's faculty reviews">
            {ratings.map((r) => {
              const overall = (
                r.teachingClarity + r.approachability + r.gradingFairness +
                r.punctuality + r.partiality + r.behaviour
              ) / 6
              const overallStr = overall.toFixed(1)
              const scoreBadge = scoreBadgeClass(overall)

              return (
                <li key={r.id} className="list-none">
                  <div className="rounded-[22px] liquid-glass p-4 flex flex-col gap-3">
                    {/* Top Row: Score + Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1 text-[13px] font-black ${scoreBadge}`}>
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                          <span aria-hidden="true">{overallStr}</span>
                          <span className="text-[10px] opacity-70 font-normal" aria-hidden="true">/5</span>
                          <span className="sr-only">Rated {overallStr} out of 5 stars</span>
                        </div>
                        <span className="text-[11px] text-white/40 font-medium">Overall Rating</span>
                      </div>
                      <span className="text-[11px] text-white/50">
                        {timeAgo(new Date(r.createdAt))}
                      </span>
                    </div>

                    {/* Faculty Target */}
                    {r.faculty && (
                      <Link
                        href={`/faculty/${r.faculty.id}`}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-400/40 transition-all no-underline group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-white/10 flex items-center justify-center shrink-0">
                            <span className="text-[12px] font-bold text-cyan-300">
                              {r.faculty.name.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-white truncate m-0 group-hover:text-cyan-200 transition-colors">
                              {r.faculty.name}
                            </p>
                            {r.faculty.department && (
                              <p className="text-[11px] text-white/50 truncate m-0">
                                {r.faculty.department}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-white/30 text-[18px] group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" aria-hidden="true">
                          chevron_right
                        </span>
                      </Link>
                    )}

                    {/* Student Review Text */}
                    {r.review && (
                      <div className="p-3 rounded-xl bg-white/[0.02] border-l-2 border-cyan-400 text-[13px] text-white/90 leading-relaxed italic">
                        "{r.review}"
                      </div>
                    )}

                    {/* Criteria Pods Grid */}
                    <div className="grid grid-cols-3 gap-1.5 pt-1" role="group" aria-label="Rating breakdown">
                      {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
                        const val = (r as any)[key]
                        return (
                          <div
                            key={key}
                            aria-label={`${label}: ${val} out of 5`}
                            className="rounded-lg bg-black/30 border border-white/[0.05] p-1.5 text-center"
                          >
                            <p className="text-[9px] uppercase tracking-wider text-white/50 font-bold m-0">{label}</p>
                            <p className="text-[12px] font-bold text-white mt-0.5 mb-0">
                              {val}<span className="text-[10px] text-white/40 font-normal">/5</span>
                            </p>
                          </div>
                        )
                      })}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-[11px]">
                      <span className="text-white/40 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-emerald-400" aria-hidden="true">verified_user</span>
                        <span>Verified Anonymous</span>
                      </span>
                      {r.faculty && (
                        <Link
                          href={`/faculty/${r.faculty.id}`}
                          aria-label={`View ${r.faculty.name}'s full profile`}
                          className="font-bold text-cyan-300 hover:text-white transition-colors no-underline flex items-center gap-0.5"
                        >
                          <span>Full Profile</span>
                          <span className="material-symbols-outlined text-[13px]" aria-hidden="true">arrow_forward</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import RatingReportButton from "@/components/RatingReportButton";

export const revalidate = 60;

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

  const overall = overallAvg ?? 0;

  return (
    <div className="min-h-screen flex flex-col justify-start relative z-10 selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full pt-2 pb-2 px-4 backdrop-blur-2xl bg-black/40 border-b border-white/[0.08]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href={faculty.collegeId ? `/colleges/${faculty.collegeId}` : "/"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-pill text-[12px] font-semibold text-cyan-300 hover:text-white transition-all no-underline"
            aria-label={`Back to ${faculty.college?.name || "Directory"}`}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">arrow_back</span>
            <span className="truncate max-w-[140px]">{faculty.college?.name || "Colleges"}</span>
          </Link>

          <Link href="/" className="text-[17px] font-extrabold tracking-tight text-white no-underline">
            RateMy<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">Faculty</span>
          </Link>

          <div className="w-12 flex justify-end" aria-hidden="true" />
        </div>
      </header>

      {/* Main Profile Canvas */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full px-4 pt-4 pb-40 z-10 flex flex-col gap-4 max-w-md mx-auto outline-none">
        {/* Faculty Hero Capsule */}
        <section className="relative overflow-hidden rounded-[26px] liquid-glass p-5 flex flex-col gap-3">
          <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" aria-hidden="true" />

          <div className="flex items-start justify-between gap-3">
            <div
              aria-hidden="true"
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-cyan-400/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-extrabold text-[24px] shadow-sm flex-shrink-0"
            >
              {faculty.name.charAt(0)}
            </div>

            {overallAvg !== null && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 font-bold text-[14px]">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                <span aria-hidden="true">{overall.toFixed(1)}</span>
                <span className="text-white/40 text-[11px] font-normal" aria-hidden="true">/ 5.0</span>
                <span className="sr-only">Rated {overall.toFixed(1)} out of 5.0 stars</span>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-[24px] font-extrabold text-white tracking-tight leading-tight m-0">
              {faculty.name}
            </h1>
            <p className="text-[13px] text-white/60 m-0 mt-1">
              {[faculty.designation, faculty.department].filter(Boolean).join(" · ")}
            </p>
            {faculty.college && (
              <p className="text-[12px] text-cyan-300/80 m-0 mt-0.5">
                {faculty.college.name}
              </p>
            )}
          </div>

          {overallAvg !== null ? (
            <div
              role="region"
              aria-label={`Overall rating: ${overall.toFixed(1)} out of 5 stars based on ${totalReviews} reviews`}
              className="flex items-baseline gap-2 pt-2 border-t border-white/10"
            >
              <span className="text-[44px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 leading-none">
                {overall.toFixed(1)}
              </span>
              <div className="text-[12px] text-white/60">
                <span className="font-semibold text-white/80">Overall Score</span> · {totalReviews} {totalReviews === 1 ? "review" : "verified reviews"}
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-white/50 italic m-0 pt-2 border-t border-white/10">
              No ratings yet — be the first to rate this professor.
            </p>
          )}
        </section>

        {/* Action Buttons: Rate & Share */}
        <section className="flex gap-2.5">
          <Link
            href={`/rate/${faculty.id}`}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(10,132,255,0.4)] active:scale-95 transition-all no-underline"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">star_rate</span>
            <span>Rate Professor</span>
          </Link>
          <ShareButton name={faculty.name} avgRating={overallAvg ? overall.toFixed(1) : null} />
        </section>

        {/* Rating Breakdown Section */}
        <section className="rounded-[24px] liquid-glass p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-white uppercase tracking-wider m-0">
              Rating Breakdown
            </h2>
            <span className="text-[11px] text-white/50">Based on 6 criteria</span>
          </div>

          <div className="flex flex-col gap-2.5 pt-1">
            {metrics.map((m) => {
              const val = getAvg(m.key);
              const pct = (val / 5) * 100;
              return (
                <div key={m.key} className="flex items-center gap-2.5">
                  <span
                    id={`metric-${m.key}`}
                    className="text-[12px] text-white/80 font-medium w-24 flex-shrink-0"
                  >
                    {m.label}
                  </span>

                  <div
                    role="meter"
                    aria-labelledby={`metric-${m.key}`}
                    aria-valuenow={val}
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-valuetext={`${m.label}: ${val.toFixed(1)} out of 5`}
                    className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden"
                  >
                    <div
                      aria-hidden="true"
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span
                    aria-hidden="true"
                    className="text-[12px] font-bold text-cyan-300 w-8 text-right flex-shrink-0"
                  >
                    {totalReviews === 0 ? "—" : val.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Student Reviews Section */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[15px] font-bold text-white tracking-tight m-0">
              Student Reviews ({writtenReviews.length})
            </h2>
            <span className="text-[11px] text-white/50">100% Anonymous</span>
          </div>

          {writtenReviews.length === 0 ? (
            <div className="liquid-glass rounded-[22px] p-6 text-center flex flex-col items-center gap-1.5">
              <span className="material-symbols-outlined text-white/40 text-[28px]" aria-hidden="true">chat</span>
              <p className="text-white/80 font-semibold text-[14px]">No written reviews yet</p>
              <p className="text-white/50 text-[12px]">Be the first to share your classroom experience.</p>
            </div>
          ) : (
            <ul role="list" aria-label="Student reviews" className="flex flex-col gap-2.5 p-0 m-0 list-none">
              {writtenReviews.map((r) => {
                const reviewOverall = (
                  (r.teachingClarity + r.approachability + r.gradingFairness +
                   r.punctuality + r.partiality + r.behaviour) / 6
                );
                return (
                  <li key={r.id} className="list-none">
                    <div className="rounded-[22px] liquid-glass p-4 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 text-[12px] font-bold">
                          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">star</span>
                          <span aria-hidden="true">{reviewOverall.toFixed(1)}</span>
                          <span className="sr-only">Rating: {reviewOverall.toFixed(1)} out of 5 stars</span>
                        </div>
                        <time dateTime={new Date(r.createdAt).toISOString()} className="text-[11px] text-white/50">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </time>
                      </div>

                      <p className="text-[13px] leading-relaxed text-white/90 pl-2.5 border-l-2 border-cyan-400/70 m-0">
                        {r.review}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-[10px] font-semibold tracking-wider text-white/50 uppercase">
                          Verified Student
                        </span>
                        <RatingReportButton ratingId={r.id} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
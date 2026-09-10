"use client"

import { useState, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Link from "next/link";

const CRITERIA = [
  { id: "teachingClarity", label: "Teaching Clarity", desc: "How well do they explain concepts?" },
  { id: "approachability", label: "Approachability", desc: "Can you ask doubts without fear?" },
  { id: "gradingFairness", label: "Grading Fairness", desc: "Do they mark answers fairly?" },
  { id: "punctuality", label: "Punctuality", desc: "Do they arrive and leave on time?" },
  { id: "partiality", label: "Not Partial", desc: "How equal is their treatment of students?" },
  { id: "behaviour", label: "Behaviour", desc: "General attitude and vibe in class" },
];

export default function RatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: facultyId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({
    teachingClarity: 0,
    approachability: 0,
    gradingFairness: 0,
    punctuality: 0,
    partiality: 0,
    behaviour: 0,
  });
  const [review, setReview] = useState("");

  if (status === "loading") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen flex items-center justify-center text-cyan-300 font-semibold"
      >
        Initialising Secure Review...
      </div>
    );
  }

  if (!session) {
    return (
      <main id="main-content" tabIndex={-1} className="min-h-screen flex items-center justify-center px-4 py-12 outline-none">
        <div className="rounded-[26px] liquid-glass p-8 text-center max-w-sm w-full flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full liquid-glass flex items-center justify-center text-cyan-300 shadow-liquid-glow">
            <span className="material-symbols-outlined text-[32px]" aria-hidden="true">lock</span>
          </div>
          <h1 className="text-[22px] font-extrabold text-white tracking-tight m-0">
            Verified Reviews Only
          </h1>
          <p className="text-[13px] text-white/70 leading-relaxed m-0">
            To prevent spam and ensure 1 review per faculty, please sign in with your Google student account.
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[14px] shadow-[0_4px_16px_rgba(10,132,255,0.4)] active:scale-95 transition-all"
          >
            Sign in with Google
          </button>
        </div>
      </main>
    );
  }

  const handleScoreKey = (criterionId: string, num: number, e: React.KeyboardEvent) => {
    let nextVal = num;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextVal = num >= 5 ? 1 : num + 1;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextVal = num <= 1 ? 5 : num - 1;
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      nextVal = num;
    } else {
      return;
    }
    setScores((prev) => ({ ...prev, [criterionId]: nextVal }));
    const btn = document.getElementById(`score-${criterionId}-${nextVal}`);
    btn?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const unrated = CRITERIA.filter((c) => scores[c.id] === 0);
    if (unrated.length > 0) {
      setError(`Please provide a score for all metrics (${unrated.map(u => u.label).join(", ")}).`);
      setTimeout(() => errorRef.current?.focus(), 50);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId, ...scores, review }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      router.push(`/faculty/${facultyId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setTimeout(() => errorRef.current?.focus(), 50);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-start relative z-10 selection:bg-blue-600 selection:text-white pb-36">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full pt-2 pb-2 px-4 backdrop-blur-2xl bg-black/40 border-b border-white/[0.08]">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link
            href={`/faculty/${facultyId}`}
            aria-label="Cancel and return to faculty profile"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full liquid-glass-pill text-[12px] font-semibold text-white/80 hover:text-white transition-all no-underline"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
            <span>Cancel</span>
          </Link>

          <div className="px-2.5 py-0.5 rounded-full liquid-badge flex items-center gap-1">
            <span className="material-symbols-outlined text-cyan-300 text-[13px]" aria-hidden="true">visibility_off</span>
            <span className="text-[10px] font-bold text-cyan-200 uppercase tracking-widest">100% Anonymous</span>
          </div>

          <div className="w-12" aria-hidden="true" />
        </div>
      </header>

      {/* Main Form Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full px-4 pt-4 z-10 flex flex-col gap-4 max-w-md mx-auto outline-none">
        <div className="px-1">
          <h1 className="text-[26px] font-extrabold text-white tracking-tight leading-tight m-0">
            Rate Faculty Member
          </h1>
          <p className="text-[13px] text-white/60 m-0 mt-1">
            Be honest, be constructive, be fair. Your identity remains strictly private.
          </p>
        </div>

        {error && (
          <div
            ref={errorRef}
            id="form-error-banner"
            tabIndex={-1}
            role="alert"
            aria-live="assertive"
            className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-[13px] flex items-center gap-2 outline-none"
          >
            <span className="material-symbols-outlined text-rose-300 text-[18px]" aria-hidden="true">warning</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {CRITERIA.map((item) => {
            const currentScore = scores[item.id];
            const isInvalid = Boolean(error && currentScore === 0);
            return (
              <fieldset
                key={item.id}
                className="rounded-[24px] liquid-glass p-4 border border-white/10 flex flex-col gap-2.5"
              >
                <legend className="text-[15px] font-bold text-white tracking-tight m-0 float-left w-full">
                  {item.label} <span aria-hidden="true" className="text-cyan-400">*</span>
                  <span className="sr-only"> (required rating)</span>
                </legend>
                <p id={`${item.id}-desc`} className="text-[12px] text-white/60 m-0 clear-both">
                  {item.desc}
                </p>

                <div
                  role="radiogroup"
                  aria-required="true"
                  aria-invalid={isInvalid}
                  aria-label={`${item.label} score out of 5`}
                  aria-describedby={isInvalid ? `form-error-banner ${item.id}-desc` : `${item.id}-desc`}
                  className={`flex gap-2 pt-1 ${isInvalid ? "rounded-xl ring-2 ring-rose-500/50 p-1" : ""}`}
                >
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isChecked = currentScore === num;
                    const isFilled = currentScore >= num;
                    const tabIndex = isChecked || (currentScore === 0 && num === 1) ? 0 : -1;
                    return (
                      <button
                        key={num}
                        id={`score-${item.id}-${num}`}
                        type="button"
                        role="radio"
                        aria-checked={isChecked}
                        tabIndex={tabIndex}
                        aria-label={`${item.label}: ${num} out of 5${num === 1 ? " (Poor)" : num === 5 ? " (Excellent)" : ""}`}
                        onClick={() => setScores({ ...scores, [item.id]: num })}
                        onKeyDown={(e) => handleScoreKey(item.id, num, e)}
                        className={`flex-1 h-12 rounded-xl text-[16px] font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                          isFilled
                            ? "bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-[0_0_15px_rgba(100,210,255,0.4)] scale-[1.03] border border-cyan-300/40"
                            : "liquid-glass-pill text-white/50 hover:text-white"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>

                <div aria-hidden="true" className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-wider px-1">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </fieldset>
            );
          })}

          <div className="rounded-[24px] liquid-glass p-4 border border-white/10 flex flex-col gap-2">
            <label htmlFor="written-review" className="text-[15px] font-bold text-white tracking-tight block">
              Written Review <span className="text-white/40 font-normal text-[13px]">(Optional)</span>
            </label>
            <textarea
              id="written-review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Help other students by describing the teaching style, lab guidance, grading transparency, or attendance approach..."
              className="w-full h-32 liquid-glass-input p-3.5 rounded-2xl text-[14px] text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-[15px] shadow-[0_12px_28px_rgba(10,132,255,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 mt-1"
          >
            {loading ? "Publishing Anonymously..." : "Publish Anonymous Review"}
          </button>
        </form>
      </main>
    </div>
  );
}
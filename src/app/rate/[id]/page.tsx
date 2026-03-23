"use client"

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Link from "next/link";

const CRITERIA = [
  { id: "teachingClarity", label: "Teaching Clarity", desc: "How well do they explain concepts?" },
  { id: "approachability", label: "Approachability", desc: "Can you ask doubts without fear?" },
  { id: "gradingFairness", label: "Grading Fairness", desc: "Do they mark answers fairly?" },
  { id: "punctuality", label: "Punctuality", desc: "Do they arrive and leave on time?" },
  { id: "partiality", label: "Not Partial", desc: "5 = Treats everyone equally, 1 = Very partial" },
  { id: "behaviour", label: "Behaviour", desc: "Attitude towards students in class" },
];

export default function RatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: facultyId } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-6">
        <div className="text-center space-y-4 max-w-xs">
          <h1 className="text-2xl font-bold">Sign in to Rate</h1>
          <p className="text-gray-400 text-sm">
            We use Google Sign-in to ensure 1 review per faculty per student.
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full bg-white text-black px-8 py-3 rounded-xl font-bold"
          >
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check all criteria are rated
    const unrated = CRITERIA.filter((c) => scores[c.id] === 0);
    if (unrated.length > 0) {
      setError(`Please rate all criteria before submitting.`);
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <Link href={`/faculty/${facultyId}`} className="text-blue-400 text-sm">
          ← Back
        </Link>
      </div>

      <div className="px-4 mb-6">
        <h1 className="text-2xl font-bold">Rate this Faculty</h1>
        <p className="text-gray-500 text-sm mt-1">Your review is fully anonymous.</p>
      </div>

      {error && (
        <div className="mx-4 mb-4 bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-4 space-y-4">
        {CRITERIA.map((item) => (
          <div
            key={item.id}
            className="bg-gray-900 border border-gray-800 p-4 rounded-xl"
          >
            <div className="mb-3">
              <h3 className="font-semibold text-base">{item.label}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
            </div>

            {/* Star-style tap buttons — full width, touch friendly */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setScores({ ...scores, [item.id]: num })}
                  className={`flex-1 py-3 rounded-lg font-bold text-base transition ${
                    scores[item.id] >= num
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {/* Label hints */}
            <div className="flex justify-between mt-1 px-0.5">
              <span className="text-gray-600 text-xs">Poor</span>
              <span className="text-gray-600 text-xs">Excellent</span>
            </div>
          </div>
        ))}

        {/* Written review */}
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <label className="font-semibold text-base block mb-2">
            Written Review <span className="text-gray-500 font-normal text-sm">(optional)</span>
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience in your own words..."
            className="w-full h-28 bg-gray-800 border border-gray-700 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Submit — fixed to bottom on mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-950 border-t border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-xl text-base hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Post Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
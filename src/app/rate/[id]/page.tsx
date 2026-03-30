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
  { id: "partiality", label: "Not Partial", desc: "How equal is their treatment of students?" },
  { id: "behaviour", label: "Behaviour", desc: "General attitude and vibe in class" },
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
      <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", color: "#71717a" }}>
        Initialising Secure Review...
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0a0a0a", color: "#fff", padding: "24px" }}>
        <div style={{ textAlign: "center", maxWidth: "320px", animation: "fadeIn 0.5s ease" }}>
          <div style={{ fontSize: "40px", marginBottom: "20px" }}>🔒</div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.5px" }}>Verified Reviews Only</h1>
          <p style={{ color: "#71717a", fontSize: "14px", lineHeight: "1.5", marginBottom: "32px" }}>
            To prevent spam and ensure 1 review per faculty, please sign in with your SRM Google account.
          </p>
          <button
            onClick={() => signIn("google")}
            style={{ width: "100%", backgroundColor: "#fff", color: "#000", padding: "16px", borderRadius: "16px", fontWeight: 700, border: "none", cursor: "pointer" }}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const unrated = CRITERIA.filter((c) => scores[c.id] === 0);
    if (unrated.length > 0) {
      setError(`Please provide a score for all metrics.`);
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
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0a", color: "#f4f4f5", fontFamily: "Inter, sans-serif", paddingBottom: "120px" }}>
      {/* Header */}
      <nav style={{ padding: "16px 20px", borderBottom: "1px solid #1f1f22", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, backgroundColor: "rgba(10,10,10,0.8)", backdropFilter: "blur(12px)", zIndex: 100 }}>
        <Link href={`/faculty/${facultyId}`} style={{ color: "#71717a", textDecoration: "none", fontSize: "14px" }}>← Cancel</Link>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "1px" }}>Anonymous Review</span>
      </nav>

      <div style={{ padding: "32px 20px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-1px", margin: "0 0 8px" }}>Rate Faculty</h1>
        <p style={{ color: "#71717a", fontSize: "15px" }}>Be honest, be helpful, be fair.</p>
      </div>

      {error && (
        <div style={{ margin: "0 20px 24px", padding: "16px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "16px", color: "#ef4444", fontSize: "14px", fontWeight: 500 }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {CRITERIA.map((item) => (
          <div key={item.id} style={{ backgroundColor: "#111113", border: "1px solid #1f1f22", borderRadius: "24px", padding: "20px" }}>
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>{item.label}</h3>
              <p style={{ fontSize: "12px", color: "#71717a", margin: 0 }}>{item.desc}</p>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {[1, 2, 3, 4, 5].map((num) => {
                const isActive = scores[item.id] === num;
                const isSelected = scores[item.id] >= num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setScores({ ...scores, [item.id]: num })}
                    style={{
                      flex: 1, height: "48px", borderRadius: "12px", border: "none", fontSize: "16px", fontWeight: 800, cursor: "pointer", transition: "all 0.2s",
                      backgroundColor: isSelected ? "#ef4444" : "#18181b",
                      color: isSelected ? "#fff" : "#3f3f46",
                      boxShadow: isActive ? "0 0 15px rgba(239, 68, 68, 0.4)" : "none",
                      transform: isActive ? "scale(1.05)" : "scale(1)"
                    }}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", padding: "0 4px" }}>
               <span style={{ fontSize: "10px", fontWeight: 700, color: "#3f3f46", textTransform: "uppercase" }}>Poor</span>
               <span style={{ fontSize: "10px", fontWeight: 700, color: "#3f3f46", textTransform: "uppercase" }}>Excellent</span>
            </div>
          </div>
        ))}

        <div style={{ backgroundColor: "#111113", border: "1px solid #1f1f22", borderRadius: "24px", padding: "20px" }}>
          <label style={{ fontSize: "16px", fontWeight: 700, display: "block", marginBottom: "12px" }}>
            Written Review <span style={{ color: "#3f3f46", fontWeight: 400 }}>(Optional)</span>
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Help other students by describing the teaching style, marking, or attendance policy..."
            style={{ width: "100%", height: "140px", backgroundColor: "#0a0a0a", border: "1px solid #27272a", borderRadius: "16px", color: "#fff", padding: "16px", fontSize: "14px", outline: "none", resize: "none", transition: "border-color 0.2s" }}
          />
        </div>

        {/* Submit Action Area */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, padding: "20px",
          backgroundColor: "rgba(10, 10, 10, 0.8)", backdropFilter: "blur(20px)",
          borderTop: "1px solid #1f1f22", zIndex: 100
        }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", maxWidth: "600px", margin: "0 auto", display: "block",
              backgroundColor: "#fff", color: "#000", padding: "18px", borderRadius: "16px",
              fontSize: "16px", fontWeight: 800, border: "none", cursor: "pointer",
              transition: "all 0.2s", opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? "Posting Anonymously..." : "Publish Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
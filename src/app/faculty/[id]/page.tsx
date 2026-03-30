import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

export default async function FacultyProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const faculty = await prisma.faculty.findUnique({
    where: { id },
    include: { ratings: { orderBy: { createdAt: 'desc' } } },
  });

  if (!faculty) return notFound();

  const totalReviews = faculty.ratings.length;

  const getAvg = (key: string) => {
    if (totalReviews === 0) return "0.0";
    const sum = faculty.ratings.reduce((acc: any, r: any) => acc + (r[key] || 0), 0);
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

  const overallAvg = totalReviews === 0 ? null : (
    metrics.reduce((sum, m) => sum + parseFloat(getAvg(m.key)), 0) / metrics.length
  ).toFixed(1);

  const ratingColor = (avg: string) => {
    const n = parseFloat(avg);
    if (n >= 4.5) return "#00ff88";
    if (n >= 3.5) return "#FFD700";
    if (n >= 2.5) return "#FF8C00";
    return "#ff4444";
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#0a0a0a", 
      color: "#f4f4f5", 
      fontFamily: "Inter, -apple-system, sans-serif",
      paddingBottom: "100px" 
    }}>
      {/* Top Nav */}
      <nav style={{
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #1f1f22",
        backgroundColor: "rgba(10, 10, 10, 0.8)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <Link href="/" style={{ color: "#71717a", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
          ← BACK TO LIST
        </Link>
      </nav>

      {/* Hero Header */}
      <div style={{ padding: "24px 16px" }}>
        <div style={{
          backgroundColor: "#111113",
          border: "1px solid #1f1f22",
          borderRadius: "24px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center"
        }}>
          {faculty.photoUrl ? (
            <img
              src={`/api/image-proxy?url=${encodeURIComponent(faculty.photoUrl)}`}
              alt={faculty.name}
              style={{ width: "96px", height: "96px", borderRadius: "20px", objectFit: "cover", marginBottom: "16px", border: "3px solid #1f1f22" }}
            />
          ) : (
            <div style={{ width: "96px", height: "96px", borderRadius: "20px", backgroundColor: "#E8001C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: 900, color: "white", marginBottom: "16px" }}>
              {faculty.name?.charAt(0)}
            </div>
          )}

          <h1 style={{ fontSize: "24px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>{faculty.name}</h1>
          <p style={{ color: "#71717a", fontSize: "14px", margin: "4px 0" }}>{faculty.designation}</p>
          <p style={{ color: "#E8001C", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>{faculty.department}</p>

          {overallAvg && (
            <div style={{ marginTop: "16px", display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ fontSize: "48px", fontWeight: 900, color: ratingColor(overallAvg) }}>{overallAvg}</span>
              <span style={{ color: "#3f3f46", fontWeight: 700 }}>/ 5.0</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Actions */}
      <div style={{ padding: "0 16px", display: "flex", gap: "12px" }}>
        <Link
          href={`/rate/${faculty.id}`}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            color: "#000",
            textAlign: "center",
            fontWeight: 800,
            padding: "16px",
            borderRadius: "16px",
            textDecoration: "none",
            fontSize: "15px",
            boxShadow: "0 4px 14px rgba(255,255,255,0.1)"
          }}
        >
          RATE THIS FACULTY
        </Link>
        <div style={{ width: "56px" }}>
          <ShareButton name={faculty.name} avgRating={overallAvg} />
        </div>
      </div>

      {/* Stats Breakdown */}
      <div style={{ padding: "32px 16px" }}>
        <h2 style={{ fontSize: "12px", fontWeight: 800, color: "#3f3f46", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "16px" }}>
          METRICS BREAKDOWN
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {metrics.map((stat) => (
            <div key={stat.label} style={{ backgroundColor: "#111113", border: "1px solid #1f1f22", padding: "16px", borderRadius: "16px" }}>
              <p style={{ color: "#71717a", fontSize: "10px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase" }}>{stat.label}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                <span style={{ fontSize: "20px", fontWeight: 800, color: ratingColor(getAvg(stat.key)) }}>{getAvg(stat.key)}</span>
                <span style={{ fontSize: "12px", color: "#3f3f46" }}>/ 5</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feed Section */}
      <div style={{ padding: "0 16px 40px" }}>
        <h2 style={{ fontSize: "12px", fontWeight: 800, color: "#3f3f46", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "16px" }}>
          STUDENT FEEDBACK ({totalReviews})
        </h2>

        {faculty.ratings.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", border: "1px dashed #1f1f22", borderRadius: "24px" }}>
            <p style={{ color: "#3f3f46", fontSize: "14px" }}>No reviews yet. Be the trendsetter.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {faculty.ratings.map((r) => (
              <div key={r.id} style={{ backgroundColor: "#111113", border: "1px solid #1f1f22", padding: "20px", borderRadius: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
                  {[
                    { label: "Teach", val: r.teachingClarity },
                    { label: "Appr", val: r.approachability },
                    { label: "Grading", val: r.gradingFairness },
                  ].map((s) => (
                    <div key={s.label}>
                      <p style={{ color: "#3f3f46", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", margin: 0 }}>{s.label}</p>
                      <p style={{ color: "#fff", fontWeight: 800, fontSize: "13px", margin: 0 }}>{s.val}/5</p>
                    </div>
                  ))}
                </div>
                {r.review && (
                  <p style={{ color: "#a1a1aa", fontSize: "14px", lineHeight: "1.6", margin: 0, padding: "12px 0", borderTop: "1px solid #1f1f22" }}>
                    "{r.review}"
                  </p>
                )}
                <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#3f3f46", fontSize: "10px", fontWeight: 700, letterSpacing: "1px" }}>ANONYMOUS</span>
                  <span style={{ color: "#3f3f46", fontSize: "10px" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Island */}
      <div style={{
        position: "fixed",
        bottom: "24px", left: "20px", right: "20px",
        backgroundColor: "rgba(18, 18, 18, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid #27272a",
        borderRadius: "24px",
        display: "flex",
        padding: "12px",
        justifyContent: "space-around",
        zIndex: 100
      }}>
        <Link href="/" style={{ color: "#E8001C", fontWeight: 800, textDecoration: "none", fontSize: "12px" }}>HOME</Link>
        <Link href="/incidents" style={{ color: "#71717a", fontWeight: 800, textDecoration: "none", fontSize: "12px" }}>FEED</Link>
        <Link href="/rooms" style={{ color: "#71717a", fontWeight: 800, textDecoration: "none", fontSize: "12px" }}>ROOMS</Link>
      </div>
    </div>
  );
}
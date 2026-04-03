import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import RatingReportButton from "@/components/RatingReportButton";

/** * THE FIX: 
 * 1. Set revalidate to false (On-Demand only).
 * 2. Force static to ensure Turbopack treats this as a clean static segment.
 */
export const revalidate = false; 
export const dynamic = "force-static";

export async function generateStaticParams() {
  const faculty = await prisma.faculty.findMany({ select: { id: true } });
  return faculty.map((f) => ({ id: f.id }));
}

export default async function FacultyProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const faculty = await prisma.faculty.findUnique({
    where: { id },
    include: { ratings: { orderBy: { createdAt: "desc" } } },
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

  const overallAvg =
    totalReviews === 0
      ? null
      : (
          metrics.reduce((sum, m) => sum + parseFloat(getAvg(m.key)), 0) /
          metrics.length
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
        paddingBottom: "120px", // Increased for nav island
      }}
    >
      <nav style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #1f1f22",
          backgroundColor: "rgba(10, 10, 10, 0.8)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Link href="/" style={{ color: "#71717a", textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
          ← BACK TO LIST
        </Link>
      </nav>

      <div style={{ padding: "24px 16px" }}>
        <div style={{
            backgroundColor: "#111113",
            border: "1px solid #1f1f22",
            borderRadius: "24px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
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

      <div style={{ padding: "0 16px", display: "flex", gap: "12px" }}>
        <Link href={`/rate/${faculty.id}`} style={{
            flex: 1, backgroundColor: "#fff", color: "#000", textAlign: "center", fontWeight: 800, padding: "16px", borderRadius: "16px", textDecoration: "none", fontSize: "15px", boxShadow: "0 4px 14px rgba(255,255,255,0.1)",
          }}
        >
          RATE THIS FACULTY
        </Link>
        <div style={{ width: "56px" }}>
          <ShareButton name={faculty.name} avgRating={overallAvg} />
        </div>
      </div>

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
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: "#3f3f46", fontSize: "10px" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                    <RatingReportButton ratingId={r.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Legal Disclaimer */}
      <div style={{ padding: "0 16px 40px", textAlign: "center" }}>
        <p style={{ fontSize: "10px", lineHeight: "1.6", color: "#3f3f46" }}>
          All content represents user opinions and experiences. We do not verify claims. Report inappropriate content for review.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "12px" }}>
          <Link href="/privacy" style={{ fontSize: "10px", color: "#71717a", textDecoration: "underline" }}>PRIVACY</Link>
          <Link href="/terms" style={{ fontSize: "10px", color: "#71717a", textDecoration: "underline" }}>TERMS</Link>
          <Link href="/guidelines" style={{ fontSize: "10px", color: "#71717a", textDecoration: "underline" }}>GUIDELINES</Link>
        </div>
      </div>

      {/* Floating Bottom Nav */}
      <div style={{
          position: "fixed",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(24, 24, 27, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid #3f3f46",
          borderRadius: "40px",
          display: "flex",
          padding: "8px",
          gap: "4px",
          zIndex: 9999,
          pointerEvents: "auto",
          boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
        }}
      >
        {[
          { href: "/", label: "Home" },
          { href: "/today", label: "Today" },
          { href: "/incidents", label: "Feed" },
          { href: "/rooms", label: "Rooms" },
        ].map((item) => (
          <Link key={item.label} href={item.href} style={{
            padding: "10px 22px", borderRadius: "30px", 
            color: item.href === "/" ? "#fff" : "#a1a1aa", 
            backgroundColor: "transparent", 
            textDecoration: "none", fontSize: "13px", fontWeight: 700,
          }}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
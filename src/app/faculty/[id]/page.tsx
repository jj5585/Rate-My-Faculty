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
    include: { ratings: true },
  });

  if (!faculty) return notFound();

  const totalReviews = faculty.ratings.length;

  const getAvg = (key: string) => {
    if (totalReviews === 0) return "0";
    const sum = faculty.ratings.reduce(
      (acc: any, r: any) => acc + (r[key] || 0),
      0
    );
    return (sum / totalReviews).toFixed(1);
  };

  const overallAvg = totalReviews === 0 ? null : (
    ["teachingClarity","approachability","gradingFairness","punctuality","partiality","behaviour"]
      .reduce((sum, key) => sum + parseFloat(getAvg(key)), 0) / 6
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="px-4 pt-4 pb-2">
        <Link href="/" className="text-blue-400 text-sm flex items-center gap-1">
          ← Back
        </Link>
      </div>

      {/* Hero card */}
      <div className="mx-4 mt-2 bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
        {faculty.photoUrl ? (
          <img
            src={`/api/image-proxy?url=${encodeURIComponent(faculty.photoUrl)}`}
            alt={faculty.name}
            className="w-20 h-20 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-gray-800 flex items-center justify-center text-2xl font-bold text-gray-400 shrink-0">
            {faculty.name?.charAt(0) || "?"}
          </div>
        )}

        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight truncate">{faculty.name}</h1>
          <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">{faculty.designation}</p>
          <p className="text-blue-400 text-xs mt-1 font-medium truncate">{faculty.department}</p>
          {overallAvg && (
            <p className="text-yellow-400 font-bold mt-1">{overallAvg} ★ overall</p>
          )}
        </div>
      </div>

      {/* Rate + Share buttons */}
      <div className="mx-4 mt-3 flex gap-2">
        <Link
          href={`/rate/${faculty.id}`}
          className="flex-1 bg-white text-black text-center font-bold py-3 rounded-xl hover:bg-gray-200 transition"
        >
          Rate this Faculty
        </Link>
        <ShareButton name={faculty.name} avgRating={overallAvg} />
      </div>

      {/* Stats grid */}
      <div className="mx-4 mt-5 grid grid-cols-2 gap-3">
        {[
          { label: "Teaching Clarity", score: getAvg("teachingClarity") },
          { label: "Approachability", score: getAvg("approachability") },
          { label: "Grading Fairness", score: getAvg("gradingFairness") },
          { label: "Punctuality", score: getAvg("punctuality") },
          { label: "Non-Partiality", score: getAvg("partiality") },
          { label: "Behaviour", score: getAvg("behaviour") },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 p-4 rounded-xl text-center">
            <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.score}</p>
            <p className="text-gray-600 text-xs">/ 5</p>
          </div>
        ))}
      </div>

      {/* Reviews */}
      <div className="mx-4 mt-6 mb-10 space-y-4">
        <h2 className="text-lg font-bold">Student Feedback ({totalReviews})</h2>

        {faculty.ratings.length === 0 ? (
          <p className="text-gray-600 italic text-sm">No reviews yet. Be the first to add one!</p>
        ) : (
          faculty.ratings.map((r) => (
            <div key={r.id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: "Teaching", val: r.teachingClarity },
                  { label: "Approach", val: r.approachability },
                  { label: "Grading", val: r.gradingFairness },
                  { label: "Punctual", val: r.punctuality },
                  { label: "Partial", val: r.partiality },
                  { label: "Behaviour", val: r.behaviour },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-gray-500 text-xs">{s.label}</p>
                    <p className="text-white font-bold text-sm">{s.val}/5</p>
                  </div>
                ))}
              </div>
              {r.review && (
                <p className="text-gray-300 text-sm leading-relaxed italic border-t border-gray-800 pt-3">
                  "{r.review}"
                </p>
              )}
              <p className="text-gray-600 text-xs mt-3 uppercase tracking-widest">
                Anonymous · {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/colleges/[id] — college detail with faculty + avg ratings
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const college = await prisma.college.findUnique({
    where: { id, status: "APPROVED" },
    include: {
      faculty: {
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
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!college) {
    return NextResponse.json({ error: "College not found" }, { status: 404 })
  }

  const faculty = college.faculty.map((f) => {
    const count = f._count.ratings
    const avg =
      count > 0
        ? (
            f.ratings.reduce(
              (sum, r) =>
                sum +
                (r.teachingClarity + r.approachability + r.gradingFairness +
                  r.punctuality + r.partiality + r.behaviour) / 6,
              0
            ) / count
          ).toFixed(1)
        : null

    return {
      id: f.id,
      name: f.name,
      designation: f.designation,
      department: f.department,
      ratingCount: count,
      avgRating: avg,
    }
  })

  // FIX #3b: Cache college detail pages at the Edge.
  // The faculty list for a college changes infrequently.
  // 60s s-maxage means at most 1 DB call per minute per college, not 1 per visitor.
  return NextResponse.json(
    { college: {
        id: college.id,
        name: college.name,
        website: college.website,
        city: college.city,
        state: college.state,
        country: college.country,
        emailDomain: college.emailDomain,
      },
      faculty,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  )
}
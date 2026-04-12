import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const college = await prisma.college.findUnique({
    where: { id, status: "APPROVED" },
    select: { id: true, name: true },
  })

  if (!college) {
    return NextResponse.json({ error: "College not found" }, { status: 404 })
  }

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const ratings = await prisma.rating.findMany({
    where: {
      createdAt: { gte: startOfDay },
      review: { not: null },
      faculty: { collegeId: id },
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
        select: {
          id: true,
          name: true,
          department: true,
        },
      },
    },
  })

  // FIX #3d: Cache "today's reviews" for 30s.
  // The logs showed /colleges/[id]/today hitting the DB on every prefetch from
  // the bottom nav. 30s cache means at most 2 DB calls/minute instead of
  // potentially dozens during active usage.
  return NextResponse.json(
    { ratings, college },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  )
}
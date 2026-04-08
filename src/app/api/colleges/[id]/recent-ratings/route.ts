// src/app/api/colleges/[id]/recent-ratings/route.ts
// GET — today's written reviews for faculty belonging to a specific college

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Verify college exists and is approved
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
      faculty: {
        collegeId: id, // join through faculty to scope by college
      },
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

  return NextResponse.json({ ratings, college })
}
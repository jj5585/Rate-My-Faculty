import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const ratings = await prisma.rating.findMany({
    where: {
      createdAt: { gte: startOfDay },
      review: { not: null }, // only show ratings that have a written review
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
    },
  })

  return NextResponse.json({ ratings })
}
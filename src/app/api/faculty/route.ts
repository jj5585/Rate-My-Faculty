export const revalidate = 60
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""

  const faculty = await prisma.faculty.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { department: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
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
  })

  const result = faculty.map((f) => {
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
      photoUrl: f.photoUrl,
      ratingCount: count,
      avgRating: avg,
    }
  })

  return NextResponse.json({ faculty: result })
}
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const story = await prisma.story.findUnique({
    where: { id, hidden: false },
    include: {
      college: { select: { id: true, name: true, city: true } },
      comments: { orderBy: { createdAt: "asc" } },
      _count: { select: { comments: true } },
    },
  })

  if (!story) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ story })
}
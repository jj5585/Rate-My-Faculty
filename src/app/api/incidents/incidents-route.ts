import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const now = new Date()

  const incidents = await prisma.incident.findMany({
    where: { expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reports: true } } },
  })

  return NextResponse.json({ incidents })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to post" }, { status: 401 })
  }

  const { content, category } = await req.json()

  if (!content || content.trim().length < 10) {
    return NextResponse.json({ error: "Post must be at least 10 characters" }, { status: 400 })
  }

  if (!category) {
    return NextResponse.json({ error: "Please select a category" }, { status: 400 })
  }

  const userHash = createHash("sha256").update(session.user.email).digest("hex")
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  const incident = await prisma.incident.create({
    data: {
      content: content.trim(),
      category,
      userHash,
      expiresAt,
    },
  })

  return NextResponse.json({ incident })
}

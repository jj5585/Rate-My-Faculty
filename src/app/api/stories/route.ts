import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { createHash } from "crypto"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const collegeId = searchParams.get("collegeId")
  const cursor = searchParams.get("cursor")

  const stories = await prisma.story.findMany({
    where: {
      hidden: false,
      ...(collegeId ? { collegeId } : {}),
    },
    include: {
      college: { select: { id: true, name: true, city: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })

  return NextResponse.json(
    { stories },
    { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60" } }
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email)
    return NextResponse.json({ error: "Sign in to post" }, { status: 401 })

  const { title, content, collegeId } = await req.json()

  if (!title?.trim() || title.trim().length < 5)
    return NextResponse.json({ error: "Title must be at least 5 characters" }, { status: 400 })
  if (!content?.trim() || content.trim().length < 20)
    return NextResponse.json({ error: "Story must be at least 20 characters" }, { status: 400 })
  if (!collegeId)
    return NextResponse.json({ error: "Select a college" }, { status: 400 })

  const college = await prisma.college.findUnique({
    where: { id: collegeId, status: "APPROVED" },
  })
  if (!college)
    return NextResponse.json({ error: "College not found" }, { status: 404 })

  const userHash = createHash("sha256").update(session.user.email).digest("hex")

  const story = await prisma.story.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      userHash,
      collegeId,
    },
    include: {
      college: { select: { id: true, name: true, city: true } },
      _count: { select: { comments: true } },
    },
  })

  return NextResponse.json({ story })
}
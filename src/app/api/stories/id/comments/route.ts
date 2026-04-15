import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { createHash } from "crypto"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email)
    return NextResponse.json({ error: "Sign in to comment" }, { status: 401 })

  const { id } = await params
  const { content } = await req.json()

  if (!content?.trim() || content.trim().length < 2)
    return NextResponse.json({ error: "Comment too short" }, { status: 400 })

  const story = await prisma.story.findUnique({ where: { id, hidden: false } })
  if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 })

  const userHash = createHash("sha256")
    .update(session.user.email + id)
    .digest("hex")
    .slice(0, 8)

  const comment = await prisma.storyComment.create({
    data: { storyId: id, content: content.trim(), userHash },
  })

  return NextResponse.json({ comment })
}
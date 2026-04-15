import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  const { id } = await params
  if (!session?.user?.email)
    return NextResponse.json({ error: "Sign in to upvote" }, { status: 401 })

  const story = await prisma.story.update({
    where: { id },
    data: { upvotes: { increment: 1 } },
  })
  return NextResponse.json({ upvotes: story.upvotes })
}
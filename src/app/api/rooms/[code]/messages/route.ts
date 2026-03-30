import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const { searchParams } = new URL(req.url)
  const password = searchParams.get("password")

  const room = await prisma.gossipRoom.findUnique({ where: { roomCode: code } })

  if (!room || room.password !== password) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const messages = await prisma.gossipMessage.findMany({
    where: { roomId: room.id },
    orderBy: { createdAt: "asc" },
    take: 100,
  })

  return NextResponse.json({ messages, room })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await getServerSession(authOptions)
  const { code } = await params

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { content, password } = await req.json()

  const room = await prisma.gossipRoom.findUnique({ where: { roomCode: code } })

  if (!room || room.password !== password) {
    return NextResponse.json({ error: "Wrong room or password" }, { status: 403 })
  }

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 })
  }

  const userHash = createHash("sha256")
    .update(session.user.email + room.id)
    .digest("hex")
    .slice(0, 8) // short hash for "Anonymous A1B2C3D4" style display

  const message = await prisma.gossipMessage.create({
    data: {
      roomId: room.id,
      content: content.trim(),
      userHash,
    },
  })

  return NextResponse.json({ message })
}
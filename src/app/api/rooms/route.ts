import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const rooms = await prisma.gossipRoom.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { messages: true } } },
  })
  return NextResponse.json({ rooms })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to create a room" }, { status: 401 })
  }

  const { name } = await req.json()

  if (!name || name.trim().length < 3) {
    return NextResponse.json({ error: "Room name must be at least 3 characters" }, { status: 400 })
  }

  const creatorHash = createHash("sha256").update(session.user.email).digest("hex")

  // Generate unique 4-digit room code
  let roomCode = ""
  let attempts = 0
  while (attempts < 10) {
    roomCode = String(Math.floor(1000 + Math.random() * 9000))
    const existing = await prisma.gossipRoom.findUnique({ where: { roomCode } })
    if (!existing) break
    attempts++
  }

  const password = String(Math.floor(1000 + Math.random() * 9000))

  const room = await prisma.gossipRoom.create({
    data: {
      name: name.trim(),
      roomCode,
      password,
      creatorHash,
    },
  })

  return NextResponse.json({ room })
}
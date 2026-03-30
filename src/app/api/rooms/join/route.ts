import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to join a room" }, { status: 401 })
  }

  const { roomCode, password } = await req.json()

  const room = await prisma.gossipRoom.findUnique({ where: { roomCode } })

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 })
  }

  if (room.password !== password) {
    return NextResponse.json({ error: "Wrong password" }, { status: 403 })
  }

  return NextResponse.json({ room })
}
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

  // FIX: private cache (password-protected) with 5s TTL.
  // "private" means Vercel Edge won't share this response between users —
  // each user's password is part of the URL so responses are already scoped,
  // but "private" adds an explicit signal.
  // s-maxage=5 collapses the 3s polling bursts that were visible in the logs:
  // multiple rapid calls within the same 5s window hit the Edge cache instead of DB.
  return NextResponse.json(
    { messages, room },
    {
      headers: {
        "Cache-Control": "private, s-maxage=5, stale-while-revalidate=3",
      },
    }
  )
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
    .slice(0, 8)

  const message = await prisma.gossipMessage.create({
    data: {
      roomId: room.id,
      content: content.trim(),
      userHash,
    },
  })

  return NextResponse.json({ message })
}
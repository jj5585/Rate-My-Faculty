import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"

// We remove 'force-dynamic' to allow the Edge Network to cache the GET response
export async function GET() {
  const now = new Date()

  try {
    const incidents = await prisma.incident.findMany({
      where: {
        expiresAt: { gt: now },
        hidden: false,
      },
      orderBy: { createdAt: "desc" },
      // Limit the number of records to reduce data transfer costs
      take: 50, 
      include: { _count: { select: { reports: true } } },
    })

    return NextResponse.json(
      { incidents },
      {
        headers: {
          // s-maxage=10: Cache on Vercel Edge for 10 seconds
          // stale-while-revalidate: Serve old data for up to 59s while updating in bg
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
        },
      }
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to post" }, { status: 401 })
  }

  try {
    const { content, category } = await req.json()

    if (!content || content.trim().length < 10) {
      return NextResponse.json({ error: "Too short" }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: "Select category" }, { status: 400 })
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
  } catch (error) {
    return NextResponse.json({ error: "Failed to post" }, { status: 500 })
  }
}
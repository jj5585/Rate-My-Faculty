// src/app/api/colleges/[id]/incidents/route.ts
// GET  — fetch active incidents for a specific college
// POST — post an incident scoped to a college

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"

// GET /api/colleges/[id]/incidents
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const now = new Date()

  // Verify college exists and is approved
  const college = await prisma.college.findUnique({
    where: { id, status: "APPROVED" },
    select: { id: true, name: true },
  })

  if (!college) {
    return NextResponse.json({ error: "College not found" }, { status: 404 })
  }

  try {
    const incidents = await prisma.incident.findMany({
      where: {
        collegeId: id,
        expiresAt: { gt: now },
        hidden: false,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { _count: { select: { reports: true } } },
    })

    return NextResponse.json(
      { incidents, college },
      {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
        },
      }
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

// POST /api/colleges/[id]/incidents
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to post" }, { status: 401 })
  }

  const { id } = await params

  // Verify college exists and is approved
  const college = await prisma.college.findUnique({
    where: { id, status: "APPROVED" },
    select: { id: true },
  })

  if (!college) {
    return NextResponse.json({ error: "College not found or not approved" }, { status: 404 })
  }

  try {
    const { content, category } = await req.json()

    if (!content || content.trim().length < 10) {
      return NextResponse.json({ error: "Too short — minimum 10 characters" }, { status: 400 })
    }

    if (!category) {
      return NextResponse.json({ error: "Select a category" }, { status: 400 })
    }

    const userHash = createHash("sha256").update(session.user.email).digest("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const incident = await prisma.incident.create({
      data: {
        content: content.trim(),
        category,
        userHash,
        expiresAt,
        collegeId: id, // scoped to this college
      },
    })

    return NextResponse.json({ incident })
  } catch (error) {
    return NextResponse.json({ error: "Failed to post" }, { status: 500 })
  }
}
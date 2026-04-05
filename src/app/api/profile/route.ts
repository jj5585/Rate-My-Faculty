// src/app/api/profile/route.ts
// GET  — fetch current user's profile
// POST — create or update current user's profile

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      profile: {
        include: {
          college: { select: { id: true, name: true, city: true } },
        },
      },
    },
  })

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    },
    profile: user.profile,
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { displayName, course, graduationYear, collegeId } = await req.json()

  // Validate graduation year
  if (graduationYear) {
    const year = parseInt(graduationYear)
    const currentYear = new Date().getFullYear()
    if (isNaN(year) || year < currentYear || year > currentYear + 10) {
      return NextResponse.json(
        { error: `Graduation year must be between ${currentYear} and ${currentYear + 10}` },
        { status: 400 }
      )
    }
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // Validate college exists and is approved if provided
  if (collegeId) {
    const college = await prisma.college.findUnique({
      where: { id: collegeId, status: "APPROVED" },
    })
    if (!college) {
      return NextResponse.json({ error: "College not found or not approved" }, { status: 404 })
    }
  }

  const profile = await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: {
      displayName: displayName?.trim() || null,
      course: course?.trim() || null,
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      collegeId: collegeId || null,
    },
    create: {
      userId: user.id,
      displayName: displayName?.trim() || null,
      course: course?.trim() || null,
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      collegeId: collegeId || null,
    },
    include: {
      college: { select: { id: true, name: true, city: true } },
    },
  })

  return NextResponse.json({ profile })
}
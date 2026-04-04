// src/app/api/faculty/add/route.ts
// Manually add a faculty member to a college (any signed-in user)

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to add faculty" }, { status: 401 })
  }

  const { name, designation, department, experience, collegeId, profileUrl } = await req.json()

  if (!name || name.trim().length < 2) {
    return NextResponse.json({ error: "Faculty name is required" }, { status: 400 })
  }

  if (!collegeId) {
    return NextResponse.json({ error: "Please select a college" }, { status: 400 })
  }

  // Verify college is approved
  const college = await prisma.college.findUnique({
    where: { id: collegeId, status: "APPROVED" },
  })

  if (!college) {
    return NextResponse.json({ error: "College not found or not yet approved" }, { status: 404 })
  }

  // If profileUrl given, check for duplicates
  if (profileUrl) {
    const existing = await prisma.faculty.findUnique({ where: { profileUrl } })
    if (existing) {
      return NextResponse.json({ success: true, facultyId: existing.id, existing: true })
    }
  }

  // Check by name + college to avoid duplicates
  const nameMatch = await prisma.faculty.findFirst({
    where: {
      name: { equals: name.trim(), mode: "insensitive" },
      collegeId,
    },
  })

  if (nameMatch) {
    return NextResponse.json({
      success: true,
      facultyId: nameMatch.id,
      existing: true,
      message: "This faculty member already exists in the system.",
    })
  }

  const faculty = await prisma.faculty.create({
    data: {
      name: name.trim(),
      designation: designation?.trim() || null,
      department: department?.trim() || null,
      experience: experience?.trim() || null,
      profileUrl: profileUrl?.trim() || null,
      collegeId,
    },
  })

  return NextResponse.json({ success: true, facultyId: faculty.id })
}
// src/app/api/faculty/add/route.ts
// FIX #7: Call revalidatePath after adding faculty so the college page
// ISR cache is immediately invalidated. Without this, a newly added
// faculty member wouldn't appear on the college page for up to 120s.

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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

  const college = await prisma.college.findUnique({
    where: { id: collegeId, status: "APPROVED" },
  })

  if (!college) {
    return NextResponse.json({ error: "College not found or not yet approved" }, { status: 404 })
  }

  if (profileUrl) {
    const existing = await prisma.faculty.findUnique({ where: { profileUrl } })
    if (existing) {
      return NextResponse.json({ success: true, facultyId: existing.id, existing: true })
    }
  }

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

  // FIX #7: Invalidate the college page ISR cache immediately.
  // Without this, the new faculty member wouldn't appear until the 120s
  // revalidate window expires. This makes the update instant.
  revalidatePath(`/colleges/${collegeId}`)

  return NextResponse.json({ success: true, facultyId: faculty.id })
}
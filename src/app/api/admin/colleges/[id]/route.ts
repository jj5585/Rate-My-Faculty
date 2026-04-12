// src/app/api/admin/colleges/[id]/route.ts
// FIX #8: Revalidate homepage ISR cache when a college is approved or rejected.
// Without this, the homepage college list (now ISR-cached) wouldn't update
// for up to 120s after an admin approves a new college submission.

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function assertAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  return user?.isAdmin ? user : null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const { status } = await req.json()

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const college = await prisma.college.update({
    where: { id },
    data: { status },
  })

  // FIX #8: When a college status changes, invalidate the homepage ISR cache
  // so the college list updates immediately without waiting for the 120s TTL.
  revalidatePath("/")

  return NextResponse.json({ college })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params

  await prisma.college.delete({ where: { id } })

  // Invalidate homepage after deletion too
  revalidatePath("/")

  return NextResponse.json({ success: true })
}
// src/app/api/admin/reports/[id]/route.ts
// PATCH — clear just the written comment (keep scores intact)
// DELETE — remove the entire rating

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

async function assertAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  return user?.isAdmin ? user : null
}

// PATCH /api/admin/reports/[id]
// body: { action: "clear_comment" | "dismiss_reports" }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const { action } = await req.json()

  if (action === "clear_comment") {
    // Wipe just the written review text — keep all numeric scores
    await prisma.rating.update({
      where: { id },
      data: { review: null },
    })
    // Also clear all reports on this rating since action was taken
    await prisma.ratingReport.deleteMany({ where: { ratingId: id } })
    return NextResponse.json({ success: true, message: "Comment cleared and reports dismissed." })
  }

  if (action === "dismiss_reports") {
    // Admin reviewed it and decided it's fine — just clear the reports
    await prisma.ratingReport.deleteMany({ where: { ratingId: id } })
    return NextResponse.json({ success: true, message: "Reports dismissed." })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

// DELETE /api/admin/reports/[id] — remove the entire rating + its reports
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params

  // Reports cascade-delete via schema onDelete: Cascade
  await prisma.rating.delete({ where: { id } })

  return NextResponse.json({ success: true, message: "Rating deleted." })
}
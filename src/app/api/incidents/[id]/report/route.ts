import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createHash } from "crypto"
import { prisma } from "@/lib/prisma"

// Auto-hide threshold: hide post after this many unique reports
const REPORT_THRESHOLD = 3

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to report" }, { status: 401 })
  }

  const { id } = await params
  const { reason } = await req.json().catch(() => ({ reason: "inappropriate" }))

  // Unique hash per user per incident — prevents duplicate reports
  const reportHash = createHash("sha256")
    .update(`${session.user.email}:${id}`)
    .digest("hex")

  // Check for existing report from this user
  const existing = await prisma.incidentReport.findUnique({
    where: { reportHash },
  })

  if (existing) {
    return NextResponse.json({ error: "You have already reported this post" }, { status: 409 })
  }

  // Create the report
  await prisma.incidentReport.create({
    data: {
      incidentId: id,
      reportHash,
    },
  })

  // Count total reports for this incident
  const reportCount = await prisma.incidentReport.count({
    where: { incidentId: id },
  })

  // Auto-hide: if threshold reached, mark incident as hidden
  let hidden = false
  if (reportCount >= REPORT_THRESHOLD) {
    await prisma.incident.update({
      where: { id },
      data: { hidden: true },
    })
    hidden = true
  }

  return NextResponse.json({
    success: true,
    reportCount,
    hidden,
    message: hidden
      ? "Post removed after multiple reports. Thank you for keeping the community safe."
      : `Report received. Post will be reviewed. (${reportCount}/${REPORT_THRESHOLD} reports)`,
  })
}

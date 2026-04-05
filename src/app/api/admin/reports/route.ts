// src/app/api/admin/reports/route.ts
// GET all ratings that have been reported, with report count + faculty info

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

export async function GET(req: NextRequest) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Get all ratings that have at least 1 report
  const ratings = await prisma.rating.findMany({
    where: {
      reports: { some: {} }, // has at least one report
    },
    include: {
      faculty: {
        select: {
          id: true,
          name: true,
          department: true,
          college: { select: { name: true } },
        },
      },
      reports: true,
      _count: { select: { reports: true } },
    },
    orderBy: {
      reports: { _count: "desc" }, // most reported first
    },
  })

  return NextResponse.json({ ratings })
}
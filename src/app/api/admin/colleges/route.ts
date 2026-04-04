// src/app/api/admin/colleges/route.ts
// GET all pending college submissions (admin only)

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

async function assertAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  return user?.isAdmin ? user : null
}

export async function GET(req: NextRequest) {
  const admin = await assertAdmin(req)
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") || "PENDING"

  const colleges = await prisma.college.findMany({
    where: { status: status as any },
    include: {
      submittedBy: { select: { email: true, name: true } },
      _count: { select: { faculty: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ colleges })
}
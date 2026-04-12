import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/colleges — approved colleges with faculty + rating counts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""

  const colleges = await prisma.college.findMany({
    where: {
      status: "APPROVED",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { state: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: {
        select: { faculty: true },
      },
    },
    orderBy: {
       faculty: { _count: "desc" },
    },
  })

  // FIX #3: Add Vercel Edge cache headers.
  // Without these, every request hit the serverless function and DB.
  // With these: Vercel Edge serves cached responses; function only runs on cache miss.
  //
  // Search requests (q param) get a shorter TTL since results vary per query.
  // Non-search (homepage list) gets 60s cache — colleges rarely change.
  // stale-while-revalidate means users never wait for a fresh response.
  return NextResponse.json(
    { colleges },
    {
      headers: {
        "Cache-Control": q
          ? "public, s-maxage=10, stale-while-revalidate=30"
          : "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  )
}

// POST /api/colleges — submit a new college for review
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to submit a college" }, { status: 401 })
  }

  const { name, website, emailDomain, city, state, country } = await req.json()

  if (!name || name.trim().length < 3) {
    return NextResponse.json({ error: "College name is too short" }, { status: 400 })
  }

  if (!website || !website.startsWith("http")) {
    return NextResponse.json({ error: "Please provide a valid website URL" }, { status: 400 })
  }

  const existing = await prisma.college.findFirst({
    where: { name: { equals: name.trim(), mode: "insensitive" } },
  })

  if (existing) {
    if (existing.status === "APPROVED") {
      return NextResponse.json({ error: "This college is already on the platform", collegeId: existing.id }, { status: 409 })
    }
    return NextResponse.json({ error: "This college has already been submitted and is pending review" }, { status: 409 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const college = await prisma.college.create({
    data: {
      name: name.trim(),
      website: website.trim(),
      emailDomain: emailDomain?.trim() || null,
      city: city?.trim() || null,
      state: state?.trim() || null,
      country: country?.trim() || "India",
      submittedById: user.id,
    },
  })

  return NextResponse.json({ college, message: "College submitted for review. We'll notify you once it's approved." })
}
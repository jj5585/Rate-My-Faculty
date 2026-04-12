// FIX #4: Converted from "use client" to Server Component.
//
// Before: Page was "use client", called fetchData() in useEffect.
//         Every visit → /api/colleges/[id] → serverless function → DB.
//         Additional burst: useSession() mount → /api/auth/session call.
//
// After:  Data fetched at build/revalidation time via Prisma directly.
//         Zero client-side API calls on page load.
//         Interactive parts (search, sort, add form) isolated in CollegeClientShell.
//
// NOTE: No "use client" at the top — this is intentional.

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import CollegeClientShell from "./CollegeClientShell"

// Revalidate every 2 minutes. College faculty lists change infrequently.
// When a new faculty member is added via /api/faculty/add, you can call
// revalidatePath(`/colleges/${collegeId}`) there to invalidate immediately.
export const revalidate = 120

export default async function CollegePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const college = await prisma.college.findUnique({
    where: { id, status: "APPROVED" },
    include: {
      faculty: {
        include: {
          _count: { select: { ratings: true } },
          ratings: {
            select: {
              teachingClarity: true,
              approachability: true,
              gradingFairness: true,
              punctuality: true,
              partiality: true,
              behaviour: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!college) notFound()

  // Compute averages server-side — no computation in the browser
  const faculty = college.faculty.map((f) => {
    const count = f._count.ratings
    const avg =
      count > 0
        ? (
            f.ratings.reduce(
              (sum, r) =>
                sum +
                (r.teachingClarity + r.approachability + r.gradingFairness +
                  r.punctuality + r.partiality + r.behaviour) / 6,
              0
            ) / count
          ).toFixed(1)
        : null

    return {
      id: f.id,
      name: f.name,
      designation: f.designation,
      department: f.department,
      ratingCount: count,
      avgRating: avg,
    }
  })

  const collegeData = {
    id: college.id,
    name: college.name,
    website: college.website,
    city: college.city,
    state: college.state,
    country: college.country,
    emailDomain: college.emailDomain,
  }

  // Pass pre-computed data as props — client shell renders with no loading state
  return <CollegeClientShell college={collegeData} faculty={faculty} />
}
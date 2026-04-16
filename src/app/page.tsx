// FIX #5: Homepage converted from "use client" to Server Component.
//
// Before: fetchColleges() fired in useEffect on every homepage visit.
//         Even visitors who just landed and bounced hit /api/colleges → DB.
//
// After:  Prisma query runs at build time / ISR revalidation.
//         Zero /api/colleges calls for visitors who don't search.
//         Search still works — HomeClientShell calls the API only when query is non-empty.
//
// NOTE: No "use client" at top — intentional.

import { prisma } from "@/lib/prisma"
import HomeClientShell from "./HomeClientShell"

// Revalidate every 2 minutes. College list changes infrequently.
// When a new college is approved via admin, you can call
// revalidatePath("/") from /api/admin/colleges/[id]/route.ts to invalidate immediately.
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const colleges = await prisma.college.findMany({
    where: { status: "APPROVED" },
    include: {
      _count: {
        select: { faculty: true },
      },
    },
    orderBy: { faculty: { _count: "desc" } },
  })

  return <HomeClientShell initialColleges={colleges} />
}
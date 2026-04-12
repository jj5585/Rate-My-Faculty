import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      facultyId,
      teachingClarity,
      approachability,
      gradingFairness,
      punctuality,
      partiality,
      behaviour,
      review,
    } = body;

    const ratingHash = crypto
      .createHash("sha256")
      .update(session.user.email + facultyId)
      .digest("hex");

    const existing = await prisma.rating.findUnique({
      where: { ratingHash },
    });

    if (existing) {
      return Response.json(
        { error: "You already reviewed this faculty" },
        { status: 400 }
      );
    }

    await prisma.rating.create({
      data: {
        facultyId,
        teachingClarity,
        approachability,
        gradingFairness,
        punctuality,
        partiality,
        behaviour,
        review,
        ratingHash,
      },
    });

    // Purge ISR cache for the faculty page and the global today feed
    // so both update immediately after a new rating is posted.
    revalidatePath(`/faculty/${facultyId}`);
    revalidatePath("/today");

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to submit" }, { status: 500 });
  }
}
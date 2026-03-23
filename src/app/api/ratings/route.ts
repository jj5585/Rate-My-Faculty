import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 🔒 MUST BE LOGGED IN
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

    // 🔐 HASH USER (prevents multiple reviews)
    const ratingHash = crypto
      .createHash("sha256")
      .update(session.user.email + facultyId)
      .digest("hex");

    // 🔥 PREVENT DUPLICATE REVIEWS
    const existing = await prisma.rating.findUnique({
      where: { ratingHash },
    });

    if (existing) {
      return Response.json(
        { error: "You already reviewed this faculty" },
        { status: 400 }
      );
    }

    // ✅ CREATE RATING
    const rating = await prisma.rating.create({
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

    return Response.json({ success: true });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to submit" }, { status: 500 });
  }
}
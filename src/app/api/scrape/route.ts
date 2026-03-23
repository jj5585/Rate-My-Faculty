import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || !url.includes("srmist.edu.in/faculty")) {
      return NextResponse.json({ error: "Invalid SRMIST faculty URL" }, { status: 400 });
    }

    const existing = await prisma.faculty.findUnique({ where: { profileUrl: url } });
    if (existing) return NextResponse.json(existing);

    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const name = $("h1").first().text().trim();
    const designation = $(".faculty-designation").first().text().trim() || "Assistant Professor";
    const department = $(".faculty-dept").first().text().trim() || "Computing Technologies";
    const photoUrl = $(".faculty-image img").attr("src") || 
                     "https://www.srmist.edu.in/wp-content/uploads/2023/01/default-profile.jpg";

    const faculty = await prisma.faculty.create({
      data: { name, designation, department, profileUrl: url, photoUrl },
    });

    return NextResponse.json(faculty);
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json({ error: "Failed to parse profile" }, { status: 500 });
  }
}
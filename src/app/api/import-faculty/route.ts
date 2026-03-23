import { prisma } from "@/lib/prisma";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || !url.includes("srmist.edu.in/faculty")) {
      return Response.json({ error: "Invalid SRMIST faculty URL" }, { status: 400 });
    }

    const existing = await prisma.faculty.findUnique({ where: { profileUrl: url } });
    if (existing) return Response.json({ success: true, facultyId: existing.id });

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0",
      },
    });

    if (!res.ok) {
      return Response.json({ error: `Failed to fetch page: ${res.status}` }, { status: 422 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Name is in h2 — filter out nav/menu items
    const name = $("h2").filter((_, el) => {
      const text = $(el).text().trim();
      return text.length > 2 && text.length < 80 &&
        !text.toLowerCase().includes("article") &&
        !text.toLowerCase().includes("srm");
    }).first().text().trim();

    if (!name) {
      return Response.json({ error: "Could not extract faculty name — page may have blocked access" }, { status: 422 });
    }

    const designation = $("li")
      .filter((_, el) => /professor|lecturer|scientist/i.test($(el).text()))
      .first().text().trim() || "Faculty";

    // Campus text looks like: "Department of Computing Technologies, Faculty of..."
    const campusText = $("*:contains('CAMPUS')").first().text();
    const deptMatch = campusText.match(/Department of ([^,]+)/);
    const department = deptMatch ? `Department of ${deptMatch[1].trim()}` : $("a[href*='department']").first().text().trim() || "SRMIST";
    const expText = $("*:contains('years of experience')").first().text();
    const expMatch = expText.match(/(\d+)\s*years/);
    const experience = expMatch ? `${expMatch[1]} years` : null;

    // Photo from CSS style block
    let photoUrl: string | null = null;
    $("style").each((_, el) => {
      const css = $(el).html() || "";
      const match = css.match(/url\(['"]?(https?:\/\/[^'")]+)['"]?\)/);
      if (match) { photoUrl = match[1]; return false; }
    });
    if (!photoUrl) {
      photoUrl = $("img[src*='wp-content']").first().attr("src") || null;
    }

    console.log("SCRAPED:", { name, designation, department, experience, photoUrl });

    const faculty = await prisma.faculty.upsert({
      where: { profileUrl: url },
      update: { name, designation, department, experience, photoUrl },
      create: { name, designation, department, experience, photoUrl, profileUrl: url },
    });

    return Response.json({ success: true, facultyId: faculty.id });

  } catch (error) {
    console.error("IMPORT ERROR:", error);
    return Response.json({ error: "Failed to import faculty" }, { status: 500 });
  }
}
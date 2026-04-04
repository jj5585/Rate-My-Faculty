// scripts/seed-migration.ts
// Run with: npx ts-node --project tsconfig.json scripts/seed-migration.ts
// Or: npx tsx scripts/seed-migration.ts
//
// This script:
// 1. Creates SRMIST as an approved College entry
// 2. Links all existing Faculty records (with null collegeId) to SRMIST
// 3. Sets your account as admin (update YOUR_EMAIL below)

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// ⚠️  UPDATE THIS to your Google login email
const ADMIN_EMAIL = "joeljoby999@gmail.com"

async function main() {
  console.log("🚀 Starting seed migration...\n")

  // 1. Make yourself admin
  const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (!user) {
    console.warn(`⚠️  User ${ADMIN_EMAIL} not found — sign in at least once first, then re-run.`)
  } else {
    await prisma.user.update({ where: { email: ADMIN_EMAIL }, data: { isAdmin: true } })
    console.log(`✅ Admin granted to ${ADMIN_EMAIL}`)
  }

  // 2. Upsert SRMIST college
  const srmist = await prisma.college.upsert({
    where: {
      // We'll use a unique name check via findFirst + create pattern
      // (College doesn't have a @unique on name, so use upsert with a dummy unique or just create)
      id: "srmist-kattankulathur",
    },
    update: {
      name: "SRMIST Kattankulathur",
      website: "https://www.srmist.edu.in",
      emailDomain: "srmist.edu.in",
      city: "Kattankulathur",
      state: "Tamil Nadu",
      country: "India",
      status: "APPROVED",
    },
    create: {
      id: "srmist-kattankulathur",  // stable ID so we can reference it
      name: "SRMIST Kattankulathur",
      website: "https://www.srmist.edu.in",
      emailDomain: "srmist.edu.in",
      city: "Kattankulathur",
      state: "Tamil Nadu",
      country: "India",
      status: "APPROVED",
      submittedById: user?.id ?? (await prisma.user.findFirst())?.id ?? (() => { throw new Error("No users in DB") })(),
    },
  })
  console.log(`✅ SRMIST college upserted (id: ${srmist.id})`)

  // 3. Link all orphaned faculty (null collegeId) to SRMIST
  const updated = await prisma.faculty.updateMany({
    where: { collegeId: null },
    data: { collegeId: srmist.id },
  })
  console.log(`✅ Linked ${updated.count} existing faculty records to SRMIST`)

  console.log("\n🎉 Migration complete!")
  console.log("   Run `npx prisma db push` to apply schema changes, then run this script.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
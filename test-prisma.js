import "dotenv/config"
import pkg from "@prisma/client"

const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function test() {
  const data = await prisma.faculty.findMany()
  console.log(data)
}

test()
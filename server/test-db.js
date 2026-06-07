const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const passports = await prisma.passport.findMany({ include: { stamps: true } });
  console.log("Passports:", JSON.stringify(passports, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());

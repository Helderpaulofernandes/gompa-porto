import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const anu = await prisma.teacher.findFirst({ where: { name: "Anu Biak" } });
  if (!anu) {
    await prisma.teacher.create({ data: { name: "Anu Biak" } });
    console.log("Criado professor: Anu Biak");
  }

  const sonia = await prisma.teacher.findFirst({ where: { name: "Sónia" } });
  if (!sonia) {
    await prisma.teacher.create({ data: { name: "Sónia" } });
    console.log("Criado professor: Sónia");
  }

  const room = await prisma.room.findFirst({ where: { name: "Sala de Terapias" } });
  if (!room) {
    await prisma.room.create({ data: { name: "Sala de Terapias" } });
    console.log("Criada sala: Sala de Terapias");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const anu = await prisma.teacher.findFirst({ where: { name: "Anu Biak" } });
  if (anu) {
    await prisma.teacher.update({
      where: { id: anu.id },
      data: { services: ["terapia-do-som", "tsa-lung-healing"] },
    });
    console.log("Atualizado Anu Biak: terapia-do-som, tsa-lung-healing");
  }

  const sonia = await prisma.teacher.findFirst({ where: { name: "Sónia" } });
  if (sonia) {
    await prisma.teacher.update({
      where: { id: sonia.id },
      data: { services: ["massagem-shiatsu"] },
    });
    console.log("Atualizado Sónia: massagem-shiatsu");
  }

  const groupRoom = await prisma.room.findFirst({ where: { name: "Salao de Grupo" } });
  if (groupRoom) {
    const result = await prisma.classDefinition.updateMany({
      where: { slug: { in: ["yoga-tibetano", "pratica-meditacao"] } },
      data: { roomId: groupRoom.id },
    });
    console.log(`Aulas associadas a "Salao de Grupo": ${result.count}`);
  } else {
    console.log('Sala "Salao de Grupo" não encontrada — sem associação de sala às aulas.');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

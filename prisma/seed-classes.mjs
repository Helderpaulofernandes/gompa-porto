import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function ensureClass({ slug, name, description, capacity, dropInPriceCents, durationMinutes, slots }) {
  const existing = await prisma.classDefinition.findUnique({ where: { slug } });
  if (existing) {
    console.log(`Já existe: ${name}`);
    return;
  }
  await prisma.classDefinition.create({
    data: {
      slug,
      name,
      description,
      capacity,
      dropInPriceCents,
      durationMinutes,
      slots: { create: slots },
    },
  });
  console.log(`Criada aula: ${name}`);
}

async function main() {
  await ensureClass({
    slug: "yoga-tibetano",
    name: "Yoga Tibetano",
    description:
      "Prática de yoga tibetano orientada para o equilíbrio entre corpo, energia e mente, incluindo movimentos suaves, respiração e relaxamento.",
    capacity: 14,
    dropInPriceCents: 900,
    durationMinutes: 90,
    slots: [
      { weekday: 2, time: "19:30" },
      { weekday: 4, time: "19:30" },
      { weekday: 6, time: "10:00" },
    ],
  });

  await ensureClass({
    slug: "pratica-meditacao",
    name: "Prática de Meditação",
    description: "Sessão semanal de meditação guiada, aberta a iniciantes e praticantes com experiência.",
    capacity: 14,
    dropInPriceCents: 900,
    durationMinutes: 60,
    slots: [{ weekday: 3, time: "19:30" }],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });

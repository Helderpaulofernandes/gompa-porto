import { prisma } from "@/lib/prisma";

export type ClassSlot = { weekday: number | null; specificDate: Date | null; time: string };

const WEEKDAY_NAMES_PT = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

/**
 * Aulas com horário semanal fixo e calendário de reserva são geridas
 * inteiramente em /admin (tabelas ClassDefinition / ClassSlotDef) — não há
 * mais nenhuma lista fixa no código. `dropInPriceCents` de cada aula deve
 * ficar ~15% acima do valor por aula do plano mais barato (ver plans.ts),
 * para que a assinatura seja sempre a opção mais vantajosa.
 */
export async function getActiveClasses() {
  return prisma.classDefinition.findMany({
    where: { active: true },
    include: { slots: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAllClasses() {
  return prisma.classDefinition.findMany({
    include: { slots: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getClassBySlug(slug: string) {
  return prisma.classDefinition.findUnique({ where: { slug }, include: { slots: true } });
}

export function scheduleTextFromSlots(slots: ClassSlot[]): string {
  return slots
    .slice()
    .sort((a, b) => {
      const aKey = a.weekday ?? (a.specificDate?.getTime() ?? 0);
      const bKey = b.weekday ?? (b.specificDate?.getTime() ?? 0);
      return aKey - bKey || a.time.localeCompare(b.time);
    })
    .map((s) =>
      s.weekday !== null
        ? `${WEEKDAY_NAMES_PT[s.weekday]}, ${s.time}`
        : `${s.specificDate?.toLocaleDateString("pt-PT", { day: "numeric", month: "long" })}, ${s.time}`
    )
    .join(" · ");
}

export function slugify(name: string): string {
  const withoutDiacritics = Array.from(name.normalize("NFD"))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < 0x0300 || code > 0x036f; // strip Unicode combining marks
    })
    .join("");
  return withoutDiacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "aula";
  let candidate = base;
  let i = 2;
  while (await prisma.classDefinition.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${i}`;
    i++;
  }
  return candidate;
}

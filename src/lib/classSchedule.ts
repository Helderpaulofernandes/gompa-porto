import { prisma } from "@/lib/prisma";

/**
 * Horário estruturado das aulas com calendário de reserva de lugar.
 * weekday: 0 = domingo ... 6 = sábado. time: "HH:mm".
 *
 * defaultCapacity é usada até haver um valor definido no painel /admin
 * (tabela ClassConfig) — depois disso, o valor do admin tem prioridade.
 *
 * dropInPriceCents é o preço de reservar UMA aula avulsa neste calendário.
 * Está calculado ~15% acima do valor por aula do plano "Iniciante"
 * (30€ / 4 aulas = 7,50€ → +15% = 8,63€, arredondado a 9,00€), para que
 * reservar aula a aula fique sempre mais caro do que assinar um plano.
 * Ajuste livremente em conjunto com plans.ts.
 */
export type WeeklySlot = { weekday: number; time: string };

export type ClassScheduleDef = {
  slug: string;
  defaultCapacity: number;
  slots: WeeklySlot[];
  dropInPriceCents: number;
  durationMinutes: number;
};

export const classSchedules: ClassScheduleDef[] = [
  {
    slug: "yoga-tibetano",
    defaultCapacity: 14,
    slots: [
      { weekday: 2, time: "19:30" }, // terça
      { weekday: 4, time: "19:30" }, // quinta
      { weekday: 6, time: "10:00" }, // sábado
    ],
    dropInPriceCents: 900,
    durationMinutes: 90,
  },
  {
    slug: "pratica-meditacao",
    defaultCapacity: 14,
    slots: [
      { weekday: 3, time: "19:30" }, // quarta
    ],
    dropInPriceCents: 900,
    durationMinutes: 60,
  },
];

export function getClassSchedule(slug: string) {
  return classSchedules.find((c) => c.slug === slug);
}

/**
 * Capacidade efetiva de uma aula: o valor definido no painel /admin, se
 * existir, caso contrário o defaultCapacity definido acima no código.
 */
export async function getEffectiveCapacity(slug: string): Promise<number> {
  const override = await prisma.classConfig.findUnique({ where: { slug } });
  if (override) return override.capacity;
  return getClassSchedule(slug)?.defaultCapacity ?? 0;
}

export async function getAllEffectiveCapacities(): Promise<Record<string, number>> {
  const overrides = await prisma.classConfig.findMany();
  const overrideMap = new Map(overrides.map((o) => [o.slug, o.capacity]));
  const result: Record<string, number> = {};
  for (const schedule of classSchedules) {
    result[schedule.slug] = overrideMap.get(schedule.slug) ?? schedule.defaultCapacity;
  }
  return result;
}

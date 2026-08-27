import { prisma } from "@/lib/prisma";

export type ServiceCategory = "aula" | "terapia" | "evento" | "curso";

export type Service = {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  schedule: string;
  duration: string | null;
  priceLabel: string;
  description: string;
  bookable: boolean;
  active: boolean;
  photo: string | null;
  priceCents: number | null;
  durationMinutes: number | null;
};

export const categoryLabels: Record<ServiceCategory, string> = {
  aula: "Aulas Regulares",
  terapia: "Terapias",
  evento: "Eventos Mensais",
  curso: "Cursos e Retiros",
};

function toService<T extends { category: string }>(row: T): T & { category: ServiceCategory } {
  return row as T & { category: ServiceCategory };
}

/** Todos os serviços — incluindo inativos — para o backoffice. */
export async function getAllServices(): Promise<Service[]> {
  const rows = await prisma.service.findMany({ orderBy: { createdAt: "asc" } });
  return rows.map(toService);
}

/** Serviços visíveis publicamente (o que aparece no site). */
export async function getActiveServices(): Promise<Service[]> {
  const rows = await prisma.service.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
  return rows.map(toService);
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const row = await prisma.service.findUnique({ where: { slug } });
  return row ? toService(row) : null;
}

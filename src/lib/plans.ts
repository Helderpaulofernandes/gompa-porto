/**
 * Planos de membro/assinatura. Preços PROVISÓRIOS — a rever antes de publicar.
 */
export type Plan = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: "eur";
  interval: "month";
  features: string[];
  highlighted?: boolean;
  provisional: boolean;
};

export const plans: Plan[] = [
  {
    slug: "iniciante",
    name: "Iniciante",
    description: "Para quem está a começar a prática.",
    priceCents: 3000,
    currency: "eur",
    interval: "month",
    features: ["4 aulas por mês (Yoga Tibetano ou Meditação)", "Acesso à comunidade Gompa Porto"],
    provisional: true,
  },
  {
    slug: "ilimitado",
    name: "Ilimitado",
    description: "Acesso ilimitado às aulas semanais.",
    priceCents: 5500,
    currency: "eur",
    interval: "month",
    features: [
      "Aulas ilimitadas de Yoga Tibetano e Meditação",
      "Prioridade de inscrição em workshops",
      "Acesso à comunidade Gompa Porto",
    ],
    highlighted: true,
    provisional: true,
  },
  {
    slug: "comunidade",
    name: "Comunidade",
    description: "O plano completo, com terapias e eventos incluídos.",
    priceCents: 8000,
    currency: "eur",
    interval: "month",
    features: [
      "Aulas ilimitadas de Yoga Tibetano e Meditação",
      "Desconto em terapias individuais",
      "Acesso gratuito aos eventos mensais",
    ],
    provisional: true,
  },
];

export function getPlanBySlug(slug: string) {
  return plans.find((p) => p.slug === slug);
}

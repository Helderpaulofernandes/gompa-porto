/**
 * Preços provisórios das terapias com reserva por calendário (placeholder —
 * substitua pelos valores reais). Usa-se o mesmo valor do antigo voucher de
 * terapia individual como ponto de partida.
 */
export const therapyPricing: Record<string, number> = {
  "terapia-do-som": 3500,
  "tsa-lung-healing": 3500,
  "massagem-shiatsu": 3500,
};

export function getTherapyPriceCents(slug: string): number | undefined {
  return therapyPricing[slug];
}

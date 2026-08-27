/**
 * Preços e durações provisórios das terapias com reserva por calendário
 * (placeholder — substitua pelos valores reais).
 */
export type TherapyConfig = { priceCents: number; durationMinutes: number };

export const therapyPricing: Record<string, TherapyConfig> = {
  "terapia-do-som": { priceCents: 3500, durationMinutes: 60 },
  "tsa-lung-healing": { priceCents: 3500, durationMinutes: 60 },
  "massagem-shiatsu": { priceCents: 3500, durationMinutes: 45 },
  "auriculoterapia": { priceCents: 3500, durationMinutes: 45 },
  "reflexologia": { priceCents: 3500, durationMinutes: 45 },
};

export function getTherapyPriceCents(slug: string): number | undefined {
  return therapyPricing[slug]?.priceCents;
}

export function getTherapyDurationMinutes(slug: string): number | undefined {
  return therapyPricing[slug]?.durationMinutes;
}

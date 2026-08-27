/**
 * Catálogo da loja. Os preços abaixo são PROVISÓRIOS (marcados com *) —
 * substitua pelos valores reais antes de publicar o site.
 * Os pagamentos são processados diretamente pelo Stripe Checkout,
 * sem necessidade de criar produtos no dashboard do Stripe.
 */
export type Product = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: "eur";
  provisional: boolean;
};

export const products: Product[] = [
  {
    slug: "pack-5-aulas",
    name: "Pack de 5 Aulas",
    description: "5 aulas de Yoga Tibetano e/ou Prática de Meditação, a usar em 2 meses.",
    priceCents: 4500,
    currency: "eur",
    provisional: true,
  },
  {
    slug: "pack-10-aulas",
    name: "Pack de 10 Aulas",
    description: "10 aulas de Yoga Tibetano e/ou Prática de Meditação, a usar em 3 meses.",
    priceCents: 8000,
    currency: "eur",
    provisional: true,
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function formatPrice(cents: number, currency: string = "EUR") {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency }).format(cents / 100);
}

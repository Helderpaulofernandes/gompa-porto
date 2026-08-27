import type { Metadata } from "next";
import { products, formatPrice } from "@/lib/products";
import { site } from "@/lib/site";
import BuyButton from "@/components/BuyButton";

export const metadata: Metadata = {
  title: `Loja — ${site.name}`,
};

export default function LojaPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Loja</p>
      <h1 className="mt-2 text-4xl font-semibold text-maroon">Aulas e Vouchers</h1>
      <p className="mt-4 max-w-2xl text-ink/70">
        Compre packs de aulas ou um voucher de terapia. Pagamento seguro através do Stripe.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {products.map((p) => (
          <div key={p.slug} className="flex flex-col rounded-2xl border border-gold/30 bg-white p-6">
            <h2 className="text-lg font-semibold text-maroon">{p.name}</h2>
            <p className="mt-2 flex-1 text-sm text-ink/70">{p.description}</p>
            <p className="mt-4 text-2xl font-semibold text-ink">
              {formatPrice(p.priceCents)}
              {p.provisional && <span className="ml-1 text-sm font-normal text-gold">*</span>}
            </p>
            <div className="mt-4">
              <BuyButton slug={p.slug} endpoint="produto" />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-ink/50">
        * Valores provisórios, sujeitos a confirmação.
      </p>
    </div>
  );
}

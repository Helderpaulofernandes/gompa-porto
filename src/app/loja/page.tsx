import type { Metadata } from "next";
import Image from "next/image";
import { products, formatPrice } from "@/lib/products";
import { site } from "@/lib/site";
import BuyButton from "@/components/BuyButton";

export const metadata: Metadata = {
  title: `Loja — ${site.name}`,
};

export default function LojaPage() {
  return (
    <div>
      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <Image
          src="/images/ganta-dorja.jpg"
          alt="Sino (ghanta) e dorje ritual tibetano"
          fill
          priority
          className="object-cover object-[50%_30%]"
        />
        <div className="absolute inset-0 bg-maroon/70" />
        <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-center px-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-light">Loja</p>
          <h1 className="mt-2 text-4xl font-semibold text-cream">Aulas e Vouchers</h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16">
        <p className="max-w-2xl text-ink/70">
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
    </div>
  );
}

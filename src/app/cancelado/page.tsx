import Link from "next/link";
import { site } from "@/lib/site";

export const metadata = { title: `Pagamento Cancelado — ${site.name}` };

export default function CanceladoPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold text-maroon">Pagamento cancelado</h1>
      <p className="mt-4 text-ink/70">
        Não se preocupe, não foi efetuado nenhum pagamento. Pode tentar novamente quando quiser.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/loja"
          className="rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-cream hover:bg-maroon-dark"
        >
          Voltar à loja
        </Link>
        <Link
          href="/"
          className="rounded-full border border-maroon px-6 py-2.5 text-sm font-semibold text-maroon hover:bg-maroon hover:text-cream"
        >
          Início
        </Link>
      </div>
    </div>
  );
}

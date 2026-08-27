import Link from "next/link";
import { site } from "@/lib/site";

export const metadata = { title: `Pagamento Concluído — ${site.name}` };

export default function SucessoPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold text-maroon">Pagamento concluído com sucesso!</h1>
      <p className="mt-4 text-ink/70">
        Obrigado. Receberá em breve um email de confirmação do Stripe. Se tiver alguma dúvida,
        contacte-nos em{" "}
        <a href={`mailto:${site.email}`} className="font-semibold text-maroon hover:underline">
          {site.email}
        </a>
        .
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-cream hover:bg-maroon-dark"
      >
        Voltar ao início
      </Link>
    </div>
  );
}

import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Marcações — ${site.name}`,
};

export default async function MarcacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ servico?: string }>;
}) {
  const { servico } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Marcações</p>
      <h1 className="mt-2 text-4xl font-semibold text-maroon">Marcar uma Sessão</h1>
      <p className="mt-4 text-ink/70">
        Preencha o formulário abaixo com o serviço pretendido e os seus dados. Entraremos em
        contacto para confirmar disponibilidade.
      </p>

      <div className="mt-8">
        <BookingForm initialSlug={servico} />
      </div>
    </div>
  );
}

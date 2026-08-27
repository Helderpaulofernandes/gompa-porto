import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import { site } from "@/lib/site";
import { getActiveClasses } from "@/lib/classSchedule";
import { getActiveServices } from "@/lib/services";

export const metadata: Metadata = {
  title: `Marcações — ${site.name}`,
};

export default async function MarcacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ servico?: string }>;
}) {
  const { servico } = await searchParams;
  const [classes, services] = await Promise.all([getActiveClasses(), getActiveServices()]);

  const smartRoutes: Record<string, "aula" | "evento" | "terapia"> = {};
  for (const c of classes) {
    if (!c.publicCalendar) continue;
    smartRoutes[c.slug] = c.recurring ? "aula" : "evento";
  }
  for (const s of services) {
    if (s.category === "terapia" && s.priceCents && s.durationMinutes) smartRoutes[s.slug] = "terapia";
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Marcações</p>
      <h1 className="mt-2 text-4xl font-semibold text-maroon">Marcar uma Sessão</h1>
      <p className="mt-4 text-ink/70">
        Aulas e terapias com calendário próprio reservam-se diretamente com pagamento online.
        Para as restantes ofertas, envie um pedido abaixo e entraremos em contacto para
        confirmar disponibilidade.
      </p>

      <div className="mt-8">
        <BookingForm initialSlug={servico} smartRoutes={smartRoutes} services={services} />
      </div>
    </div>
  );
}

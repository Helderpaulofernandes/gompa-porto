import { isAdminAuthenticated } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import AdminLoginForm from "@/components/AdminLoginForm";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { formatPrice } from "@/lib/products";
import { getServiceBySlug } from "@/lib/services";
import { formatLisbon } from "@/lib/occurrences";
import { classSchedules, getAllEffectiveCapacities } from "@/lib/classSchedule";
import AdminClassCapacity from "@/components/AdminClassCapacity";

export const metadata = { title: "Admin — Gompa Porto" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <div className="px-4">
        <AdminLoginForm />
      </div>
    );
  }

  const [bookings, orders, reservations, capacities] = await Promise.all([
    prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.seatReservation.findMany({
      where: { classDate: { gte: new Date() } },
      orderBy: { classDate: "asc" },
      take: 100,
    }),
    getAllEffectiveCapacities(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-maroon">Painel Administrativo</h1>
        <AdminLogoutButton />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-ink">Capacidade das Aulas</h2>
        <p className="mt-1 text-sm text-ink/60">
          Número máximo de lugares por aula, usado no calendário de reserva em /horarios.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {classSchedules.map((c) => (
            <AdminClassCapacity
              key={c.slug}
              slug={c.slug}
              name={getServiceBySlug(c.slug)?.name ?? c.slug}
              capacity={capacities[c.slug] ?? c.defaultCapacity}
            />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink">Marcações ({bookings.length})</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-gold/30">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-cream text-ink/60">
              <tr>
                <th className="px-4 py-3">Data pedido</th>
                <th className="px-4 py-3">Serviço</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Preferência</th>
                <th className="px-4 py-3">Mensagem</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-gold/20">
                  <td className="px-4 py-3 whitespace-nowrap">{formatLisbon(b.createdAt)}</td>
                  <td className="px-4 py-3">{b.serviceName}</td>
                  <td className="px-4 py-3">{b.name}</td>
                  <td className="px-4 py-3">
                    <div>{b.email}</div>
                    {b.phone && <div className="text-ink/60">{b.phone}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {b.preferredDate || "—"} {b.preferredTime || ""}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate" title={b.notes ?? undefined}>
                    {b.notes || "—"}
                  </td>
                  <td className="px-4 py-3">{b.status}</td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-ink/50">
                    Sem marcações ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink">Reservas de Lugar ({reservations.length})</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-gold/30">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-cream text-ink/60">
              <tr>
                <th className="px-4 py-3">Aula</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-t border-gold/20">
                  <td className="px-4 py-3">{getServiceBySlug(r.classSlug)?.name ?? r.classSlug}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatLisbon(r.classDate)}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3">
                    <div>{r.email}</div>
                    {r.phone && <div className="text-ink/60">{r.phone}</div>}
                  </td>
                  <td className="px-4 py-3">
                    {r.paymentType === "membership" ? `Assinatura (${r.planSlug})` : "Aula avulsa"}
                  </td>
                  <td className="px-4 py-3">{r.status}</td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-ink/50">
                    Sem reservas de lugar futuras ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink">Pagamentos ({orders.length})</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-gold/30">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-cream text-ink/60">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-gold/20">
                  <td className="px-4 py-3 whitespace-nowrap">{formatLisbon(o.createdAt)}</td>
                  <td className="px-4 py-3">{o.description}</td>
                  <td className="px-4 py-3">
                    <div>{o.customerName || "—"}</div>
                    <div className="text-ink/60">{o.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3">{formatPrice(o.amountTotal, o.currency.toUpperCase())}</td>
                  <td className="px-4 py-3">{o.mode === "subscription" ? "Assinatura" : "Compra"}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-ink/50">
                    Sem pagamentos registados ainda (requer configuração do webhook do Stripe).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

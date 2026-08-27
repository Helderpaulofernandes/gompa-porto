import { isAdminAuthenticated } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import AdminLoginForm from "@/components/AdminLoginForm";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import { formatPrice } from "@/lib/products";
import { getAllServices } from "@/lib/services";
import { formatLisbon } from "@/lib/occurrences";
import { getAllClasses } from "@/lib/classSchedule";
import AdminClassManager from "@/components/AdminClassManager";
import AdminTherapyManager from "@/components/AdminTherapyManager";
import AdminServiceManager from "@/components/AdminServiceManager";
import AdminRemoveSlotButton from "@/components/AdminRemoveSlotButton";
import AdminAgenda from "@/components/AdminAgenda";

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

  const [bookings, orders, reservations, classes, teachers, rooms, therapySlots, windows, settingsRow, allServices] =
    await Promise.all([
      prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.seatReservation.findMany({
        where: { classDate: { gte: new Date() } },
        orderBy: { classDate: "asc" },
        take: 100,
      }),
      getAllClasses(),
      prisma.teacher.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.room.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.therapySlot.findMany({
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
        include: { teacher: true, room: true },
        take: 100,
      }),
      prisma.availabilityWindow.findMany({
        include: { teacher: true, room: true },
        orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
      }),
      prisma.therapySettings.findUnique({ where: { id: "singleton" } }),
      getAllServices(),
    ]);

  const settings = settingsRow ?? { breakMinutes: 15, lunchStart: null, lunchEnd: null };

  const therapyServices = allServices
    .filter((s) => s.category === "terapia" && s.active)
    .map((s) => ({ slug: s.slug, name: s.name }));

  const bookableServices = allServices
    .filter((s) => s.category !== "terapia" && s.active)
    .map((s) => ({ slug: s.slug, name: s.name, description: s.description, category: s.category }));

  const serviceNameBySlug = new Map(allServices.map((s) => [s.slug, s.name]));
  const classNameBySlug = new Map(classes.map((c) => [c.slug, c.name]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-maroon">Painel Administrativo</h1>
        <AdminLogoutButton />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-ink">Agenda</h2>
        <p className="mt-1 text-sm text-ink/60">
          O que está agendado, quando, com quem e quantas pessoas — por professor ou por sala,
          juntando aulas de grupo e terapias.
        </p>
        <div className="mt-4">
          <AdminAgenda
            teachers={teachers.filter((t) => t.active).map((t) => ({ id: t.id, name: t.name }))}
            rooms={rooms.filter((r) => r.active).map((r) => ({ id: r.id, name: r.name }))}
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink">Aulas Semanais</h2>
        <p className="mt-1 text-sm text-ink/60">
          Crie novas aulas, ajuste lugares/preço das existentes, ou gira os horários semanais.
          Aparecem de imediato no calendário de reserva em /horarios.
        </p>
        <div className="mt-4">
          <AdminClassManager classes={classes} rooms={rooms} teachers={teachers} services={bookableServices} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink">Serviços</h2>
        <p className="mt-1 text-sm text-ink/60">
          Nome, descrição, preço (texto), imagem e (para terapias) o preço/duração reais usados no
          pagamento online. Aparecem em /terapias, /horarios, /cursos-e-retiros e /marcacoes.
        </p>
        <div className="mt-4">
          <AdminServiceManager services={allServices} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-ink">Terapias — Professores, Salas e Horários</h2>
        <p className="mt-1 text-sm text-ink/60">
          Crie horários disponíveis para as terapias; ficam visíveis em /terapias e são
          reservados automaticamente quando alguém paga.
        </p>
        <div className="mt-4">
          <AdminTherapyManager
            teachers={teachers}
            rooms={rooms}
            therapyServices={therapyServices}
            windows={windows}
            settings={settings}
          />
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-gold/30">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-cream text-ink/60">
              <tr>
                <th className="px-4 py-3">Terapia</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Professor</th>
                <th className="px-4 py-3">Sala</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {therapySlots.map((s) => (
                <tr key={s.id} className="border-t border-gold/20">
                  <td className="px-4 py-3">{serviceNameBySlug.get(s.serviceSlug) ?? s.serviceSlug}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatLisbon(s.date)}</td>
                  <td className="px-4 py-3">{s.teacher.name}</td>
                  <td className="px-4 py-3">{s.room.name}</td>
                  <td className="px-4 py-3">
                    {s.clientName ? (
                      <>
                        <div>{s.clientName}</div>
                        <div className="text-ink/60">{s.clientEmail}</div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">{s.status}</td>
                  <td className="px-4 py-3">
                    <AdminRemoveSlotButton id={s.id} />
                  </td>
                </tr>
              ))}
              {therapySlots.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-ink/50">
                    Sem horários de terapia criados ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                  <td className="px-4 py-3">{classNameBySlug.get(r.classSlug) ?? r.classSlug}</td>
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

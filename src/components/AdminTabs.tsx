"use client";

import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/products";
import { formatLisbon } from "@/lib/occurrences";
import type { Service, ServiceCategory } from "@/lib/services";
import AdminAgenda from "@/components/AdminAgenda";
import AdminClassList from "@/components/AdminClassList";
import AdminClassCreator from "@/components/AdminClassCreator";
import AdminServiceManager from "@/components/AdminServiceManager";
import AdminTherapyManager from "@/components/AdminTherapyManager";
import AdminRemoveSlotButton from "@/components/AdminRemoveSlotButton";

type Slot = { id: string; weekday: number | null; specificDate: Date | null; time: string };
type ClassDef = {
  id: string;
  slug: string;
  name: string;
  description: string;
  capacity: number;
  dropInPriceCents: number;
  durationMinutes: number;
  active: boolean;
  recurring: boolean;
  endDate: Date | null;
  publicCalendar: boolean;
  roomId: string | null;
  teacherId: string | null;
  slots: Slot[];
};
type Teacher = { id: string; name: string; active: boolean; services: string[] };
type Room = { id: string; name: string; active: boolean };
type TherapySlotRow = {
  id: string;
  serviceSlug: string;
  date: Date;
  status: string;
  clientName: string | null;
  clientEmail: string | null;
  teacher: { name: string };
  room: { name: string };
};
type Window = {
  id: string;
  teacherId: string;
  roomId: string;
  weekday: number;
  startTime: string;
  endTime: string;
  teacher: { name: string };
  room: { name: string };
};
type Settings = { breakMinutes: number; lunchStart: string | null; lunchEnd: string | null };
type Booking = {
  id: string;
  createdAt: Date;
  serviceName: string;
  name: string;
  email: string;
  phone: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  notes: string | null;
  status: string;
};
type Order = {
  id: string;
  createdAt: Date;
  description: string;
  customerName: string | null;
  customerEmail: string | null;
  amountTotal: number;
  currency: string;
  mode: string;
};
type SeatReservation = {
  id: string;
  classSlug: string;
  classDate: Date;
  name: string;
  email: string;
  phone: string | null;
  paymentType: string;
  planSlug: string | null;
  status: string;
};

const TABS = [
  { key: "agenda", label: "Agenda" },
  { key: "aulas", label: "Aulas Semanais" },
  { key: "criar", label: "Criar Nova Aula / Evento" },
  { key: "servicos", label: "Serviços" },
  { key: "terapias", label: "Terapias" },
  { key: "registos", label: "Registos" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function AdminTabs({
  bookings,
  orders,
  reservations,
  classes,
  teachers,
  rooms,
  therapySlots,
  windows,
  settings,
  allServices,
}: {
  bookings: Booking[];
  orders: Order[];
  reservations: SeatReservation[];
  classes: ClassDef[];
  teachers: Teacher[];
  rooms: Room[];
  therapySlots: TherapySlotRow[];
  windows: Window[];
  settings: Settings;
  allServices: Service[];
}) {
  const [tab, setTab] = useState<TabKey>("agenda");

  const therapyServices = useMemo(
    () => allServices.filter((s) => s.category === "terapia" && s.active).map((s) => ({ slug: s.slug, name: s.name })),
    [allServices]
  );
  const bookableServices = useMemo(
    () =>
      allServices
        .filter((s) => s.category !== "terapia" && s.active)
        .map((s) => ({ slug: s.slug, name: s.name, description: s.description, category: s.category as ServiceCategory })),
    [allServices]
  );
  const serviceNameBySlug = useMemo(() => new Map(allServices.map((s) => [s.slug, s.name])), [allServices]);
  const classNameBySlug = useMemo(() => new Map(classes.map((c) => [c.slug, c.name])), [classes]);

  return (
    <div className="mt-8 flex flex-col gap-6 sm:flex-row">
      <nav className="flex gap-1 overflow-x-auto sm:w-52 sm:shrink-0 sm:flex-col sm:overflow-visible">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
              tab === t.key ? "bg-maroon text-cream" : "text-ink/60 hover:bg-cream"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="min-w-0 flex-1">
        {tab === "agenda" && (
          <section>
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
        )}

        {tab === "aulas" && (
          <section>
            <h2 className="text-xl font-semibold text-ink">Aulas Semanais</h2>
            <p className="mt-1 text-sm text-ink/60">
              Ajuste lugares/preço/professor/sala das aulas e eventos já criados, ou gira os
              respetivos horários. Aparecem de imediato em /horarios ou /cursos-e-retiros.
            </p>
            <div className="mt-4">
              <AdminClassList classes={classes} rooms={rooms} teachers={teachers} />
            </div>
          </section>
        )}

        {tab === "criar" && (
          <section>
            <h2 className="text-xl font-semibold text-ink">Criar Nova Aula / Evento</h2>
            <p className="mt-1 text-sm text-ink/60">
              Aulas semanais recorrentes ou eventos/retiros pontuais — escolha um serviço para
              pré-preencher, ou crie um personalizado.
            </p>
            <div className="mt-4">
              <AdminClassCreator rooms={rooms} teachers={teachers} services={bookableServices} />
            </div>
          </section>
        )}

        {tab === "servicos" && (
          <section>
            <h2 className="text-xl font-semibold text-ink">Serviços</h2>
            <p className="mt-1 text-sm text-ink/60">
              Nome, descrição, preço (texto), imagem e (para terapias) o preço/duração reais
              usados no pagamento online. Aparecem em /terapias, /horarios, /cursos-e-retiros e
              /marcacoes.
            </p>
            <div className="mt-4">
              <AdminServiceManager services={allServices} />
            </div>
          </section>
        )}

        {tab === "terapias" && (
          <section>
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
        )}

        {tab === "registos" && (
          <div className="space-y-12">
            <section>
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

            <section>
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

            <section>
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
        )}
      </div>
    </div>
  );
}

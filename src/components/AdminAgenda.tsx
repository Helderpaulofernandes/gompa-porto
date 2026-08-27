"use client";

import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { pt } from "date-fns/locale";

type AgendaEvent = {
  id: string;
  type: "aula" | "terapia";
  name: string;
  date: string;
  durationMinutes: number;
  teacherName: string;
  roomName: string;
  info: string;
  status: string;
};

type Option = { id: string; name: string };

const TIME_ZONE = "Europe/Lisbon";

function badgeClasses(event: AgendaEvent) {
  if (event.type === "aula") return "border-gold bg-gold-light/30 text-ink";
  if (event.status === "confirmado") return "border-green-600 bg-green-50 text-green-800";
  return "border-amber-500 bg-amber-50 text-amber-800";
}

function badgeLabel(event: AgendaEvent) {
  if (event.type === "aula") return "Aula de Grupo";
  return event.status === "confirmado" ? "Terapia Confirmada" : "Terapia Pendente";
}

export default function AdminAgenda({ teachers, rooms }: { teachers: Option[]; rooms: Option[] }) {
  const [mode, setMode] = useState<"professor" | "sala">("professor");
  const [teacherId, setTeacherId] = useState(teachers[0]?.id ?? "");
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [events, setEvents] = useState<AgendaEvent[] | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedId = mode === "professor" ? teacherId : roomId;

  useEffect(() => {
    if (!selectedId) {
      setEvents([]);
      return;
    }
    setLoading(true);
    const param = mode === "professor" ? `teacherId=${selectedId}` : `roomId=${selectedId}`;
    fetch(`/api/admin/agenda?${param}`)
      .then((res) => res.json())
      .then((json) => setEvents(json.events ?? []))
      .finally(() => setLoading(false));
  }, [mode, selectedId]);

  const grouped = new Map<string, AgendaEvent[]>();
  for (const e of events ?? []) {
    const day = formatInTimeZone(new Date(e.date), TIME_ZONE, "yyyy-MM-dd");
    const list = grouped.get(day) ?? [];
    list.push(e);
    grouped.set(day, list);
  }

  return (
    <div className="rounded-xl border border-gold/30 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-gold/40 p-0.5 text-xs font-semibold">
          <button
            onClick={() => setMode("professor")}
            className={`rounded-full px-3 py-1 ${mode === "professor" ? "bg-maroon text-cream" : "text-ink/60"}`}
          >
            Por Professor
          </button>
          <button
            onClick={() => setMode("sala")}
            className={`rounded-full px-3 py-1 ${mode === "sala" ? "bg-maroon text-cream" : "text-ink/60"}`}
          >
            Por Sala
          </button>
        </div>

        {mode === "professor" ? (
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {loading && <p className="text-sm text-ink/50">A carregar…</p>}
        {!loading && events && events.length === 0 && (
          <p className="text-sm text-ink/50">Sem eventos agendados nos próximos 21 dias.</p>
        )}
        {!loading &&
          [...grouped.entries()].map(([day, dayEvents]) => (
            <div key={day}>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                {formatInTimeZone(new Date(dayEvents[0].date), TIME_ZONE, "EEEE, d 'de' MMMM", { locale: pt })}
              </p>
              <div className="mt-1 space-y-1">
                {dayEvents.map((e) => (
                  <div
                    key={e.id}
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${badgeClasses(e)}`}
                  >
                    <div>
                      <span className="font-semibold">
                        {formatInTimeZone(new Date(e.date), TIME_ZONE, "HH:mm")}
                      </span>{" "}
                      · {e.name}
                      {mode === "professor" && e.roomName && <span className="text-xs"> · {e.roomName}</span>}
                      {mode === "sala" && e.teacherName && <span className="text-xs"> · {e.teacherName}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full border px-2 py-0.5">{badgeLabel(e)}</span>
                      <span>{e.info}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

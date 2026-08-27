"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

type Slot = { id: string; weekday: number | null; specificDate: Date | null; time: string };
type RoomOption = { id: string; name: string };
type TeacherOption = { id: string; name: string };
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

function dateInputValue(d: Date | null) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

function ExistingClassRow({
  classDef,
  rooms,
  teachers,
}: {
  classDef: ClassDef;
  rooms: RoomOption[];
  teachers: TeacherOption[];
}) {
  const router = useRouter();
  const [capacity, setCapacity] = useState(classDef.capacity);
  const [priceEuros, setPriceEuros] = useState((classDef.dropInPriceCents / 100).toFixed(2));
  const [roomId, setRoomId] = useState(classDef.roomId ?? "");
  const [teacherId, setTeacherId] = useState(classDef.teacherId ?? "");
  const [endDate, setEndDate] = useState(dateInputValue(classDef.endDate));
  const [publicCalendar, setPublicCalendar] = useState(classDef.publicCalendar);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [newWeekday, setNewWeekday] = useState(2);
  const [newSpecificDate, setNewSpecificDate] = useState("");
  const [newTime, setNewTime] = useState("19:30");

  async function saveMeta() {
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch("/api/admin/aulas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: classDef.id,
        capacity,
        dropInPriceCents: Math.round(parseFloat(priceEuros || "0") * 100),
        roomId: roomId || null,
        teacherId: teacherId || null,
        endDate: classDef.recurring ? endDate || null : undefined,
        publicCalendar,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Erro ao guardar.");
    }
  }

  async function toggleActive() {
    await fetch("/api/admin/aulas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: classDef.id, active: !classDef.active }),
    });
    router.refresh();
  }

  async function removeClass() {
    const res = await fetch("/api/admin/aulas", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: classDef.id }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Erro ao remover.");
      return;
    }
    router.refresh();
  }

  async function addSlot() {
    setWarning("");
    const res = await fetch("/api/admin/aulas/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        classDef.recurring
          ? { classId: classDef.id, weekday: newWeekday, time: newTime }
          : { classId: classDef.id, specificDate: newSpecificDate, time: newTime }
      ),
    });
    const json = await res.json().catch(() => ({}));
    if (json.warning) setWarning(json.warning);
    router.refresh();
  }

  async function removeSlot(id: string) {
    await fetch("/api/admin/aulas/slots", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gold/30 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${classDef.active ? "text-ink" : "text-ink/40 line-through"}`}>
          {classDef.name}{" "}
          <span className="text-xs font-normal text-ink/40">
            ({classDef.recurring ? "recorrente" : "pontual"}
            {classDef.publicCalendar ? "" : " · só EOI"})
          </span>
        </span>
        <div className="flex gap-3">
          <button onClick={toggleActive} className="text-xs font-semibold text-maroon hover:underline">
            {classDef.active ? "Desativar" : "Ativar"}
          </button>
          <button onClick={removeClass} className="text-xs font-semibold text-red-600 hover:underline">
            Remover
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-xs text-ink/60">
          Lugares:{" "}
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-16 rounded-lg border border-gold/40 px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs text-ink/60">
          Preço avulso (€):{" "}
          <input
            type="text"
            inputMode="decimal"
            value={priceEuros}
            onChange={(e) => setPriceEuros(e.target.value)}
            className="w-20 rounded-lg border border-gold/40 px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs text-ink/60">
          Sala:{" "}
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1 text-sm"
          >
            <option value="">Sem sala definida</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-ink/60">
          Professor:{" "}
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1 text-sm"
          >
            <option value="">Sem professor definido</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        {classDef.recurring && (
          <label className="text-xs text-ink/60">
            Termina em:{" "}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-gold/40 px-2 py-1 text-sm"
            />
          </label>
        )}
        <label className="flex items-center gap-1 text-xs text-ink/60">
          <input
            type="checkbox"
            checked={publicCalendar}
            onChange={(e) => setPublicCalendar(e.target.checked)}
          />
          Reserva online (não só EOI)
        </label>
        <button
          onClick={saveMeta}
          disabled={saving}
          className="rounded-full bg-maroon px-3 py-1.5 text-xs font-semibold text-cream hover:bg-maroon-dark disabled:opacity-60"
        >
          {saving ? "A guardar…" : saved ? "Guardado ✓" : "Guardar"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3">
        <p className="text-xs font-semibold text-ink/60">
          {classDef.recurring ? "Horários semanais" : "Datas"}
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {classDef.slots.map((s) => (
            <span
              key={s.id}
              className="flex items-center gap-1 rounded-full border border-gold/40 px-2 py-1 text-xs text-ink"
            >
              {s.weekday !== null
                ? WEEKDAYS[s.weekday]
                : s.specificDate?.toLocaleDateString("pt-PT", { day: "numeric", month: "long" })}
              , {s.time}
              <button onClick={() => removeSlot(s.id)} className="text-red-600" aria-label="Remover horário">
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {classDef.recurring ? (
            <select
              value={newWeekday}
              onChange={(e) => setNewWeekday(Number(e.target.value))}
              className="rounded-lg border border-gold/40 px-2 py-1 text-xs"
            >
              {WEEKDAYS.map((w, i) => (
                <option key={w} value={i}>
                  {w}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="date"
              value={newSpecificDate}
              onChange={(e) => setNewSpecificDate(e.target.value)}
              className="rounded-lg border border-gold/40 px-2 py-1 text-xs"
            />
          )}
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1 text-xs"
          />
          <button
            onClick={addSlot}
            disabled={!classDef.recurring && !newSpecificDate}
            className="text-xs font-semibold text-maroon hover:underline disabled:opacity-50"
          >
            + adicionar
          </button>
        </div>
        {warning && <p className="mt-2 text-xs text-amber-700">⚠ {warning}</p>}
      </div>
    </div>
  );
}

export default function AdminClassList({
  classes,
  rooms,
  teachers,
}: {
  classes: ClassDef[];
  rooms: RoomOption[];
  teachers: TeacherOption[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {classes.map((c) => (
        <ExistingClassRow key={c.id} classDef={c} rooms={rooms} teachers={teachers} />
      ))}
      {classes.length === 0 && <p className="text-sm text-ink/50">Sem aulas criadas ainda.</p>}
    </div>
  );
}

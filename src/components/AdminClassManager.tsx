"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

type Slot = { id: string; weekday: number; time: string };
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
  roomId: string | null;
  teacherId: string | null;
  slots: Slot[];
};

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [newWeekday, setNewWeekday] = useState(2);
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
    await fetch("/api/admin/aulas/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: classDef.id, weekday: newWeekday, time: newTime }),
    });
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
          {classDef.name}
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
        <p className="text-xs font-semibold text-ink/60">Horários semanais</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {classDef.slots.map((s) => (
            <span
              key={s.id}
              className="flex items-center gap-1 rounded-full border border-gold/40 px-2 py-1 text-xs text-ink"
            >
              {WEEKDAYS[s.weekday]}, {s.time}
              <button onClick={() => removeSlot(s.id)} className="text-red-600" aria-label="Remover horário">
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
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
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1 text-xs"
          />
          <button onClick={addSlot} className="text-xs font-semibold text-maroon hover:underline">
            + adicionar horário
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminClassManager({
  classes,
  rooms,
  teachers,
}: {
  classes: ClassDef[];
  rooms: RoomOption[];
  teachers: TeacherOption[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(14);
  const [priceEuros, setPriceEuros] = useState("9.00");
  const [duration, setDuration] = useState(60);
  const [roomId, setRoomId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [slots, setSlots] = useState<{ weekday: number; time: string }[]>([{ weekday: 2, time: "19:30" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function updateSlot(i: number, field: "weekday" | "time", value: string | number) {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  async function createClass() {
    if (!name.trim() || !description.trim() || slots.length === 0) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/aulas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          capacity,
          dropInPriceCents: Math.round(parseFloat(priceEuros || "0") * 100),
          durationMinutes: duration,
          roomId: roomId || null,
          teacherId: teacherId || null,
          slots,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao criar aula.");
      setSaved(true);
      setName("");
      setDescription("");
      setSlots([{ weekday: 2, time: "19:30" }]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {classes.map((c) => (
          <ExistingClassRow key={c.id} classDef={c} rooms={rooms} teachers={teachers} />
        ))}
      </div>

      <div className="rounded-xl border border-gold/30 bg-white p-4">
        <h3 className="text-sm font-semibold text-ink">Criar Nova Aula Semanal</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            placeholder="Nome da aula"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm focus:border-maroon focus:outline-none"
          />
          <input
            placeholder="Descrição breve"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm focus:border-maroon focus:outline-none"
          />
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
            Duração (min):{" "}
            <input
              type="number"
              min={15}
              step={15}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
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
        </div>

        <div className="mt-3">
          <p className="text-xs font-semibold text-ink/60">Horários semanais</p>
          <div className="mt-1 space-y-2">
            {slots.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={s.weekday}
                  onChange={(e) => updateSlot(i, "weekday", Number(e.target.value))}
                  className="rounded-lg border border-gold/40 px-2 py-1 text-xs"
                >
                  {WEEKDAYS.map((w, idx) => (
                    <option key={w} value={idx}>
                      {w}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={s.time}
                  onChange={(e) => updateSlot(i, "time", e.target.value)}
                  className="rounded-lg border border-gold/40 px-2 py-1 text-xs"
                />
                {slots.length > 1 && (
                  <button
                    onClick={() => setSlots((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-xs text-red-600"
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setSlots((prev) => [...prev, { weekday: 2, time: "19:30" }])}
              className="text-xs font-semibold text-maroon hover:underline"
            >
              + adicionar horário
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <button
          onClick={createClass}
          disabled={saving}
          className="mt-4 w-full rounded-full bg-maroon px-3 py-2 text-sm font-semibold text-cream hover:bg-maroon-dark disabled:opacity-60 sm:w-auto"
        >
          {saving ? "A criar…" : saved ? "Criada ✓" : "Criar aula"}
        </button>
      </div>
    </div>
  );
}

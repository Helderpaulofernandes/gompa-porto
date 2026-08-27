"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Teacher = { id: string; name: string; active: boolean };
type Room = { id: string; name: string };
type ServiceOption = { slug: string; name: string };

export default function AdminTherapyManager({
  teachers,
  rooms,
  therapyServices,
}: {
  teachers: Teacher[];
  rooms: Room[];
  therapyServices: ServiceOption[];
}) {
  const router = useRouter();

  const [newTeacher, setNewTeacher] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [savingTeacher, setSavingTeacher] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);

  const [teacherId, setTeacherId] = useState(teachers.find((t) => t.active)?.id ?? "");
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [serviceSlug, setServiceSlug] = useState(therapyServices[0]?.slug ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [savingSlot, setSavingSlot] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [slotSaved, setSlotSaved] = useState(false);

  async function addTeacher() {
    if (!newTeacher.trim()) return;
    setSavingTeacher(true);
    await fetch("/api/admin/therapy/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeacher.trim() }),
    });
    setNewTeacher("");
    setSavingTeacher(false);
    router.refresh();
  }

  async function toggleTeacher(id: string, active: boolean) {
    await fetch("/api/admin/therapy/teachers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    router.refresh();
  }

  async function addRoom() {
    if (!newRoom.trim()) return;
    setSavingRoom(true);
    await fetch("/api/admin/therapy/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRoom.trim() }),
    });
    setNewRoom("");
    setSavingRoom(false);
    router.refresh();
  }

  async function createSlot() {
    if (!teacherId || !roomId || !serviceSlug || !date || !time) return;
    setSavingSlot(true);
    setSlotError("");
    setSlotSaved(false);
    try {
      const res = await fetch("/api/admin/therapy/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, roomId, serviceSlug, date, time, durationMinutes: duration }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao criar horário.");
      setSlotSaved(true);
      router.refresh();
    } catch (err) {
      setSlotError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSavingSlot(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-gold/30 bg-white p-4">
        <h3 className="text-sm font-semibold text-ink">Professores</h3>
        <ul className="mt-3 space-y-2">
          {teachers.map((t) => (
            <li key={t.id} className="flex items-center justify-between text-sm">
              <span className={t.active ? "" : "text-ink/40 line-through"}>{t.name}</span>
              <button
                onClick={() => toggleTeacher(t.id, !t.active)}
                className="text-xs font-semibold text-maroon hover:underline"
              >
                {t.active ? "Desativar" : "Ativar"}
              </button>
            </li>
          ))}
          {teachers.length === 0 && <li className="text-sm text-ink/50">Sem professores ainda.</li>}
        </ul>
        <div className="mt-3 flex gap-2">
          <input
            placeholder="Nome do professor"
            value={newTeacher}
            onChange={(e) => setNewTeacher(e.target.value)}
            className="flex-1 rounded-lg border border-gold/40 px-2 py-1.5 text-sm focus:border-maroon focus:outline-none"
          />
          <button
            onClick={addTeacher}
            disabled={savingTeacher}
            className="rounded-full bg-maroon px-3 py-1.5 text-xs font-semibold text-cream hover:bg-maroon-dark disabled:opacity-60"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gold/30 bg-white p-4">
        <h3 className="text-sm font-semibold text-ink">Salas</h3>
        <ul className="mt-3 space-y-2">
          {rooms.map((r) => (
            <li key={r.id} className="text-sm">
              {r.name}
            </li>
          ))}
          {rooms.length === 0 && <li className="text-sm text-ink/50">Sem salas ainda.</li>}
        </ul>
        <div className="mt-3 flex gap-2">
          <input
            placeholder="Nome da sala"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            className="flex-1 rounded-lg border border-gold/40 px-2 py-1.5 text-sm focus:border-maroon focus:outline-none"
          />
          <button
            onClick={addRoom}
            disabled={savingRoom}
            className="rounded-full bg-maroon px-3 py-1.5 text-xs font-semibold text-cream hover:bg-maroon-dark disabled:opacity-60"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gold/30 bg-white p-4">
        <h3 className="text-sm font-semibold text-ink">Criar Horário Disponível</h3>
        <div className="mt-3 space-y-2">
          <select
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
            className="w-full rounded-lg border border-gold/40 px-2 py-1.5 text-sm focus:border-maroon focus:outline-none"
          >
            {therapyServices.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="w-full rounded-lg border border-gold/40 px-2 py-1.5 text-sm focus:border-maroon focus:outline-none"
          >
            {teachers
              .filter((t) => t.active)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full rounded-lg border border-gold/40 px-2 py-1.5 text-sm focus:border-maroon focus:outline-none"
          >
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 rounded-lg border border-gold/40 px-2 py-1.5 text-sm focus:border-maroon focus:outline-none"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 rounded-lg border border-gold/40 px-2 py-1.5 text-sm focus:border-maroon focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={15}
              max={240}
              step={15}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-20 rounded-lg border border-gold/40 px-2 py-1.5 text-sm focus:border-maroon focus:outline-none"
            />
            <span className="text-xs text-ink/50">minutos</span>
          </div>
          {slotError && <p className="text-xs text-red-600">{slotError}</p>}
          <button
            onClick={createSlot}
            disabled={savingSlot}
            className="w-full rounded-full bg-maroon px-3 py-2 text-sm font-semibold text-cream hover:bg-maroon-dark disabled:opacity-60"
          >
            {savingSlot ? "A criar…" : slotSaved ? "Criado ✓" : "Criar horário"}
          </button>
        </div>
      </div>
    </div>
  );
}

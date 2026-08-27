"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Teacher = { id: string; name: string; active: boolean };
type Room = { id: string; name: string; active: boolean };
type ServiceOption = { slug: string; name: string };

function EditableEntityRow({
  entity,
  endpoint,
}: {
  entity: { id: string; name: string; active: boolean };
  endpoint: "teachers" | "rooms";
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(entity.name);
  const [error, setError] = useState("");

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/therapy/${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entity.id, ...body }),
    });
    router.refresh();
    return res;
  }

  async function saveName() {
    if (!name.trim() || name === entity.name) {
      setEditing(false);
      return;
    }
    await patch({ name: name.trim() });
    setEditing(false);
  }

  async function toggleActive() {
    await patch({ active: !entity.active });
  }

  async function remove() {
    setError("");
    const res = await fetch(`/api/admin/therapy/${endpoint}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entity.id }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Erro ao remover.");
      return;
    }
    router.refresh();
  }

  if (editing) {
    return (
      <li className="flex items-center gap-1 text-sm">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveName()}
          className="flex-1 rounded-lg border border-gold/40 px-2 py-1 text-sm focus:border-maroon focus:outline-none"
        />
        <button onClick={saveName} className="text-xs font-semibold text-maroon hover:underline">
          Guardar
        </button>
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-center justify-between text-sm">
        <span className={entity.active ? "" : "text-ink/40 line-through"}>{entity.name}</span>
        <div className="flex gap-2 text-xs font-semibold">
          <button onClick={() => setEditing(true)} className="text-maroon hover:underline">
            Editar
          </button>
          <button onClick={toggleActive} className="text-maroon hover:underline">
            {entity.active ? "Desativar" : "Ativar"}
          </button>
          <button onClick={remove} className="text-red-600 hover:underline">
            Remover
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </li>
  );
}

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
  const [roomId, setRoomId] = useState(rooms.find((r) => r.active)?.id ?? "");
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
            <EditableEntityRow key={t.id} entity={t} endpoint="teachers" />
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
            <EditableEntityRow key={r.id} entity={r} endpoint="rooms" />
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
            {rooms
              .filter((r) => r.active)
              .map((r) => (
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

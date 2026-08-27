"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

type Teacher = { id: string; name: string; active: boolean; services: string[] };
type Room = { id: string; name: string; active: boolean };
type ServiceOption = { slug: string; name: string };
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

function TeacherRow({ teacher, therapyServices }: { teacher: Teacher; therapyServices: ServiceOption[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(teacher.name);
  const [services, setServices] = useState<string[]>(teacher.services);
  const [error, setError] = useState("");

  async function patch(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/therapy/teachers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: teacher.id, ...body }),
    });
    router.refresh();
    return res;
  }

  async function save() {
    await patch({ name: name.trim() || teacher.name, services });
    setEditing(false);
  }

  async function toggleActive() {
    await patch({ active: !teacher.active });
  }

  async function remove() {
    setError("");
    const res = await fetch("/api/admin/therapy/teachers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: teacher.id }),
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
      <li className="rounded-lg border border-gold/30 p-2 text-sm">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gold/40 px-2 py-1 text-sm focus:border-maroon focus:outline-none"
        />
        <div className="mt-2 space-y-1">
          {therapyServices.map((s) => (
            <label key={s.slug} className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={services.includes(s.slug)}
                onChange={(e) =>
                  setServices((prev) => (e.target.checked ? [...prev, s.slug] : prev.filter((x) => x !== s.slug)))
                }
              />
              {s.name}
            </label>
          ))}
        </div>
        <button onClick={save} className="mt-2 text-xs font-semibold text-maroon hover:underline">
          Guardar
        </button>
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-center justify-between text-sm">
        <span className={teacher.active ? "" : "text-ink/40 line-through"}>{teacher.name}</span>
        <div className="flex gap-2 text-xs font-semibold">
          <button onClick={() => setEditing(true)} className="text-maroon hover:underline">
            Editar
          </button>
          <button onClick={toggleActive} className="text-maroon hover:underline">
            {teacher.active ? "Desativar" : "Ativar"}
          </button>
          <button onClick={remove} className="text-red-600 hover:underline">
            Remover
          </button>
        </div>
      </div>
      <p className="text-xs text-ink/50">
        {teacher.services.length > 0
          ? teacher.services.map((s) => therapyServices.find((t) => t.slug === s)?.name ?? s).join(", ")
          : "Sem terapias atribuídas"}
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </li>
  );
}

function RoomRow({ room }: { room: Room }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(room.name);
  const [error, setError] = useState("");

  async function patch(body: Record<string, unknown>) {
    await fetch("/api/admin/therapy/rooms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: room.id, ...body }),
    });
    router.refresh();
  }

  async function remove() {
    setError("");
    const res = await fetch("/api/admin/therapy/rooms", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: room.id }),
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
          onKeyDown={(e) => e.key === "Enter" && (patch({ name: name.trim() }), setEditing(false))}
          className="flex-1 rounded-lg border border-gold/40 px-2 py-1 text-sm focus:border-maroon focus:outline-none"
        />
        <button
          onClick={() => {
            patch({ name: name.trim() });
            setEditing(false);
          }}
          className="text-xs font-semibold text-maroon hover:underline"
        >
          Guardar
        </button>
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-center justify-between text-sm">
        <span className={room.active ? "" : "text-ink/40 line-through"}>{room.name}</span>
        <div className="flex gap-2 text-xs font-semibold">
          <button onClick={() => setEditing(true)} className="text-maroon hover:underline">
            Editar
          </button>
          <button onClick={() => patch({ active: !room.active })} className="text-maroon hover:underline">
            {room.active ? "Desativar" : "Ativar"}
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
  windows,
  settings,
}: {
  teachers: Teacher[];
  rooms: Room[];
  therapyServices: ServiceOption[];
  windows: Window[];
  settings: Settings;
}) {
  const router = useRouter();

  const [newTeacher, setNewTeacher] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [savingTeacher, setSavingTeacher] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);

  const [winTeacherId, setWinTeacherId] = useState(teachers.find((t) => t.active)?.id ?? "");
  const [winRoomId, setWinRoomId] = useState(rooms.find((r) => r.active)?.id ?? "");
  const [weekday, setWeekday] = useState(3);
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("18:00");
  const [savingWindow, setSavingWindow] = useState(false);
  const [windowError, setWindowError] = useState("");
  const [windowWarning, setWindowWarning] = useState("");

  const [breakMinutes, setBreakMinutes] = useState(settings.breakMinutes);
  const [lunchStart, setLunchStart] = useState(settings.lunchStart ?? "");
  const [lunchEnd, setLunchEnd] = useState(settings.lunchEnd ?? "");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  async function addTeacher() {
    if (!newTeacher.trim()) return;
    setSavingTeacher(true);
    await fetch("/api/admin/therapy/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeacher.trim(), services: [] }),
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

  async function createWindow() {
    if (!winTeacherId || !winRoomId) return;
    setSavingWindow(true);
    setWindowError("");
    setWindowWarning("");
    try {
      const res = await fetch("/api/admin/therapy/windows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: winTeacherId, roomId: winRoomId, weekday, startTime, endTime }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao criar janela.");
      if (json.warning) setWindowWarning(json.warning);
      router.refresh();
    } catch (err) {
      setWindowError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSavingWindow(false);
    }
  }

  async function removeWindow(id: string) {
    await fetch("/api/admin/therapy/windows", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  async function saveSettings() {
    setSavingSettings(true);
    setSettingsSaved(false);
    await fetch("/api/admin/therapy/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        breakMinutes,
        lunchStart: lunchStart || null,
        lunchEnd: lunchEnd || null,
      }),
    });
    setSavingSettings(false);
    setSettingsSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gold/30 bg-white p-4">
          <h3 className="text-sm font-semibold text-ink">Professores</h3>
          <ul className="mt-3 space-y-3">
            {teachers.map((t) => (
              <TeacherRow key={t.id} teacher={t} therapyServices={therapyServices} />
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
              <RoomRow key={r.id} room={r} />
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
          <h3 className="text-sm font-semibold text-ink">Intervalos e Pausa de Almoço</h3>
          <p className="mt-1 text-xs text-ink/60">
            Aplicam-se a todas as janelas de disponibilidade das terapias.
          </p>
          <div className="mt-3 space-y-2">
            <label className="block text-xs text-ink/60">
              Intervalo padrão entre sessões (min)
              <input
                type="number"
                min={0}
                max={180}
                step={5}
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block text-xs text-ink/60">
              Início da pausa de almoço (opcional)
              <input
                type="time"
                value={lunchStart}
                onChange={(e) => setLunchStart(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block text-xs text-ink/60">
              Fim da pausa de almoço
              <input
                type="time"
                value={lunchEnd}
                onChange={(e) => setLunchEnd(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
              />
            </label>
            <button
              onClick={saveSettings}
              disabled={savingSettings}
              className="w-full rounded-full bg-maroon px-3 py-2 text-sm font-semibold text-cream hover:bg-maroon-dark disabled:opacity-60"
            >
              {savingSettings ? "A guardar…" : settingsSaved ? "Guardado ✓" : "Guardar"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gold/30 bg-white p-4">
        <h3 className="text-sm font-semibold text-ink">Janelas de Disponibilidade</h3>
        <p className="mt-1 text-xs text-ink/60">
          Ex.: &quot;Anu, Sala de Terapias, Quarta-feira, 14:00–18:00&quot;. O site calcula
          automaticamente os horários possíveis dentro da janela, consoante a duração de cada
          terapia, o intervalo entre sessões e a pausa de almoço.
        </p>

        <ul className="mt-3 space-y-1">
          {windows.map((w) => (
            <li key={w.id} className="flex items-center justify-between rounded-lg border border-gold/20 px-3 py-2 text-sm">
              <span>
                {w.teacher.name} · {w.room.name} · {WEEKDAYS[w.weekday]} · {w.startTime}–{w.endTime}
              </span>
              <button onClick={() => removeWindow(w.id)} className="text-xs font-semibold text-red-600 hover:underline">
                Remover
              </button>
            </li>
          ))}
          {windows.length === 0 && <li className="text-sm text-ink/50">Sem janelas de disponibilidade ainda.</li>}
        </ul>

        <div className="mt-4 grid gap-2 sm:grid-cols-5">
          <select
            value={winTeacherId}
            onChange={(e) => setWinTeacherId(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
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
            value={winRoomId}
            onChange={(e) => setWinRoomId(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
          >
            {rooms
              .filter((r) => r.active)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>
          <select
            value={weekday}
            onChange={(e) => setWeekday(Number(e.target.value))}
            className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
          >
            {WEEKDAYS.map((w, i) => (
              <option key={w} value={i}>
                {w}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
          />
        </div>
        {windowError && <p className="mt-2 text-xs text-red-600">{windowError}</p>}
        {windowWarning && <p className="mt-2 text-xs text-amber-700">⚠ {windowWarning}</p>}
        <button
          onClick={createWindow}
          disabled={savingWindow}
          className="mt-3 rounded-full bg-maroon px-4 py-2 text-sm font-semibold text-cream hover:bg-maroon-dark disabled:opacity-60"
        >
          {savingWindow ? "A criar…" : "Criar janela"}
        </button>
      </div>
    </div>
  );
}

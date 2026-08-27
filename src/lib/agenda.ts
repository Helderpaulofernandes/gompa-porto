import { addDays, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getUpcomingOccurrences } from "@/lib/occurrences";
import { getActiveClasses } from "@/lib/classSchedule";
import { getServiceBySlug } from "@/lib/services";

const DAYS_AHEAD = 21;

export type AgendaEvent = {
  id: string;
  type: "aula" | "terapia";
  name: string;
  date: Date;
  durationMinutes: number;
  teacherId: string | null;
  teacherName: string;
  roomId: string | null;
  roomName: string;
  info: string; // headcount for classes, client name for therapies
  status: string;
};

/**
 * Agenda unificada de aulas de grupo e terapias, opcionalmente filtrada por
 * professor ou por sala — a mesma fonte de dados serve as vistas "Por
 * Professor" e "Por Sala" no admin.
 */
export async function getAgendaEvents(filter: { teacherId?: string; roomId?: string } = {}) {
  const now = new Date();
  const rangeEnd = addDays(startOfDay(now), DAYS_AHEAD);

  const events: AgendaEvent[] = [];

  // Group classes
  const classes = await getActiveClasses();
  for (const c of classes) {
    if (filter.teacherId && c.teacherId !== filter.teacherId) continue;
    if (filter.roomId && c.roomId !== filter.roomId) continue;

    const occurrences = getUpcomingOccurrences(c.slots, Math.ceil(DAYS_AHEAD / 7) + 1).filter(
      (o) => o.date <= rangeEnd
    );
    if (occurrences.length === 0) continue;

    const dates = occurrences.map((o) => o.date);
    const counts = await prisma.seatReservation.groupBy({
      by: ["classDate"],
      where: { classSlug: c.slug, classDate: { in: dates }, status: { in: ["pendente", "confirmado"] } },
      _count: { _all: true },
    });
    const countByIso = new Map(counts.map((cnt) => [cnt.classDate.toISOString(), cnt._count._all]));

    for (const o of occurrences) {
      const taken = countByIso.get(o.isoDate) ?? 0;
      events.push({
        id: `aula-${c.slug}-${o.isoDate}`,
        type: "aula",
        name: c.name,
        date: o.date,
        durationMinutes: c.durationMinutes,
        teacherId: c.teacherId,
        teacherName: c.teacherId ? "" : "—",
        roomId: c.roomId,
        roomName: "",
        info: `${taken}/${c.capacity} lugares`,
        status: "agendada",
      });
    }
  }

  // Therapy bookings (only real bookings — availability windows aren't "events")
  const therapySlots = await prisma.therapySlot.findMany({
    where: {
      date: { gte: startOfDay(now), lte: rangeEnd },
      status: { in: ["pendente", "confirmado"] },
      ...(filter.teacherId ? { teacherId: filter.teacherId } : {}),
      ...(filter.roomId ? { roomId: filter.roomId } : {}),
    },
    include: { teacher: true, room: true },
  });
  for (const s of therapySlots) {
    events.push({
      id: `terapia-${s.id}`,
      type: "terapia",
      name: getServiceBySlug(s.serviceSlug)?.name ?? s.serviceSlug,
      date: s.date,
      durationMinutes: s.durationMinutes,
      teacherId: s.teacherId,
      teacherName: s.teacher.name,
      roomId: s.roomId,
      roomName: s.room.name,
      info: s.clientName ?? "—",
      status: s.status,
    });
  }

  // Resolve teacher/room names for classes (batched lookups)
  const teacherIds = [...new Set(events.filter((e) => e.teacherId).map((e) => e.teacherId!))];
  const roomIds = [...new Set(events.filter((e) => e.roomId).map((e) => e.roomId!))];
  const [teachersById, roomsById] = await Promise.all([
    prisma.teacher.findMany({ where: { id: { in: teacherIds } } }),
    prisma.room.findMany({ where: { id: { in: roomIds } } }),
  ]);
  const teacherNameMap = new Map(teachersById.map((t) => [t.id, t.name]));
  const roomNameMap = new Map(roomsById.map((r) => [r.id, r.name]));
  for (const e of events) {
    if (e.type === "aula") {
      e.teacherName = e.teacherId ? (teacherNameMap.get(e.teacherId) ?? "—") : "—";
      e.roomName = e.roomId ? (roomNameMap.get(e.roomId) ?? "—") : "—";
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

import { addDays, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { getTherapyDurationMinutes } from "@/lib/therapyPricing";

const TIME_ZONE = "Europe/Lisbon";
const WEEKS_AHEAD = 4;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export type Candidate = {
  isoDate: string;
  date: Date;
  teacherId: string;
  teacherName: string;
  roomId: string;
  available: boolean;
};

async function getSettings() {
  const settings = await prisma.therapySettings.findUnique({ where: { id: "singleton" } });
  return settings ?? { breakMinutes: 15, lunchStart: null, lunchEnd: null };
}

/**
 * Calcula os horários possíveis para uma terapia, com base nas janelas de
 * disponibilidade dos professores que a realizam, o intervalo padrão entre
 * sessões, a pausa de almoço, e a ocupação real das salas (por outras
 * terapias já marcadas E por aulas de grupo com horário fixo na mesma sala).
 */
export async function computeTherapyCandidates(serviceSlug: string): Promise<Candidate[]> {
  const duration = getTherapyDurationMinutes(serviceSlug);
  if (!duration) return [];

  const [teachers, settings] = await Promise.all([
    prisma.teacher.findMany({
      where: { active: true, services: { has: serviceSlug } },
      include: { windows: { include: { room: true } } },
    }),
    getSettings(),
  ]);

  if (teachers.length === 0) return [];

  const step = duration + settings.breakMinutes;
  const lunchStartMin = settings.lunchStart ? timeToMinutes(settings.lunchStart) : null;
  const lunchEndMin = settings.lunchEnd ? timeToMinutes(settings.lunchEnd) : null;

  const now = new Date();
  const nowInLisbon = toZonedTime(now, TIME_ZONE);
  const rangeStart = startOfDay(nowInLisbon);
  const rangeEnd = addDays(rangeStart, WEEKS_AHEAD * 7);

  // Class blocks per room+weekday (recurring), independent of specific dates.
  const classSlots = await prisma.classSlotDef.findMany({
    include: { class: true },
    where: { class: { active: true, roomId: { not: null } } },
  });
  const classBlocksByRoomWeekday = new Map<string, { start: number; end: number }[]>();
  for (const cs of classSlots) {
    const key = `${cs.class.roomId}:${cs.weekday}`;
    const start = timeToMinutes(cs.time);
    const end = start + cs.class.durationMinutes;
    const list = classBlocksByRoomWeekday.get(key) ?? [];
    list.push({ start, end });
    classBlocksByRoomWeekday.set(key, list);
  }

  const candidates: Candidate[] = [];

  for (const teacher of teachers) {
    for (const window of teacher.windows) {
      const windowStart = timeToMinutes(window.startTime);
      const windowEnd = timeToMinutes(window.endTime);

      for (let day = new Date(rangeStart); day <= rangeEnd; day = addDays(day, 1)) {
        if (day.getDay() !== window.weekday) continue;

        const y = day.getFullYear();
        const m = String(day.getMonth() + 1).padStart(2, "0");
        const d = String(day.getDate()).padStart(2, "0");

        const classBlocks = classBlocksByRoomWeekday.get(`${window.roomId}:${window.weekday}`) ?? [];

        for (let start = windowStart; start + duration <= windowEnd; start += step) {
          const end = start + duration;

          const hitsLunch =
            lunchStartMin !== null && lunchEndMin !== null && overlaps(start, end, lunchStartMin, lunchEndMin);
          const hitsClass = classBlocks.some((b) => overlaps(start, end, b.start, b.end));

          const candidateDate = fromZonedTime(
            `${y}-${m}-${d}T${minutesToTime(start)}:00`,
            TIME_ZONE
          );
          if (candidateDate.getTime() <= now.getTime()) continue;

          candidates.push({
            isoDate: candidateDate.toISOString(),
            date: candidateDate,
            teacherId: teacher.id,
            teacherName: teacher.name,
            roomId: window.roomId,
            available: !hitsLunch && !hitsClass,
          });
        }
      }
    }
  }

  // Mark candidates that overlap an existing therapy booking (any teacher) in the same room,
  // or the same teacher's own bookings, as unavailable — booked time "locks in" duration + break.
  if (candidates.length > 0) {
    const dates = candidates.map((c) => c.date);
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    const existingBookings = await prisma.therapySlot.findMany({
      where: {
        status: { in: ["pendente", "confirmado"] },
        date: { gte: minDate, lte: new Date(maxDate.getTime() + 4 * 60 * 60 * 1000) },
      },
    });

    for (const candidate of candidates) {
      if (!candidate.available) continue;
      const candidateStart = candidate.date.getTime();
      const candidateEnd = candidateStart + duration * 60000;

      const conflict = existingBookings.some((b) => {
        const sameResource = b.roomId === candidate.roomId || b.teacherId === candidate.teacherId;
        if (!sameResource) return false;
        const bStart = b.date.getTime();
        const bEnd = bStart + (b.durationMinutes + settings.breakMinutes) * 60000;
        return candidateStart < bEnd && bStart < candidateEnd;
      });
      if (conflict) candidate.available = false;
    }
  }

  return candidates.sort((a, b) => a.date.getTime() - b.date.getTime());
}

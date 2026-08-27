import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";

const TIME_ZONE = "Europe/Lisbon";

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

function lisbonDayKey(date: Date) {
  return formatInTimeZone(date, TIME_ZONE, "yyyy-MM-dd");
}

function lisbonWeekday(date: Date) {
  return toZonedTime(date, TIME_ZONE).getDay();
}

/**
 * Non-blocking heads-up for the admin: does this teacher already have another
 * class, or a therapy booking, that overlaps a proposed new class slot?
 * Covers recurring-vs-recurring (same weekday), once-off-vs-once-off (same
 * calendar date), and a once-off date that happens to land on a weekday a
 * recurring class already occupies (and vice-versa).
 */
export async function findTeacherSlotConflict({
  teacherId,
  weekday,
  specificDate,
  time,
  durationMinutes,
  excludeClassId,
}: {
  teacherId: string;
  weekday: number | null;
  specificDate: Date | null;
  time: string;
  durationMinutes: number;
  excludeClassId?: string;
}): Promise<string | null> {
  const start = timeToMinutes(time);
  const end = start + durationMinutes;
  const conflicts: string[] = [];

  const otherSlots = await prisma.classSlotDef.findMany({
    where: {
      class: {
        teacherId,
        active: true,
        ...(excludeClassId ? { id: { not: excludeClassId } } : {}),
      },
    },
    include: { class: true },
  });

  for (const s of otherSlots) {
    const sStart = timeToMinutes(s.time);
    const sEnd = sStart + s.class.durationMinutes;
    if (!overlaps(start, end, sStart, sEnd)) continue;

    let sameOccasion = false;
    if (weekday !== null && s.weekday !== null) {
      sameOccasion = weekday === s.weekday;
    } else if (specificDate && s.specificDate) {
      sameOccasion = lisbonDayKey(specificDate) === lisbonDayKey(s.specificDate);
    } else if (specificDate && s.weekday !== null) {
      const withinEnd = !s.class.endDate || specificDate <= s.class.endDate;
      sameOccasion = lisbonWeekday(specificDate) === s.weekday && withinEnd;
    } else if (weekday !== null && s.specificDate) {
      sameOccasion = lisbonWeekday(s.specificDate) === weekday;
    }

    if (sameOccasion) conflicts.push(`${s.class.name} às ${s.time}`);
  }

  const therapyBookings = await prisma.therapySlot.findMany({
    where: { teacherId, status: { in: ["pendente", "confirmado"] }, date: { gte: new Date() } },
  });

  for (const b of therapyBookings) {
    const bStart = timeToMinutes(formatInTimeZone(b.date, TIME_ZONE, "HH:mm"));
    const bEnd = bStart + b.durationMinutes;
    if (!overlaps(start, end, bStart, bEnd)) continue;

    const sameOccasion = specificDate
      ? lisbonDayKey(specificDate) === lisbonDayKey(b.date)
      : weekday !== null && lisbonWeekday(b.date) === weekday;

    if (sameOccasion) conflicts.push(`marcação de terapia às ${minutesToTime(bStart)}`);
  }

  if (conflicts.length === 0) return null;
  return `Este professor já tem: ${conflicts.join(", ")}. Pode haver sobreposição de horário.`;
}

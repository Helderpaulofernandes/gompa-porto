import { addDays, addWeeks, startOfDay } from "date-fns";
import { pt } from "date-fns/locale";
import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";
import type { ClassSlot } from "@/lib/classSchedule";

const TIME_ZONE = "Europe/Lisbon";

export type Occurrence = {
  date: Date;
  isoDate: string;
  label: string;
};

/**
 * Gera as próximas ocorrências de uma aula com base no horário semanal,
 * a partir de agora, para as próximas `weeksAhead` semanas.
 * Todos os cálculos de dia/hora são feitos no fuso de Lisboa, independentemente
 * do fuso horário do servidor onde o código corre.
 */
export function formatLisbon(date: Date, pattern = "dd/MM/yyyy HH:mm") {
  return formatInTimeZone(date, TIME_ZONE, pattern, { locale: pt });
}

export function getUpcomingOccurrences(slots: ClassSlot[], weeksAhead = 5): Occurrence[] {
  if (slots.length === 0) return [];

  const now = new Date();
  const nowInLisbon = toZonedTime(now, TIME_ZONE);
  const occurrences: Occurrence[] = [];

  for (let week = 0; week < weeksAhead; week++) {
    for (const slot of slots) {
      const weekStart = addWeeks(startOfDay(nowInLisbon), week);
      const daysUntilWeekday = (slot.weekday - weekStart.getDay() + 7) % 7;
      const dayInLisbon = addDays(weekStart, daysUntilWeekday);

      const [hours, minutes] = slot.time.split(":").map(Number);
      const y = dayInLisbon.getFullYear();
      const m = String(dayInLisbon.getMonth() + 1).padStart(2, "0");
      const d = String(dayInLisbon.getDate()).padStart(2, "0");
      const hh = String(hours).padStart(2, "0");
      const mm = String(minutes).padStart(2, "0");

      const date = fromZonedTime(`${y}-${m}-${d}T${hh}:${mm}:00`, TIME_ZONE);

      if (date.getTime() <= now.getTime()) continue;

      occurrences.push({
        date,
        isoDate: date.toISOString(),
        label: formatInTimeZone(date, TIME_ZONE, "EEEE, d 'de' MMMM 'às' HH:mm", { locale: pt }),
      });
    }
  }

  return occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
}

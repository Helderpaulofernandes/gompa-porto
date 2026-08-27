"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { pt } from "date-fns/locale";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

const TIME_ZONE = "Europe/Lisbon";

export type TimeEntry = {
  key: string;
  date: Date;
  label: string;
  available: boolean;
  unavailableLabel?: string;
};

/** Chave de dia (yyyy-MM-dd) no calendário de Lisboa, independente do fuso do dispositivo. */
function lisbonDayKey(date: Date) {
  return formatInTimeZone(date, TIME_ZONE, "yyyy-MM-dd");
}

export default function AvailabilityCalendar({
  entries,
  onSelect,
}: {
  entries: TimeEntry[];
  onSelect: (entry: TimeEntry) => void;
}) {
  const today = startOfDay(toZonedTime(new Date(), TIME_ZONE));
  const [month, setMonth] = useState(startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, TimeEntry[]>();
    for (const entry of entries) {
      const key = lisbonDayKey(entry.date);
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.date.getTime() - b.date.getTime());
    return map;
  }, [entries]);

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const selectedEntries = selectedDay ? (entriesByDay.get(format(selectedDay, "yyyy-MM-dd")) ?? []) : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonth((m) => subMonths(m, 1))}
          disabled={!isSameMonth(month, today) && isBefore(month, today)}
          className="rounded-full border border-gold/40 px-3 py-1 text-sm text-ink/70 hover:border-maroon disabled:opacity-30"
        >
          ←
        </button>
        <p className="text-sm font-semibold capitalize text-maroon">
          {format(month, "MMMM yyyy", { locale: pt })}
        </p>
        <button
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="rounded-full border border-gold/40 px-3 py-1 text-sm text-ink/70 hover:border-maroon"
        >
          →
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-ink/40">
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayEntries = entriesByDay.get(format(day, "yyyy-MM-dd")) ?? [];
          const hasAvailable = dayEntries.some((e) => e.available);
          const inMonth = isSameMonth(day, month);
          const isPast = isBefore(day, today);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const clickable = inMonth && !isPast && hasAvailable;

          return (
            <button
              key={day.toISOString()}
              disabled={!clickable}
              onClick={() => setSelectedDay(day)}
              className={`aspect-square rounded-lg text-sm transition ${
                !inMonth
                  ? "text-transparent"
                  : isSelected
                    ? "bg-maroon font-semibold text-cream"
                    : clickable
                      ? "bg-gold-light/40 font-semibold text-maroon hover:bg-gold-light/70"
                      : "text-ink/25"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-ink">
            Horários — <span className="capitalize">{format(selectedDay, "EEEE, d 'de' MMMM", { locale: pt })}</span>
          </p>
          {selectedEntries.length === 0 ? (
            <p className="mt-2 text-sm text-ink/50">Sem horários neste dia.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedEntries.map((entry) => (
                <button
                  key={entry.key}
                  disabled={!entry.available}
                  onClick={() => onSelect(entry)}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    entry.available
                      ? "border-maroon text-maroon hover:bg-maroon hover:text-cream"
                      : "cursor-not-allowed border-ink/10 bg-ink/5 text-ink/35"
                  }`}
                >
                  {entry.label}
                  {!entry.available && entry.unavailableLabel && (
                    <span className="ml-1 text-xs">({entry.unavailableLabel})</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

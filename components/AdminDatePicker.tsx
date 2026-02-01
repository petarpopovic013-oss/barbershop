"use client";

import { useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

type Props = {
  value: string;
  onChange: (dateStr: string) => void;
  datesWithReservations?: Set<string>;
  className?: string;
};

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function AdminDatePicker({
  value,
  onChange,
  datesWithReservations = new Set(),
  className = "",
}: Props) {
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = value.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });

  const selectedDate = new Date(value + "T12:00:00");
  const today = new Date();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    onChange(toDateStr(now));
  };

  const handleDayClick = (day: number) => {
    const d = new Date(year, month, day);
    onChange(toDateStr(d));
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div
      className={`admin-date-picker rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-sm ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          {MONTHS[month]} {year}
        </h3>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground-muted)] transition-colors hover:bg-white/5 hover:text-[var(--foreground)] focus-ring"
            aria-label="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground-muted)] transition-colors hover:bg-white/5 hover:text-[var(--foreground)] focus-ring"
            aria-label="Next month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-medium uppercase tracking-wider text-[var(--foreground-muted)]"
          >
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} />;
          }
          const dateStr = toDateStr(new Date(year, month, day));
          const hasReservations = datesWithReservations.has(dateStr);
          const todayClass = isToday(day);
          const selectedClass = isSelected(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              className={`
                relative flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all
                focus-ring
                ${selectedClass
                  ? "bg-[var(--accent)] text-white shadow-md"
                  : todayClass
                    ? "border border-[var(--accent)]/60 text-[var(--accent)] hover:bg-[var(--accent)]/20"
                    : "text-[var(--foreground)] hover:bg-white/5"
                }
              `}
            >
              {day}
              {hasReservations && !selectedClass && (
                <span
                  className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${todayClass ? "bg-[var(--accent)]" : "bg-[var(--foreground-muted)]"}`}
                />
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={goToToday}
        className="w-full rounded-lg border border-[var(--border-muted)] py-2 text-xs font-medium text-[var(--foreground-muted)] transition-colors hover:border-[var(--accent)]/50 hover:bg-white/5 hover:text-[var(--foreground)] focus-ring"
      >
        Today
      </button>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import type { Barber, BarberAvailability, BarberAvailabilityInput } from "@/types/supabase";
import { upsertAvailability, deleteAvailability } from "@/app/admin/availability/actions";

type Props = {
  barbers: Barber[];
  initialAvailability: BarberAvailability[];
  initialBarberId: number;
  initialWeekStart: string;
};

const SERBIAN_DAYS = ["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
const SERBIAN_DAYS_SHORT = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub"];

function formatSerbianDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function dateToString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getWeekDates(mondayStr: string): string[] {
  const monday = new Date(mondayStr + "T12:00:00");
  const dates: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(dateToString(d));
  }
  return dates;
}

export function AdminAvailabilityCalendar({ barbers, initialAvailability, initialBarberId, initialWeekStart }: Props) {
  const [selectedBarberId, setSelectedBarberId] = useState(initialBarberId);
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [availability, setAvailability] = useState<Map<string, boolean>>(() => {
    const map = new Map<string, boolean>();
    initialAvailability.forEach((a) => {
      map.set(a.date, a.is_available);
    });
    return map;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const weekEndDate = weekDates[5];

  const handlePreviousWeek = () => {
    const monday = new Date(weekStart + "T12:00:00");
    monday.setDate(monday.getDate() - 7);
    const newWeekStart = dateToString(monday);
    setWeekStart(newWeekStart);
    fetchAvailabilityForWeek(selectedBarberId, newWeekStart);
  };

  const handleNextWeek = () => {
    const monday = new Date(weekStart + "T12:00:00");
    monday.setDate(monday.getDate() + 7);
    const newWeekStart = dateToString(monday);
    setWeekStart(newWeekStart);
    fetchAvailabilityForWeek(selectedBarberId, newWeekStart);
  };

  const handleBarberChange = (barberId: number) => {
    setSelectedBarberId(barberId);
    fetchAvailabilityForWeek(barberId, weekStart);
  };

  const fetchAvailabilityForWeek = async (barberId: number, mondayStr: string) => {
    const dates = getWeekDates(mondayStr);
    const endDate = dates[5];
    
    try {
      const response = await fetch(
        `/api/admin/availability?barberId=${barberId}&startDate=${mondayStr}&endDate=${endDate}`
      );
      const data = await response.json();
      
      if (data.ok) {
        const newMap = new Map<string, boolean>();
        data.availability.forEach((a: BarberAvailability) => {
          newMap.set(a.date, a.is_available);
        });
        setAvailability(newMap);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  const toggleDay = (date: string) => {
    setAvailability((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(date) ?? true;
      newMap.set(date, !current);
      return newMap;
    });
  };

  const markAllUnavailable = () => {
    setAvailability((prev) => {
      const newMap = new Map(prev);
      weekDates.forEach((date) => {
        newMap.set(date, false);
      });
      return newMap;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const unavailableDays = weekDates.filter((date) => {
        const isAvailable = availability.get(date) ?? true;
        return !isAvailable;
      });

      const unavailableRecords: BarberAvailabilityInput[] = unavailableDays.map((date) => ({
        barber_id: selectedBarberId,
        date,
        is_available: false,
        working_hours_start: "09:00:00",
        working_hours_end: "17:00:00",
      }));

      const availableDays = weekDates.filter((date) => {
        const isAvailable = availability.get(date) ?? true;
        return isAvailable;
      });

      console.log("Unavailable days to save:", unavailableRecords);
      console.log("Available days to delete records for:", availableDays);

      if (unavailableRecords.length > 0) {
        const upsertResult = await upsertAvailability(unavailableRecords);
        if (!upsertResult.ok) {
          const errorMsg = upsertResult.error ? `${upsertResult.message}: ${upsertResult.error}` : upsertResult.message;
          setMessage({ text: errorMsg, type: "error" });
          setIsSaving(false);
          return;
        }
      }

      if (availableDays.length > 0) {
        const deleteResult = await deleteAvailability(selectedBarberId, availableDays);
        if (!deleteResult.ok) {
          console.warn("Failed to delete availability records:", deleteResult);
        }
      }

      setIsSaving(false);
      setMessage({ text: "Dostupnost sačuvana!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error during save:", error);
      setIsSaving(false);
      setMessage({ 
        text: `Greška: ${error instanceof Error ? error.message : "Unknown error"}`, 
        type: "error" 
      });
    }
  };

  return (
    <div className="admin-availability mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8 border-b border-white/10 pb-6 sm:mb-12 sm:pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h1 className="font-heading text-[28px] text-white sm:text-[42px] md:text-[48px] lg:text-[56px]">
              DOSTUPNOST
            </h1>
            <span className="mt-2 block h-[3px] w-12 bg-white/70 sm:mt-3 sm:w-16" />
            <p className="mt-3 text-[13px] text-white/60 sm:mt-4 sm:text-[15px]">
              Upravljanje radnim danima i dostupnošću
            </p>
          </div>
          <a href="/admin"
            className="flex w-fit items-center gap-1.5 min-h-[40px] rounded-full border-2 border-white/20 bg-transparent px-4 py-2 text-[10px] font-bold tracking-[0.12em] uppercase text-white transition-all duration-300 hover:border-[#525252] hover:bg-[#404040] sm:min-h-[44px] sm:px-6 sm:py-2.5 sm:text-[11px] sm:tracking-[0.15em] sm:gap-2 focus-ring">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sm:w-4 sm:h-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Nazad
          </a>
        </div>
      </header>

      {/* Controls */}
      <div className="mb-8 space-y-4 sm:mb-10 sm:space-y-6">
        <div className="rounded-[16px] border border-white/10 bg-[#1a1a1a] p-4 sm:rounded-[20px] sm:p-6">
          <label className="mb-3 block font-heading text-[12px] uppercase tracking-widest text-white/80 sm:mb-4 sm:text-[13px]">
            Izaberi berbera
          </label>
          <select
            value={selectedBarberId}
            onChange={(e) => handleBarberChange(Number(e.target.value))}
            className="w-full min-h-[44px] rounded-full border-2 border-white/20 bg-[#141417] px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 focus:border-[#525252] focus:outline-none focus:ring-2 focus:ring-[#525252]/50 sm:min-h-[48px] sm:px-5 sm:py-3"
          >
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between gap-2 rounded-[16px] border border-white/10 bg-[#1a1a1a] p-3 sm:gap-4 sm:rounded-[20px] sm:p-6">
          <button
            type="button"
            onClick={handlePreviousWeek}
            className="flex items-center gap-1 min-h-[40px] rounded-full border-2 border-white/20 bg-transparent px-3 py-2 text-[10px] font-bold tracking-[0.1em] uppercase text-white transition-all duration-300 hover:border-[#525252] hover:bg-[#404040] sm:min-h-[48px] sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.15em] sm:gap-2 focus-ring"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="hidden sm:inline">Prethodna</span>
          </button>

          <span className="font-heading text-[11px] uppercase tracking-wider text-white/90 text-center sm:text-[14px]">
            <span className="hidden sm:inline">{formatSerbianDate(weekStart)} - {formatSerbianDate(weekEndDate)}</span>
            <span className="sm:hidden">{formatShortDate(weekStart)} - {formatShortDate(weekEndDate)}</span>
          </span>

          <button
            type="button"
            onClick={handleNextWeek}
            className="flex items-center gap-1 min-h-[40px] rounded-full border-2 border-white/20 bg-transparent px-3 py-2 text-[10px] font-bold tracking-[0.1em] uppercase text-white transition-all duration-300 hover:border-[#525252] hover:bg-[#404040] sm:min-h-[48px] sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.15em] sm:gap-2 focus-ring"
          >
            <span className="hidden sm:inline">Sledeća</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="mb-8 space-y-3 sm:mb-10 sm:space-y-4">
        {weekDates.map((date, index) => {
          const isAvailable = availability.get(date) ?? true;
          return (
            <div
              key={date}
              className={`rounded-[14px] border-2 p-4 transition-all duration-300 sm:rounded-[20px] sm:p-6 ${
                isAvailable
                  ? "border-white/30 bg-white/5"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <p className="font-heading text-[14px] uppercase tracking-wider text-white sm:text-[16px] md:text-[18px]">
                    <span className="sm:hidden">{SERBIAN_DAYS_SHORT[index]}</span>
                    <span className="hidden sm:inline">{SERBIAN_DAYS[index]}</span>
                  </p>
                  <p className="mt-0.5 text-[12px] text-white/60 sm:mt-1 sm:text-[13px]">
                    {formatSerbianDate(date)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDay(date)}
                  className={`shrink-0 min-h-[40px] rounded-full px-4 py-2 text-[10px] font-bold tracking-[0.1em] uppercase transition-all duration-300 sm:min-h-[48px] sm:px-6 sm:py-2.5 sm:text-[11px] sm:tracking-[0.15em] focus-ring ${
                    isAvailable
                      ? "bg-white/90 text-[#1a1a1a] hover:bg-white"
                      : "border-2 border-white/20 bg-transparent text-white/60 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {isAvailable ? "Dostupan" : "Nedostupan"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <button
          type="button"
          onClick={markAllUnavailable}
          className="flex items-center justify-center gap-2 min-h-[44px] rounded-full border-2 border-white/20 bg-transparent px-5 py-2.5 text-[10px] font-bold tracking-[0.12em] uppercase text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10 sm:min-h-[48px] sm:px-6 sm:text-[11px] sm:tracking-[0.15em] focus-ring"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Markiraj nedostupno
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 min-h-[44px] rounded-full bg-white/90 px-6 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase text-[#1a1a1a] transition-all duration-300 hover:bg-white sm:min-h-[48px] sm:px-8 sm:text-[11px] sm:tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Čuvanje...
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Sačuvaj promene
            </>
          )}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mt-4 flex items-center gap-3 rounded-[14px] border-2 px-4 py-3 text-[13px] sm:mt-6 sm:rounded-[20px] sm:px-6 sm:py-4 sm:text-sm ${
            message.type === "success"
              ? "border-white/30 bg-white/5 text-white/90"
              : "border-red-500/50 bg-red-500/10 text-red-400"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0 sm:w-5 sm:h-5"
          >
            {message.type === "success" ? (
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            ) : (
              <circle cx="12" cy="12" r="10" />
            )}
            {message.type === "success" ? (
              <polyline points="22 4 12 14.01 9 11.01" />
            ) : (
              <>
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </>
            )}
          </svg>
          {message.text}
        </div>
      )}
    </div>
  );
}

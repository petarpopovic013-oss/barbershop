"use client";

import { useState, useMemo } from "react";
import type { Barber, BarberAvailability, BarberAvailabilityInput } from "@/types/supabase";
import { upsertAvailability, deleteAvailability } from "@/app/admin/availability/actions";

type Props = {
  barbers: Barber[];
  initialAvailability: BarberAvailability[];
  initialBarberId: number;
  initialWeekStart: string; // YYYY-MM-DD
};

const SERBIAN_DAYS = ["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];

function formatSerbianDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
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
      // Step 1: Find days that should be UNAVAILABLE (save these)
      const unavailableDays = weekDates.filter((date) => {
        const isAvailable = availability.get(date) ?? true;
        return !isAvailable; // Only include unavailable days
      });

      const unavailableRecords: BarberAvailabilityInput[] = unavailableDays.map((date) => ({
        barber_id: selectedBarberId,
        date,
        is_available: false,
        working_hours_start: "09:00:00",
        working_hours_end: "17:00:00",
      }));

      // Step 2: Find days that should be AVAILABLE (delete these records if they exist)
      const availableDays = weekDates.filter((date) => {
        const isAvailable = availability.get(date) ?? true;
        return isAvailable; // Only include available days
      });

      console.log("Unavailable days to save:", unavailableRecords);
      console.log("Available days to delete records for:", availableDays);

      // Save unavailable days
      if (unavailableRecords.length > 0) {
        const upsertResult = await upsertAvailability(unavailableRecords);
        if (!upsertResult.ok) {
          const errorMsg = upsertResult.error ? `${upsertResult.message}: ${upsertResult.error}` : upsertResult.message;
          setMessage({ text: errorMsg, type: "error" });
          setIsSaving(false);
          return;
        }
      }

      // Delete records for available days (to revert back to default available state)
      if (availableDays.length > 0) {
        const deleteResult = await deleteAvailability(selectedBarberId, availableDays);
        if (!deleteResult.ok) {
          console.warn("Failed to delete availability records:", deleteResult);
          // Don't show error to user, as the main operation succeeded
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
    <div className="admin-availability mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F5F5F7] sm:text-4xl">
            Dostupnost berbera
          </h1>
          <p className="mt-1 text-base text-[#A1A1A6]">
            Upravljanje radnim danima i dostupnošću
          </p>
        </div>
        <a href="/admin"
          className="admin-btn-secondary flex items-center gap-2 min-h-[44px] rounded-lg border border-[#2A2A2F] px-5 py-2.5 text-sm font-medium text-[#A1A1A6] transition-all hover:border-[#3A3A40] hover:bg-[#1A1A1F] hover:text-[#F5F5F7] focus-ring">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Nazad na raspored
        </a>
      </header>

      {/* Controls */}
      <div className="mb-8 space-y-5">
        <div className="rounded-[14px] border border-[#2A2A2F] bg-[#141417] p-5">
          <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-[#A1A1A6]">
            Izaberi berbera
          </label>
          <select
            value={selectedBarberId}
            onChange={(e) => handleBarberChange(Number(e.target.value))}
            className="admin-select w-full min-h-[44px] rounded-lg border border-[#2A2A2F] bg-[#0A0A0B] px-4 py-2.5 text-sm text-[#F5F5F7] transition-colors focus:border-[#D3AF37] focus:outline-none focus:ring-2 focus:ring-[#D3AF37]/25"
          >
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#2A2A2F] bg-[#141417] p-5">
          <button
            type="button"
            onClick={handlePreviousWeek}
            className="flex items-center gap-2 min-h-[44px] rounded-lg border border-[#2A2A2F] px-4 py-2.5 text-sm font-medium text-[#A1A1A6] transition-all hover:border-[#3A3A40] hover:bg-[#1A1A1F] hover:text-[#F5F5F7] focus-ring"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Prethodna nedelja
          </button>

          <span className="text-sm font-semibold text-[#F5F5F7]">
            {formatSerbianDate(weekStart)} - {formatSerbianDate(weekEndDate)}
          </span>

          <button
            type="button"
            onClick={handleNextWeek}
            className="flex items-center gap-2 min-h-[44px] rounded-lg border border-[#2A2A2F] px-4 py-2.5 text-sm font-medium text-[#A1A1A6] transition-all hover:border-[#3A3A40] hover:bg-[#1A1A1F] hover:text-[#F5F5F7] focus-ring"
          >
            Sledeća nedelja
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="mb-8 space-y-4">
        {weekDates.map((date, index) => {
          const isAvailable = availability.get(date) ?? true;
          return (
            <div
              key={date}
              className={`rounded-[14px] border p-5 transition-all ${
                isAvailable
                  ? "border-green-500/40 bg-green-500/15"
                  : "border-[#2A2A2F] bg-[#141417]"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-[#F5F5F7]">
                    {SERBIAN_DAYS[index]}, {formatSerbianDate(date)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDay(date)}
                  className={`min-h-[44px] rounded-lg px-6 py-2.5 text-sm font-semibold transition-all focus-ring ${
                    isAvailable
                      ? "bg-green-500/25 text-green-400 hover:bg-green-500/35"
                      : "bg-[#2A2A2F] text-[#6B6B70] hover:bg-[#3A3A40]"
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
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={markAllUnavailable}
          className="flex items-center gap-2 min-h-[44px] rounded-lg border border-[#2A2A2F] bg-[#141417] px-5 py-2.5 text-sm font-medium text-[#A1A1A6] transition-all hover:border-[#3A3A40] hover:bg-[#1A1A1F] hover:text-[#F5F5F7] focus-ring"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Markiranje cele nedelje kao nedostupna
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 min-h-[44px] rounded-lg bg-[#D3AF37] px-6 py-2.5 text-sm font-semibold text-[#0A0A0B] transition-all hover:bg-[#E5C154] focus:outline-none focus:ring-2 focus:ring-[#D3AF37] focus:ring-offset-2 focus:ring-offset-[#0A0A0B] disabled:opacity-50 disabled:cursor-not-allowed"
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
          className={`mt-6 flex items-center gap-3 rounded-[14px] border px-5 py-4 text-sm ${
            message.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
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

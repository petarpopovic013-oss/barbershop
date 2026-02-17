import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { AdminShell } from "@/components/AdminShell";
import { AdminAvailabilityCalendar } from "@/components/AdminAvailabilityCalendar";
import type { Barber, BarberAvailability } from "@/types/supabase";

async function fetchBarbers(): Promise<Barber[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("Barbers")
    .select("id, name, active")
    .eq("active", true)
    .order("id");
  
  if (error) {
    console.error("Error fetching barbers:", error);
    return [];
  }
  return data ?? [];
}

async function fetchAvailability(
  barberId: number,
  startDate: string,
  endDate: string
): Promise<BarberAvailability[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("barber_availability")
    .select("*")
    .eq("barber_id", barberId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date");

  if (error) {
    console.error("Error fetching availability:", error);
    return [];
  }
  return data ?? [];
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

export default async function AvailabilityPage() {
  const barbers = await fetchBarbers();
  
  if (barbers.length === 0) {
    return (
      <AdminShell>
        <main className="min-h-screen bg-[#0A0A0B] pt-2">
          <div className="mx-auto max-w-7xl px-4 py-8 text-center">
            <p className="text-[#A1A1A6]">Nema dostupnih berbera</p>
          </div>
        </main>
      </AdminShell>
    );
  }

  const firstBarberId = barbers[0].id;
  const today = new Date();
  const monday = getMonday(today);
  const weekStart = dateToString(monday);
  
  // Calculate Saturday (6 days from Monday)
  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);
  const weekEnd = dateToString(saturday);

  const availability = await fetchAvailability(firstBarberId, weekStart, weekEnd);

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#0A0A0B] pt-2">
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl px-4 py-8 text-center text-[#A1A1A6]">
              Loading...
            </div>
          }
        >
          <AdminAvailabilityCalendar
            barbers={barbers}
            initialAvailability={availability}
            initialBarberId={firstBarberId}
            initialWeekStart={weekStart}
          />
        </Suspense>
      </main>
    </AdminShell>
  );
}

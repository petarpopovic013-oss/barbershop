import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { AdminShell } from "@/components/AdminShell";
import { AdminCalendar } from "@/components/AdminCalendar";

type Barber = { id: number; name: string };
type Service = { id: number; service_name: string; duration_minutes: number; price_rsd: number };
type Reservation = {
  id: number;
  barber_id: number;
  service_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  start_time: string;
  end_time: string;
};

async function fetchBarbers(): Promise<Barber[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("Barbers")
    .select("id, name")
    .eq("active", true)
    .order("id");
  if (error) {
    console.error("Error fetching barbers:", error);
    return [];
  }
  return data ?? [];
}

async function fetchServices(): Promise<Service[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("Services")
    .select("id, service_name, duration_minutes, price_rsd");
  if (error) {
    console.error("Error fetching services:", error);
    return [];
  }
  return data ?? [];
}

async function fetchReservations(
  dateStr: string,
  barberId: string | null
): Promise<Reservation[]> {
  const dayStart = `${dateStr}T00:00:00.000Z`;
  const dayEnd = `${dateStr}T23:59:59.999Z`;
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("Reservations")
    .select("id, barber_id, service_id, customer_name, customer_phone, customer_email, start_time, end_time")
    .gte("start_time", dayStart)
    .lte("start_time", dayEnd);
  if (barberId && barberId !== "all") {
    const id = parseInt(barberId, 10);
    if (!isNaN(id)) query = query.eq("barber_id", id);
  }
  const { data, error } = await query.order("start_time");
  if (error) {
    console.error("Error fetching reservations:", error);
    throw new Error("Failed to fetch reservations");
  }
  return data ?? [];
}

export default async function AdminPage(props: {
  searchParams: Promise<{ date?: string; barber?: string }>;
}) {
  const searchParams = await props.searchParams;
  const today = new Date();
  const dateStr =
    searchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date)
      ? searchParams.date
      : today.toISOString().slice(0, 10);
  const barberFilter = searchParams.barber ?? "all";

  let barbers: Barber[] = [];
  let services: Service[] = [];
  let reservations: Reservation[] = [];
  let fetchError: string | null = null;

  try {
    [barbers, services, reservations] = await Promise.all([
      fetchBarbers(),
      fetchServices(),
      fetchReservations(dateStr, barberFilter),
    ]);
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "Failed to load data";
  }

  return (
    <AdminShell>
      <main id="main-content" className="min-h-screen bg-[#0A0A0B] pt-2">
        <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8 text-center text-[#A1A1A6]">Loading...</div>}>
          <AdminCalendar
            barbers={barbers}
            services={services}
            reservations={reservations}
            dateStr={dateStr}
            barberFilter={barberFilter}
            fetchError={fetchError}
          />
        </Suspense>
      </main>
    </AdminShell>
  );
}

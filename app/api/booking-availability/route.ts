import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/booking-availability?barberId=1&startDate=2026-02-17&endDate=2026-02-22
 * Returns availability data and reservations for date filtering in booking modal
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barberIdParam = searchParams.get("barberId");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (!barberIdParam || !startDateParam || !endDateParam) {
      return NextResponse.json(
        { ok: false, message: "Missing required parameters" },
        { status: 400 }
      );
    }

    const barberId = parseInt(barberIdParam, 10);
    if (isNaN(barberId)) {
      return NextResponse.json(
        { ok: false, message: "Invalid barberId" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Fetch availability records for the date range
    const { data: availabilityRecords, error: availError } = await supabase
      .from("barber_availability")
      .select("date, is_available, working_hours_start, working_hours_end")
      .eq("barber_id", barberId)
      .gte("date", startDateParam)
      .lte("date", endDateParam);

    if (availError) {
      console.error("Error fetching availability:", availError);
      return NextResponse.json(
        { ok: false, message: "Failed to fetch availability" },
        { status: 500 }
      );
    }

    // Fetch all reservations for the date range
    const startDateTime = `${startDateParam}T00:00:00.000Z`;
    const endDateTime = `${endDateParam}T23:59:59.999Z`;

    const { data: reservations, error: resError } = await supabase
      .from("Reservations")
      .select("start_time, end_time")
      .eq("barber_id", barberId)
      .gte("start_time", startDateTime)
      .lte("start_time", endDateTime);

    if (resError) {
      console.error("Error fetching reservations:", resError);
      return NextResponse.json(
        { ok: false, message: "Failed to fetch reservations" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      availability: availabilityRecords ?? [],
      reservations: reservations ?? [],
    });
  } catch (error) {
    console.error("Error in GET /api/booking-availability:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

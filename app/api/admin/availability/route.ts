import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barberId = searchParams.get("barberId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!barberId || !startDate || !endDate) {
    return NextResponse.json(
      { ok: false, message: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
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
      return NextResponse.json(
        { ok: false, message: "Failed to fetch availability" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      availability: data ?? [],
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

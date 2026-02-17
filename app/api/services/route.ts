import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/services
 * Returns all active services ordered by service_name.
 * 
 * Uses existing Services table with columns:
 * - id (bigint)
 * - service_name (text)
 * - duration_minutes (integer)
 * - price_rsd (bigint)
 * - active (boolean)
 */
export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("Services")
      .select("id, service_name, price_rsd, duration_minutes, active")
      .eq("active", true)
      .order("service_name", { ascending: true });

    if (error) {
      console.error("Supabase error fetching services:", error);
      return NextResponse.json(
        { ok: false, message: "Failed to fetch services", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, services: data ?? [] });
  } catch (error) {
    console.error("Error in GET /api/services:", error);
    
    // Check if it's the missing env vars error
    if (error instanceof Error && error.message.includes("environment variables")) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

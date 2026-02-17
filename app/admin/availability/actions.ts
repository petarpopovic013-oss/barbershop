"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import type { ApiResponse, BarberAvailabilityInput } from "@/types/supabase";

export async function upsertAvailability(
  records: BarberAvailabilityInput[]
): Promise<ApiResponse> {
  try {
    const supabase = createSupabaseServerClient();
    
    // Process each record individually (these are only UNAVAILABLE days)
    for (const record of records) {
      // First, check if a record exists for this barber and date
      const { data: existing } = await supabase
        .from("barber_availability")
        .select("id")
        .eq("barber_id", record.barber_id)
        .eq("date", record.date)
        .single();

      if (existing) {
        // Update existing record to unavailable
        const { error: updateError } = await supabase
          .from("barber_availability")
          .update({
            is_available: false,
            working_hours_start: record.working_hours_start,
            working_hours_end: record.working_hours_end,
          })
          .eq("id", existing.id);

        if (updateError) {
          console.error("Error updating availability:", updateError);
          return {
            ok: false,
            message: `Greška pri ažuriranju: ${updateError.message}`,
            error: updateError.message,
          };
        }
      } else {
        // Insert new record (unavailable)
        const { error: insertError } = await supabase
          .from("barber_availability")
          .insert({
            barber_id: record.barber_id,
            date: record.date,
            is_available: false,
            working_hours_start: record.working_hours_start,
            working_hours_end: record.working_hours_end,
          });

        if (insertError) {
          console.error("Error inserting availability:", insertError);
          return {
            ok: false,
            message: `Greška pri dodavanju: ${insertError.message}`,
            error: insertError.message,
          };
        }
      }
    }

    return {
      ok: true,
      message: "Dostupnost sačuvana!",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      ok: false,
      message: "Neočekivana greška pri čuvanju",
    };
  }
}

export async function deleteAvailability(
  barberId: number,
  dates: string[]
): Promise<ApiResponse> {
  try {
    const supabase = createSupabaseServerClient();
    
    const { error } = await supabase
      .from("barber_availability")
      .delete()
      .eq("barber_id", barberId)
      .in("date", dates);

    if (error) {
      console.error("Error deleting availability:", error);
      return {
        ok: false,
        message: `Greška pri brisanju: ${error.message}`,
        error: error.message,
      };
    }

    return {
      ok: true,
      message: "Dostupnost obrisana!",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      ok: false,
      message: "Neočekivana greška pri brisanju",
    };
  }
}

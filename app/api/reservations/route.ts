import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/reservations?barberId=1&date=2025-02-03
 * Or: ?barberId=1&dayStart=2025-02-03T00:00:00.000Z&dayEnd=2025-02-03T23:59:59.999Z
 * Returns existing reservations for a barber on a given date.
 * Use dayStart/dayEnd (ISO) for the user's local day; otherwise date is interpreted as UTC day.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barberIdParam = searchParams.get("barberId");
    const dateParam = searchParams.get("date");
    const dayStartParam = searchParams.get("dayStart");
    const dayEndParam = searchParams.get("dayEnd");

    if (!barberIdParam) {
      return NextResponse.json(
        { ok: false, message: "barberId query param is required" },
        { status: 400 }
      );
    }

    const barberId = parseInt(barberIdParam, 10);
    if (isNaN(barberId) || barberId < 1) {
      return NextResponse.json(
        { ok: false, message: "barberId must be a positive integer" },
        { status: 400 }
      );
    }

    let dayStart: string;
    let dayEnd: string;

    if (dayStartParam && dayEndParam) {
      dayStart = dayStartParam;
      dayEnd = dayEndParam;
      if (Number.isNaN(Date.parse(dayStart)) || Number.isNaN(Date.parse(dayEnd))) {
        return NextResponse.json(
          { ok: false, message: "dayStart and dayEnd must be valid ISO datetimes" },
          { status: 400 }
        );
      }
    } else if (dateParam) {
      const dateOnly = dateParam.slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
        return NextResponse.json(
          { ok: false, message: "date must be YYYY-MM-DD" },
          { status: 400 }
        );
      }
      dayStart = `${dateOnly}T00:00:00.000Z`;
      dayEnd = `${dateOnly}T23:59:59.999Z`;
    } else {
      return NextResponse.json(
        { ok: false, message: "Either date or both dayStart and dayEnd are required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    
    // Fetch reservations
    const { data: reservations, error } = await supabase
      .from("Reservations")
      .select("start_time, end_time")
      .eq("barber_id", barberId)
      .gte("start_time", dayStart)
      .lte("start_time", dayEnd);

    if (error) {
      console.error("Error fetching reservations:", error);
      return NextResponse.json(
        { ok: false, message: "Failed to fetch reservations", error: error.message },
        { status: 500 }
      );
    }

    // Check availability for this date
    const dateOnly = dayStart.slice(0, 10); // Extract YYYY-MM-DD
    const { data: availability } = await supabase
      .from("barber_availability")
      .select("is_available")
      .eq("barber_id", barberId)
      .eq("date", dateOnly)
      .maybeSingle();

    // If no availability record exists, assume available (default behavior)
    const isAvailable = availability?.is_available ?? true;

    return NextResponse.json({
      ok: true,
      reservations: reservations ?? [],
      isAvailable,
    });
  } catch (error) {
    console.error("Error in GET /api/reservations:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

const SLOT_DURATION = 30;

/**
 * Validation schema for reservation payload
 * Using existing database schema with bigint IDs; service_ids stores selected services.
 */
const reservationSchema = z.object({
  barberId: z.coerce.number().int().positive("Barber ID must be a positive integer"),
  serviceIds: z.array(z.coerce.number().int().positive()).min(1, "At least one service is required"),
  customerName: z.string().trim().min(1, "Customer name is required"),
  customerPhone: z.string().trim().min(1, "Customer phone is required"),
  customerEmail: z.union([
    z.string().email("Valid email is required"),
    z.literal(""),
  ]).optional().transform((v) => (v === "" ? undefined : v)),
  startTime: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "Start time must be a valid ISO datetime",
  }),
  endTime: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "End time must be a valid ISO datetime",
  }),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD").optional(),
  bookingTime: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM").optional(),
  notes: z.string().optional(),
});

type ReservationPayload = z.infer<typeof reservationSchema>;

/**
 * POST /api/reservations
 * Creates a new reservation in the database.
 * 
 * Expected JSON body:
 * {
 *   barberId: number (bigint ID from Barbers table),
 *   serviceIds: number[] (array of Service IDs),
 *   customerName: string,
 *   customerPhone: string,
 *   customerEmail?: string,
 *   startTime: string (ISO),
 *   endTime: string (ISO),
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate payload
    const validationResult = reservationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid request data",
          errors: validationResult.error.issues.map((issue) => ({
            field: String(issue.path.join(".")),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const payload: ReservationPayload = validationResult.data;
    const supabase = createSupabaseServerClient();

    // Step 0: Check if barber is available on the selected date
    const bookingDate = payload.bookingDate || new Date(payload.startTime).toISOString().slice(0, 10);
    const { data: availability } = await supabase
      .from("barber_availability")
      .select("is_available")
      .eq("barber_id", payload.barberId)
      .eq("date", bookingDate)
      .maybeSingle();

    // If availability record exists and is_available is false, reject the booking
    if (availability && !availability.is_available) {
      return NextResponse.json(
        {
          ok: false,
          message: "Izabrani berber nije dostupan na ovaj datum. Molimo izaberite drugi dan.",
        },
        { status: 400 }
      );
    }

    // Step 1: Create or find customer in Customer table
    let customerId: number | null = null;

    // Try to parse phone as number (Customer.phone is bigint)
    const phoneNumber = parseInt(payload.customerPhone.replace(/\D/g, ""), 10);
    
    if (isNaN(phoneNumber)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid phone number format",
        },
        { status: 400 }
      );
    }

    // Check if customer already exists by phone
    const { data: existingCustomer, error: customerFindError } = await supabase
      .from("Customer")
      .select("id")
      .eq("phone", phoneNumber)
      .maybeSingle();

    if (customerFindError && customerFindError.code !== "PGRST116") {
      console.error("Error finding customer:", customerFindError);
      return NextResponse.json(
        {
          ok: false,
          message: "Failed to check existing customer",
          error: customerFindError.message,
        },
        { status: 500 }
      );
    }

    if (existingCustomer) {
      // Customer exists, use their ID
      customerId = existingCustomer.id;
    } else {
      // Create new customer
      const { data: newCustomer, error: customerCreateError } = await supabase
        .from("Customer")
        .insert({
          name: payload.customerName,
          phone: phoneNumber,
          email: payload.customerEmail || null,
        })
        .select("id")
        .single();

      if (customerCreateError) {
        console.error("Error creating customer:", customerCreateError);
        // Fallback: still create reservation with customer_id null so the booking isn't lost.
        // Add SUPABASE_SERVICE_ROLE_KEY in .env.local so Customer inserts succeed (bypasses RLS).
        if (customerCreateError.code === "42501" || customerCreateError.message.includes("policy")) {
          console.warn(
            "Customer insert denied (RLS). Create reservation with customer_id null. " +
            "Set SUPABASE_SERVICE_ROLE_KEY in .env.local to fix."
          );
        }
        // customerId stays null; reservation will be created with customer_id null below
      } else {
        customerId = newCustomer.id;
      }
    }

    // Step 2: Insert reservation with customer_id and service_ids
    const { data, error } = await supabase
      .from("Reservations")
      .insert({
        barber_id: payload.barberId,
        service_id: payload.serviceIds[0] ?? null,
        service_ids: payload.serviceIds,
        customer_id: customerId,
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone,
        customer_email: payload.customerEmail || null,
        start_time: payload.startTime,
        end_time: payload.endTime,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error creating reservation:", error);

      // Check if it's an RLS policy error
      if (error.code === "42501" || error.message.includes("policy")) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "Database permission denied. Please create an INSERT policy for the Reservations table that allows public inserts.",
            hint: "You may need to add a policy like: CREATE POLICY 'Allow public inserts' ON \"Reservations\" FOR INSERT WITH CHECK (true);",
            error: error.message,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          message: "Failed to create reservation",
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Step 3: Send reservation data to N8N webhook for email automation
    const webhookUrl = process.env.N8N_WEBHOOK;
    if (webhookUrl) {
      // Fetch barber and service names for the webhook payload
      const barberPromise = supabase.from("Barbers").select("name").eq("id", payload.barberId).single();
      const servicesPromise = payload.serviceIds.length > 0
        ? supabase.from("Services").select("service_name, price_rsd").in("id", payload.serviceIds)
        : Promise.resolve({ data: [] });
      const [{ data: barberData }, { data: servicesData }] = await Promise.all([barberPromise, servicesPromise]);

      const serviceNames = (servicesData ?? []).map((s: { service_name: string }) => s.service_name).join(", ");
      const totalPriceRsd = (servicesData ?? []).reduce((sum: number, s: { price_rsd: number }) => sum + Number(s.price_rsd ?? 0), 0);

      let endTimeLocal = payload.bookingTime ?? "";
      if (payload.bookingTime) {
        const [hh, mm] = payload.bookingTime.split(":").map(Number);
        const totalMin = hh * 60 + mm + SLOT_DURATION;
        const endHH = String(Math.floor(totalMin / 60) % 24).padStart(2, "0");
        const endMM = String(totalMin % 60).padStart(2, "0");
        endTimeLocal = `${endHH}:${endMM}`;
      }

      const webhookPayload = {
        reservationId: data.id,
        barber: barberData?.name ?? `Barber #${payload.barberId}`,
        service: serviceNames || `Services`,
        durationMinutes: SLOT_DURATION,
        priceRsd: totalPriceRsd || null,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        customerEmail: payload.customerEmail ?? null,
        // Raw strings from frontend - no Date objects, impossible to convert to UTC
        date: payload.bookingDate ?? null,
        startTime: payload.bookingTime ?? null,
        endTime: endTimeLocal || null,
        notes: payload.notes ?? null,
      };

      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      }).catch((err) => console.error("N8N webhook error:", err));
    }

    return NextResponse.json(
      {
        ok: true,
        reservationId: data.id,
        customerId: customerId ?? undefined,
        message: "Reservation created successfully",
        ...(customerId === null && {
          warning: "Customer record could not be saved. Add SUPABASE_SERVICE_ROLE_KEY to .env.local so Customer table is populated.",
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/reservations:", error);

    // Check if it's the missing env vars error
    if (error instanceof Error && error.message.includes("environment variables")) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { ok: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

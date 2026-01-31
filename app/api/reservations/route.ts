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

    return NextResponse.json({
      ok: true,
      reservations: reservations ?? [],
    });
  } catch (error) {
    console.error("Error in GET /api/reservations:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Validation schema for reservation payload
 * Using existing database schema with bigint IDs
 */
const reservationSchema = z.object({
  barberId: z.coerce.number().int().positive("Barber ID must be a positive integer"),
  serviceId: z.coerce.number().int().positive("Service ID must be a positive integer"),
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
 *   serviceId: number (bigint ID from Services table),
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
        
        // Check if it's an RLS policy error
        if (customerCreateError.code === "42501" || customerCreateError.message.includes("policy")) {
          return NextResponse.json(
            {
              ok: false,
              message: "Database permission denied for Customer table.",
              hint: "You may need to add a policy like: CREATE POLICY 'Allow public inserts' ON \"Customer\" FOR INSERT WITH CHECK (true);",
              error: customerCreateError.message,
            },
            { status: 403 }
          );
        }

        return NextResponse.json(
          {
            ok: false,
            message: "Failed to create customer record",
            error: customerCreateError.message,
          },
          { status: 500 }
        );
      }

      customerId = newCustomer.id;
    }

    // Step 2: Insert reservation with customer_id link
    const { data, error } = await supabase
      .from("Reservations")
      .insert({
        barber_id: payload.barberId,
        service_id: payload.serviceId,
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

    return NextResponse.json(
      {
        ok: true,
        reservationId: data.id,
        customerId: customerId,
        message: "Reservation created successfully",
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

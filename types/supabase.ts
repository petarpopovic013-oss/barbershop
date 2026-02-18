/**
 * Supabase database types
 * These types match YOUR existing database schema
 */

export type Service = {
  id: number; // bigint
  service_name: string;
  price_rsd: number; // bigint
  active: boolean;
  created_at?: string;
};

export type Barber = {
  id: number; // bigint
  name: string;
  active: boolean;
  created_at?: string;
};

export type Customer = {
  id: number; // bigint
  name: string;
  phone: number; // bigint
  email: string;
  created_at?: string;
};

export type Reservation = {
  id: number; // bigint
  barber_id: number; // bigint FK to Barbers
  service_id: number | null; // bigint FK to Services (legacy / first service)
  service_ids: number[] | null; // array of service IDs
  customer_id?: number; // bigint FK to Customer (optional)
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  start_time: string;
  end_time: string;
  created_at?: string;
};

export type CreateReservationPayload = {
  barberId: number;
  serviceIds: number[];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startTime: string;
  endTime: string;
  notes?: string;
};

export type BarberAvailability = {
  id: number;
  barber_id: number;
  date: string; // YYYY-MM-DD
  is_available: boolean;
  working_hours_start: string; // HH:MM:SS
  working_hours_end: string; // HH:MM:SS
  created_at?: string;
  updated_at?: string;
};

export type BarberAvailabilityInput = Omit<BarberAvailability, 'id' | 'created_at' | 'updated_at'>;

/**
 * API Response types
 */
export type ApiResponse<T = unknown> =
  | {
      ok: true;
      data?: T;
      message?: string;
    }
  | {
      ok: false;
      message: string;
      error?: string;
      errors?: Array<{ field: string; message: string }>;
      hint?: string;
    };

export type ServicesResponse = ApiResponse<{ services: Service[] }>;

export type ReservationResponse = ApiResponse<{
  reservationId: string;
  message: string;
}>;

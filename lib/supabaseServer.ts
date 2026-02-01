import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for server-side usage (API routes).
 * Prefers SUPABASE_SERVICE_ROLE_KEY when set (bypasses RLS so Customer/Reservations
 * inserts always succeed). Otherwise uses anon key; RLS policies control access.
 *
 * @throws {Error} If environment variables are missing
 */
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing Supabase URL. Please set NEXT_PUBLIC_SUPABASE_URL in .env.local"
    );
  }

  // Service role bypasses RLS – use it on the server so Customer table gets populated
  if (serviceRoleKey) {
    return createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  if (!anonKey) {
    throw new Error(
      "Missing Supabase key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, or SUPABASE_SERVICE_ROLE_KEY so Customer/Reservations inserts work reliably."
    );
  }

  return createClient(supabaseUrl, anonKey);
}

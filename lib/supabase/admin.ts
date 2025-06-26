import { createClient } from "@supabase/supabase-js"

/**
 * Server-side Supabase client that always uses the SERVICE-ROLE key.
 * This bypasses RLS policies (⚠ never expose this key to the browser).
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.")
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}

import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"

// Extend the Window interface to inform TypeScript about our custom property
declare global {
  interface Window {
    // Using a more unique name to avoid potential collisions
    __supabase_browser_client_instance__?: SupabaseClient
  }
}

export function createClient(): SupabaseClient {
  // Check if running in a browser environment
  if (typeof window === "undefined") {
    // This function is designed for browser-side usage.
    // If it's called server-side (e.g., by mistake in a Server Component),
    // it's a misuse. We'll create a fresh instance here, but it won't be a singleton
    // in this non-browser context, and a warning should be noted.
    // console.warn("Supabase createClient (for browser) called in a non-browser environment. This is likely a misuse and won't be a singleton here.");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY for Supabase client initialization (non-browser context).",
      )
    }
    // Return a new instance for this specific non-browser call
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  // --- Browser-side Singleton Logic ---
  // Use the window object to store and retrieve the singleton instance.
  // This makes it resilient to HMR.
  if (!window.__supabase_browser_client_instance__) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Client-side: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables for Supabase client.",
      )
    }
    window.__supabase_browser_client_instance__ = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  return window.__supabase_browser_client_instance__
}

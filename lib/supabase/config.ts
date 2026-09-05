/**
 * Central Supabase configuration with safe fallbacks.
 *
 * The live preview inside this workspace runs without real credentials, so we
 * fall back to a syntactically valid placeholder project. `isSupabaseConfigured`
 * lets the app decide whether to hit the network or serve the bundled mock data.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http")
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : "https://placeholder.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 20
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : "public-anon-key-placeholder-for-local-preview";

export const isSupabaseConfigured =
  SUPABASE_URL !== "https://placeholder.supabase.co" &&
  !SUPABASE_ANON_KEY.startsWith("public-anon-key-placeholder");

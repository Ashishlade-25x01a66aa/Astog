import { createClient, SupabaseClient } from '@supabase/supabase-js';

// We use the service role key on the backend to bypass RLS for admin operations,
// since we are implementing our own custom JWT auth for admins.
// Lazy singleton — client is created on first use so the module can be safely
// imported during Next.js build without env vars being present.
let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are not set.');
    }

    _supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _supabase;
}

// Convenience re-export for backward compat with code that imports `supabase` directly.
// Uses a Proxy so the client is only instantiated on first property access.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  },
});

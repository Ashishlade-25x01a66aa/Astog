import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, string> = {};

  // 1. Check env vars are present
  checks.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? '✅ Set'
    : '❌ Missing';
  checks.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? '✅ Set'
    : '❌ Missing';
  checks.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? '✅ Set'
    : '❌ Missing';
  checks.JWT_SECRET = process.env.JWT_SECRET ? '✅ Set' : '❌ Missing';

  // 2. Try a real DB query
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('home_content').select('id').limit(1);
    checks.database_connection = error
      ? `❌ Error: ${error.message}`
      : '✅ Connected';
  } catch (err: any) {
    checks.database_connection = `❌ Exception: ${err.message}`;
  }

  const allOk = Object.values(checks).every((v) => v.startsWith('✅'));

  return NextResponse.json(
    { status: allOk ? 'ok' : 'error', checks },
    { status: allOk ? 200 : 500 }
  );
}

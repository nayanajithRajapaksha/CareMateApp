import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Key is missing from environment variables. Set SUPABASE_URL and SUPABASE_SECRET_KEY.');
    }

    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  return _supabase;
}

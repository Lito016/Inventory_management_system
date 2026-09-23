import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from './mock-client';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholder = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project');

// Auto-detect prototype mode: use mock data when Supabase credentials are missing/placeholder
export const supabase = isPlaceholder
  ? (mockSupabase as unknown as ReturnType<typeof createClient>)
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
      },
    });

if (isPlaceholder) {
  console.info('[UBMS] Running in PROTOTYPE mode with mock data. Set Supabase credentials in .env.local for real backend.');
}

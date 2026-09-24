import { createClient } from '@supabase/supabase-js';
import { mockSupabase } from './mock-client';
import { isDemoMode } from '../demo';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isPlaceholder = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project');

// Demo builds force mock data even if real credentials are present;
// otherwise fall back to mock when Supabase credentials are missing/placeholder.
export const supabase = isDemoMode() || isPlaceholder
  ? (mockSupabase as unknown as ReturnType<typeof createClient>)
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
      },
    });

if (isDemoMode()) {
  console.info('[IMS] Running in DEMO mode with mock data. All edits reset on reload.');
} else if (isPlaceholder) {
  console.info('[IMS] Running in PROTOTYPE mode with mock data. Set Supabase credentials in .env.local for real backend.');
}

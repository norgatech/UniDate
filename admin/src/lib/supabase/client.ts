import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ffgghopixgaykxsdgmhj.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_DoshvtiuLF-Lja5qfOzU2Q_3f3y6yE4';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}


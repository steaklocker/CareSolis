import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Singleton instance to prevent multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  // Return existing instance if already created
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Create new instance only if needed
  supabaseInstance = createSupabaseClient(supabaseUrl, publicAnonKey);
  
  console.log('✅ Supabase client created (singleton)');
  
  return supabaseInstance;
};
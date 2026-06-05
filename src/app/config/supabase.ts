// Re-export Supabase configuration for easier imports
export { projectId, publicAnonKey } from '/utils/supabase/info';

export const SERVER_URL = `https://${import('/utils/supabase/info').then(m => m.projectId)}.supabase.co/functions/v1/make-server-9aeac050`;

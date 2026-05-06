
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLogs() {
  const { data: logs, error } = await supabase
    .from('kv_store_9aeac050')
    .select('*')
    .like('key', 'make-9aeac050-audit-%')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching logs:', error);
    return;
  }

  console.log("--- Recent Audit Logs ---");
  logs.forEach(log => {
      const val = log.value; // It's JSONb
      if (val.action && (val.action.includes('Closed') || val.action.includes('System'))) {
          console.log(`[${val.timestamp}] ${val.action} - ${val.details || ''}`);
      }
  });
}

checkLogs();

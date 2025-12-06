import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vfuedgrheyncotoxseos.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmdWVkZ3JoZXluY290b3hzZW9zIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAzMDM4MCwiZXhwIjoyMDc3NjA2MzgwfQ.gxykjdi3SsfnFaFTocKa0k9ddrxF9PcvJCShqp2UD5Q';

// Server-side Supabase client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vfuedgrheyncotoxseos.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmdWVkZ3JoZXluY290b3hzZW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMzAzODAsImV4cCI6MjA3NzYwNjM4MH0.YF8al_NDQVgrLNaHDLn1Gb4sqslj0Sot9RTQ0yYw2BI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


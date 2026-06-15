import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jmybdmoyvhcheyanbshw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteWJkbW95dmhjaGV5YW5ic2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzA3MDEsImV4cCI6MjA5MTg0NjcwMX0.w9cAsq63vt8rKiGvap_DN_L7sYI-U_V-toSK8q17f_Y";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

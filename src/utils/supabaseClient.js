import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zjckzgvyiaubldxqumhr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqY2t6Z3Z5aWF1YmxkeHF1bWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTg3MTcsImV4cCI6MjA5NTg5NDcxN30.DIuRrEvGbU67dK9rSbmQCqMKRq5vj5lPIZGmRYJbaQo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('[Supabase] Client ready with anon key.');




import { createClient } from '@supabase/supabase-js';

// Supabase URL e anon key (chave pública) - são seguros para expor no frontend
export const supabaseUrl = 'https://ryskqkqgjvzcloibkykl.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5c2txa3FnanZ6Y2xvaWJreWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc2OTExNTgsImV4cCI6MjAzMzI2NzE1OH0.A-7IGE_YvRsOHXFSZ04CyPRDqNOHhG0hEfW1qW-6h5k';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

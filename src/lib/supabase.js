import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://qmwukfmieqoqydgrrbct.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtd3VrZm1pZXFvcXlkZ3JyYmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDg1OTAsImV4cCI6MjEwMDM4NDU5MH0.wji4xmdM4KdJEywO77AVZh5q5CfXJXhdwpgohxz0kvU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


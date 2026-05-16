// ⚠️ Cambia por tus datos reales
const SUPABASE_URL = 'https://bwhdiqeehbdhwwxevhcr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3aGRpcWVlaGJkaHd3eGV2aGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NjI3OTAsImV4cCI6MjA5NDUzODc5MH0.HtTv74vfr4yl82zTe4mPJJeai65Ujnq_ZqNq2LCSLjE';

const { createClient } = supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

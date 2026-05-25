const { createClient } = window.supabase;

const supabaseClient = createClient(
  "https://kwejgvtlredvqpvmgibn.supabase.co", // your real URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3ZWpndnRscmVkdnFwdm1naWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MzQwNjQsImV4cCI6MjA5NTExMDA2NH0.iKbE8RESuW7sK4YAZZ1LMR7NZqBPXAFynmZkisH-iFc",
);

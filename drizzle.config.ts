// FILE: drizzle.config.ts (FINAL, CORRECTED VERSION)

import type { Config } from 'drizzle-kit';

// 1. You MUST replace <POOLER_HOST_FROM_SUPABASE> with your actual host here.
const CLEAN_DATABASE_URL = "postgresql://postgres:123897%40Kk@<POOLER_HOST_FROM_SUPABASE>:5432/postgres";

// Safety check for your own visibility (FIXED MESSAGE)
if (CLEAN_DATABASE_URL.includes("<POOLER_HOST_FROM_SUPABASE>")) {
    throw new Error('drizzle.config.ts: CRITICAL ERROR - Please replace <POOLER_HOST_FROM_SUPABASE> with your actual Supabase Pooler host.');
}

export default {
  // Schema path
  schema: './lib/db/schema.ts', 
  
  // Output path
  out: './drizzle', 
  
  driver: 'pg', 
  
  // Cast to 'any' to explicitly tell TypeScript to ignore the warning
  dbCredentials: {
    connectionString: CLEAN_DATABASE_URL, 
  } as any, 
  
  verbose: true,
  strict: true,
} satisfies Config;
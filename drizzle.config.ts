// FILE: drizzle.config.ts (FINAL, CORRECTED VERSION)

import type { Config } from 'drizzle-kit';

// 1. Use DATABASE_URL from environment variables
const CLEAN_DATABASE_URL = process.env.DATABASE_URL!;

if (!CLEAN_DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

export default {
  // Schema path
  schema: './lib/db/schema.ts',

  // Output path
  out: './drizzle',

  dialect: 'postgresql',

  // Cast to 'any' to explicitly tell TypeScript to ignore the warning
  dbCredentials: {
    connectionString: CLEAN_DATABASE_URL,
  } as any,

  verbose: true,
  strict: true,
} satisfies Config;
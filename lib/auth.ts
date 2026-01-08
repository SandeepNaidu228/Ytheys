// FILE: lib/auth.ts (FINAL, CLEANED-UP VERSION)

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema'; // Ensure schema is imported

// Ensure the application URLs and secrets are set in your .env
if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL not set");
}
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET not set");
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { 
        ...schema,
    },
  }),

  emailAndPassword: {
      enabled: true, 
      // The custom 'authorize' function has been removed to fix the TypeError.
  },

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,

  logger: {
    level: "debug",
    disabled: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5 // 5 minutes
    }
  },


  cookies: {
    sessionToken: {
      name: "better-auth.session_token",
      options: {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        path: '/',
      },
    },
  },

  trustedOrigins: isProd
    ? ["https://ossean.in"]
    : ["http://localhost:3000"]
}); 
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/schema.js';

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create Postgres client for serverless (Supabase compatible)
// Configure for serverless with SSL (required by Supabase)
const client = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1, // Serverless functions should use minimal connections
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for use in queries
export { schema };

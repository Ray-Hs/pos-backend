// src/config/database.ts
import dotenv from "dotenv";
import path from "path";

// Load the appropriate .env file based on the environment
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env"
    : process.env.NODE_ENV === "test"
    ? ".env.test"
    : ".env.development";

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const DATABASE_CONFIG = {
  url: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true",
};

// Create a function to get database URL for scripts/migrations
export function getDatabaseUrl() {
  return DATABASE_CONFIG.url;
}

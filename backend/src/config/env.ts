import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_NAME: z.string().default("ked_lms"),
  DB_USER: z.string().default("root"),
  DB_PASSWORD: z.string().default("password"),
  DB_SSL_MODE: z.enum(["disabled", "preferred", "require"]).default("disabled"),
  ACCESS_TOKEN_SECRET: z.string().default("dev-access-secret"),
  REFRESH_TOKEN_SECRET: z.string().default("dev-refresh-secret"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("30d"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  REFRESH_COOKIE_NAME: z.string().default("ked_refresh_token"),
  YOUTUBE_API_KEY: z.string().optional(),
  YOUTUBE_CACHE_HOURS: z.coerce.number().int().positive().default(12)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean)
};

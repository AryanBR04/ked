import type { CookieOptions } from "express";
import { env } from "./env";

export const corsOptions = {
  origin: env.corsOrigins,
  credentials: true
};

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production" || env.COOKIE_SAME_SITE === "none",
  sameSite: env.COOKIE_SAME_SITE,
  domain: env.COOKIE_DOMAIN || undefined,
  path: "/api/auth",
  maxAge: 30 * 24 * 60 * 60 * 1000
};


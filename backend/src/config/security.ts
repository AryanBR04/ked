import type { CookieOptions } from "express";
import { env } from "./env";

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // allow requests with no origin (like curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = env.corsOrigins;
    const isAllowed = allowedOrigins.includes("*") || 
                      allowedOrigins.includes(origin) || 
                      (env.NODE_ENV !== "production" && origin.startsWith("http://localhost:"));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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


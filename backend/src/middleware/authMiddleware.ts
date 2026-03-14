import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/errors";

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(new AppError(401, "AUTH_REQUIRED", "Authorization token is required."));
    return;
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    const payload = verifyAccessToken(token);
    request.user = {
      id: Number(payload.sub),
      email: payload.email,
      name: payload.name
    };
    next();
  } catch {
    next(new AppError(401, "INVALID_ACCESS_TOKEN", "Access token is invalid or expired."));
  }
}


import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

export function optionalAuth(request: Request, _response: Response, next: NextFunction) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next();
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
  } catch {
    request.user = undefined;
  }

  next();
}

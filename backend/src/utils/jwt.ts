import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthenticatedUser } from "../types/domain";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: "refresh";
}

export function signAccessToken(user: AuthenticatedUser): string {
  const options: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_TTL as SignOptions["expiresIn"]
  };

  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      name: user.name,
      type: "access"
    } satisfies AccessTokenPayload,
    env.ACCESS_TOKEN_SECRET as Secret,
    options
  );
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.REFRESH_TOKEN_TTL as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET as Secret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
}

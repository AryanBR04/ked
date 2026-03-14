import { randomUUID } from "crypto";
import { env } from "../../config/env";
import type { AuthenticatedUser } from "../../types/domain";
import { AppError } from "../../utils/errors";
import { hashValue } from "../../utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import { createUser, findUserByEmail, findUserById } from "../users/user.repository";
import {
  createRefreshTokenRecord,
  findActiveRefreshTokenByHash,
  revokeExpiredRefreshTokens,
  revokeRefreshTokenByHash
} from "./auth.repository";
import type { LoginInput, RegisterInput } from "./auth.validator";

interface SessionPayload {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
}

function toAuthenticatedUser(user: {
  id: number;
  email: string;
  name: string;
}): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name
  };
}

function parseTtlToMs(ttl: string): number {
  const match = ttl.match(/^(\d+)([smhd])$/i);

  if (!match) {
    return 30 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
    default:
      return value * 24 * 60 * 60 * 1000;
  }
}

async function issueSession(user: AuthenticatedUser): Promise<SessionPayload> {
  await revokeExpiredRefreshTokens(user.id);

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken({
    sub: String(user.id),
    jti: randomUUID(),
    type: "refresh"
  });

  await createRefreshTokenRecord(
    user.id,
    hashValue(refreshToken),
    new Date(Date.now() + parseTtlToMs(env.REFRESH_TOKEN_TTL))
  );

  return {
    user,
    accessToken,
    refreshToken
  };
}

export async function register(input: RegisterInput): Promise<SessionPayload> {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new AppError(409, "EMAIL_ALREADY_IN_USE", "An account with this email already exists.");
  }

  const user = await createUser({
    email: input.email,
    passwordHash: await hashPassword(input.password),
    name: input.name
  });

  return issueSession(toAuthenticatedUser(user));
}

export async function login(input: LoginInput): Promise<SessionPayload> {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  const isValid = await comparePassword(input.password, user.password_hash);

  if (!isValid) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  return issueSession(toAuthenticatedUser(user));
}

export async function refreshSession(rawRefreshToken: string): Promise<SessionPayload> {
  let payload;

  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or expired.");
  }

  const tokenHash = hashValue(rawRefreshToken);
  const storedToken = await findActiveRefreshTokenByHash(tokenHash);

  if (!storedToken || storedToken.user_id !== Number(payload.sub)) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "Refresh token is invalid or revoked.");
  }

  const user = await findUserById(Number(payload.sub));

  if (!user) {
    throw new AppError(401, "INVALID_REFRESH_TOKEN", "User session is no longer valid.");
  }

  await revokeRefreshTokenByHash(tokenHash);

  return issueSession(toAuthenticatedUser(user));
}

export async function logout(rawRefreshToken?: string) {
  if (!rawRefreshToken) {
    return;
  }

  await revokeRefreshTokenByHash(hashValue(rawRefreshToken));
}


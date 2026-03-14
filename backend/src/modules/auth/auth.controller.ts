import type { Request, Response } from "express";
import { env } from "../../config/env";
import { refreshCookieOptions } from "../../config/security";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/errors";
import { loginSchema, registerSchema } from "./auth.validator";
import { login, logout, refreshSession, register } from "./auth.service";

function setRefreshCookie(response: Response, refreshToken: string) {
  response.cookie(env.REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
}

function clearRefreshCookie(response: Response) {
  response.clearCookie(env.REFRESH_COOKIE_NAME, refreshCookieOptions);
}

export const registerController = asyncHandler(async (request: Request, response: Response) => {
  const input = registerSchema.parse(request.body);
  const session = await register(input);

  setRefreshCookie(response, session.refreshToken);

  response.status(201).json({
    user: session.user,
    accessToken: session.accessToken
  });
});

export const loginController = asyncHandler(async (request: Request, response: Response) => {
  const input = loginSchema.parse(request.body);
  const session = await login(input);

  setRefreshCookie(response, session.refreshToken);

  response.json({
    user: session.user,
    accessToken: session.accessToken
  });
});

export const refreshController = asyncHandler(async (request: Request, response: Response) => {
  const refreshToken = request.cookies?.[env.REFRESH_COOKIE_NAME] as string | undefined;

  if (!refreshToken) {
    throw new AppError(401, "REFRESH_TOKEN_REQUIRED", "Refresh token cookie is missing.");
  }

  const session = await refreshSession(refreshToken);
  setRefreshCookie(response, session.refreshToken);

  response.json({
    user: session.user,
    accessToken: session.accessToken
  });
});

export const logoutController = asyncHandler(async (request: Request, response: Response) => {
  const refreshToken = request.cookies?.[env.REFRESH_COOKIE_NAME] as string | undefined;

  await logout(refreshToken);
  clearRefreshCookie(response);

  response.json({
    success: true
  });
});


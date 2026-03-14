import { buildApiUrl } from "./config";

interface AuthPayload {
  user: {
    id: number;
    email: string;
    name: string;
  };
  accessToken: string;
}

function formatAuthError(payload: any, path: string): string {
  if (!payload) {
    return "Authentication request failed.";
  }

  if (payload.error === "VALIDATION_ERROR") {
    const fieldErrors = payload.details?.fieldErrors as Record<string, string[] | undefined> | undefined;
    const orderedFields = ["name", "email", "password"];

    for (const field of orderedFields) {
      const message = fieldErrors?.[field]?.[0];

      if (message) {
        return message;
      }
    }

    return "Please check the form fields and try again.";
  }

  if (payload.error === "EMAIL_ALREADY_IN_USE") {
    return "This email is already registered. Use Login instead, or try a different email.";
  }

  if (payload.error === "INVALID_CREDENTIALS") {
    return "Email or password is incorrect.";
  }

  if (path === "/auth/register" && payload.message) {
    return payload.message;
  }

  if (path === "/auth/login" && payload.message) {
    return payload.message;
  }

  return payload.message ?? "Authentication request failed.";
}

async function sendAuthRequest(
  path: string,
  body?: Record<string, unknown>
): Promise<AuthPayload | null> {
  const response = await fetch(buildApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(formatAuthError(payload, path));
  }

  return response.json() as Promise<AuthPayload>;
}

export function loginRequest(email: string, password: string) {
  return sendAuthRequest("/auth/login", { email, password });
}

export function registerRequest(name: string, email: string, password: string) {
  return sendAuthRequest("/auth/register", { name, email, password });
}

export function refreshRequest() {
  return sendAuthRequest("/auth/refresh");
}

export async function logoutRequest() {
  await fetch(buildApiUrl("/auth/logout"), {
    method: "POST",
    credentials: "include"
  });
}

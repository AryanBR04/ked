import { buildApiUrl } from "./config";
import { useAuthStore } from "@/store/authStore";

interface ApiRequestOptions extends RequestInit {
  accessToken?: string | null;
}

export async function publicApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiFetchWithAuth<T>(path: string, init?: ApiRequestOptions): Promise<T> {
  const store = useAuthStore.getState();
  const accessToken = init?.accessToken ?? store.accessToken;

  if (!accessToken) {
    await store.bootstrapSession();
  }

  const token = init?.accessToken ?? useAuthStore.getState().accessToken;

  const makeRequest = async (bearerToken: string | null) =>
    fetch(buildApiUrl(path), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
        ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {})
      },
      credentials: "include",
      cache: "no-store"
    });

  let response = await makeRequest(token);

  if (response.status === 401) {
    const refreshed = await useAuthStore.getState().refreshAccessToken();

    if (!refreshed) {
      throw new Error("Unauthorized");
    }

    response = await makeRequest(useAuthStore.getState().accessToken);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiFetchMaybeAuth<T>(path: string, init?: ApiRequestOptions): Promise<T> {
  const store = useAuthStore.getState();

  if (!store.isBootstrapped && !store.isRefreshing) {
    await store.bootstrapSession();
  }

  const token = init?.accessToken ?? useAuthStore.getState().accessToken;

  if (token) {
    return apiFetchWithAuth<T>(path, {
      ...init,
      accessToken: token
    });
  }

  return publicApiFetch<T>(path, init);
}

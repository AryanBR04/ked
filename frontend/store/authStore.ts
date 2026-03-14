"use client";

import { create } from "zustand";
import { loginRequest, logoutRequest, refreshRequest, registerRequest } from "@/lib/auth";

interface SessionUser {
  id: number;
  email: string;
  name: string;
}

interface AuthState {
  user: SessionUser | null;
  accessToken: string | null;
  isBootstrapped: boolean;
  isRefreshing: boolean;
  setSession: (user: SessionUser, accessToken: string) => void;
  clearSession: () => void;
  bootstrapSession: () => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isBootstrapped: false,
  isRefreshing: false,
  setSession: (user, accessToken) => set({ user, accessToken, isBootstrapped: true }),
  clearSession: () => set({ user: null, accessToken: null, isBootstrapped: true }),
  async bootstrapSession() {
    if (get().isBootstrapped || get().isRefreshing) {
      return Boolean(get().accessToken);
    }

    set({ isRefreshing: true });

    try {
      const response = await refreshRequest();

      if (!response) {
        set({ user: null, accessToken: null, isBootstrapped: true, isRefreshing: false });
        return false;
      }

      set({
        user: response.user,
        accessToken: response.accessToken,
        isBootstrapped: true,
        isRefreshing: false
      });
      return true;
    } catch {
      set({ user: null, accessToken: null, isBootstrapped: true, isRefreshing: false });
      return false;
    }
  },
  async refreshAccessToken() {
    if (get().isRefreshing) {
      return false;
    }

    set({ isRefreshing: true });

    try {
      const response = await refreshRequest();

      if (!response) {
        set({ user: null, accessToken: null, isBootstrapped: true, isRefreshing: false });
        return false;
      }

      set({
        user: response.user,
        accessToken: response.accessToken,
        isBootstrapped: true,
        isRefreshing: false
      });
      return true;
    } catch {
      set({ user: null, accessToken: null, isBootstrapped: true, isRefreshing: false });
      return false;
    }
  },
  async login(email, password) {
    const response = await loginRequest(email, password);

    if (!response) {
      throw new Error("Login failed.");
    }

    set({
      user: response.user,
      accessToken: response.accessToken,
      isBootstrapped: true
    });
  },
  async register(name, email, password) {
    const response = await registerRequest(name, email, password);

    if (!response) {
      throw new Error("Registration failed.");
    }

    set({
      user: response.user,
      accessToken: response.accessToken,
      isBootstrapped: true
    });
  },
  async logout() {
    await logoutRequest();
    set({ user: null, accessToken: null, isBootstrapped: true, isRefreshing: false });
  }
}));

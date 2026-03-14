"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function SessionBootstrap() {
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  return null;
}


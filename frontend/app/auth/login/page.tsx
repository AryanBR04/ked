"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { Suspense, useState, useTransition } from "react";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="mx-auto max-w-xl rounded-[2.5rem] border border-ink/10 bg-white p-8 shadow-soft md:p-10">
      <p className="text-sm text-ink/60">Preparing sign-in...</p>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(() => {
      void login(form.email, form.password)
        .then(() => {
          router.push(searchParams.get("next") ?? "/profile");
        })
        .catch((submitError) => {
          setError(submitError instanceof Error ? submitError.message : "Login failed.");
        });
    });
  }

  return (
    <div className="mx-auto max-w-xl rounded-[2.5rem] border border-ink/10 bg-white p-8 shadow-soft md:p-10">
      <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Welcome back</p>
      <h1 className="mt-3 text-4xl font-semibold">Sign in to continue learning</h1>
      <p className="mt-3 text-ink/65">Your lesson progress and resume state will be waiting.</p>
      <div className="mt-5 rounded-3xl border border-ink/10 bg-fog px-4 py-3 text-sm text-ink/68">
        Quick demo login: <span className="font-medium">student@ked.dev</span> / <span className="font-medium">Password123!</span>
      </div>
      {error ? <div className="mt-6"><Alert title="Login failed" tone="error">{error}</Alert></div> : null}
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="student@ked.dev"
            className="w-full rounded-3xl border border-ink/10 bg-fog px-4 py-3 outline-none ring-0 transition focus:border-ink/35"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Password</span>
          <input
            required
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="w-full rounded-3xl border border-ink/10 bg-fog px-4 py-3 outline-none ring-0 transition focus:border-ink/35"
          />
        </label>
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Signing in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}

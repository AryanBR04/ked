"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import { Alert } from "@/components/common/Alert";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(() => {
      void register(form.name, form.email, form.password)
        .then(() => {
          router.push("/auth/login");
        })
        .catch((submitError) => {
          setError(submitError instanceof Error ? submitError.message : "Registration failed.");
        });
    });
  }

  return (
    <div className="mx-auto max-w-xl rounded-[2.5rem] border border-ink/10 bg-white p-8 shadow-soft md:p-10">
      <p className="text-xs uppercase tracking-[0.35em] text-ink/45">Get started</p>
      <h1 className="mt-3 text-4xl font-semibold">Create your learning account</h1>
      <p className="mt-3 text-ink/65">Join once, then continue every course from where you paused.</p>
      <div className="mt-5 rounded-3xl border border-ink/10 bg-fog px-4 py-3 text-sm text-ink/68">
        Demo account: <span className="font-medium">student@ked.dev</span> / <span className="font-medium">Password123!</span>
        {" "}for login only. Use a different email if you want to register a new account.
      </div>
      {error ? <div className="mt-6"><Alert title="Registration failed" tone="error">{error}</Alert></div> : null}
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Name</span>
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Your name"
            className="w-full rounded-3xl border border-ink/10 bg-fog px-4 py-3 outline-none ring-0 transition focus:border-ink/35"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
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
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </div>
  );
}

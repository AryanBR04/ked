"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTransition } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/store/authStore";

export function AppShell({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isCoursesActive = pathname === "/" || pathname.startsWith("/subjects") || pathname.startsWith("/course");
  const isProfileActive = pathname.startsWith("/profile");

  return (
    <div className="min-h-screen bg-fog text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-fog/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex flex-col">
            <span className="font-serif text-2xl tracking-wide">KED</span>
            <span className="text-xs uppercase tracking-[0.35em] text-ink/50">Structured Learning</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Button
              href="/"
              variant={isCoursesActive ? "secondary" : "ghost"}
              className={isCoursesActive ? "font-semibold ring-1 ring-ink/20" : ""}
            >
              Courses
            </Button>
            {user ? (
              <Button
                href="/profile"
                variant={isProfileActive ? "secondary" : "ghost"}
                className={isProfileActive ? "font-semibold ring-1 ring-ink/20" : ""}
              >
                Profile
              </Button>
            ) : null}
            {user ? (
              <Button
                variant="secondary"
                disabled={isPending}
                onClick={() => {
                  startTransition(() => {
                    void logout();
                  });
                }}
              >
                {isPending ? "Signing out..." : "Logout"}
              </Button>
            ) : (
              <>
                <Button href="/auth/login" variant="ghost">Login</Button>
                <Button href="/auth/register">Join free</Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}

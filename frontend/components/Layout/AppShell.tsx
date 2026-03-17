"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { useAuthStore } from "@/store/authStore";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isCoursesActive = pathname === "/courses" || pathname.startsWith("/subjects") || pathname.startsWith("/course");
  const isLearningPathsActive = pathname.startsWith("/learning-path");
  const isCareerTracksActive = pathname.startsWith("/career-track");
  const isProfileActive = pathname.startsWith("/profile");

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleLogout() {
    startTransition(() => {
      void logout().then(() => {
        router.push("/auth/login");
      });
    });
  }

  const navLinks = [
    { label: "Courses", href: "/courses", active: isCoursesActive },
    { label: "Learning Paths", href: "/learning-paths", active: isLearningPathsActive },
    { label: "Career Tracks", href: "/career-tracks", active: isCareerTracksActive },
  ];

  return (
    <div className="min-h-screen bg-fog text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-fog/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex flex-col">
            <span className="font-serif text-2xl tracking-wide">KED</span>
            <span className="text-xs uppercase tracking-[0.35em] text-ink/50">Structured Learning</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-3 lg:flex">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                href={link.href}
                variant={link.active ? "secondary" : "ghost"}
                className={link.active ? "font-semibold ring-1 ring-ink/20" : ""}
              >
                {link.label}
              </Button>
            ))}
            {user && (
              <Button
                href="/my-notes"
                variant={pathname.startsWith("/my-notes") ? "secondary" : "ghost"}
                className={pathname.startsWith("/my-notes") ? "font-semibold ring-1 ring-ink/20" : ""}
              >
                My Notes
              </Button>
            )}
            {user && (
              <Button
                href="/profile"
                variant={isProfileActive ? "secondary" : "ghost"}
                className={isProfileActive ? "font-semibold ring-1 ring-ink/20" : ""}
              >
                Profile
              </Button>
            )}
            {user ? (
              <Button
                variant="secondary"
                disabled={isPending}
                onClick={handleLogout}
              >
                {isPending ? "Signing out..." : "Logout"}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button href="/auth/login" variant="ghost">Login</Button>
                <Button href="/auth/register">Join free</Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="rounded-full p-2 hover:bg-ink/5 lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="border-t border-ink/10 bg-fog px-6 py-6 lg:hidden animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-lg font-medium ${link.active ? "text-ink" : "text-ink/60"}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px w-full bg-ink/10 my-2" />
              {user ? (
                <>
                  <Link 
                    href="/my-notes"
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-lg font-medium ${pathname.startsWith("/my-notes") ? "text-ink" : "text-ink/60"}`}
                  >
                    My Notes
                  </Link>
                  <Link 
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-lg font-medium ${isProfileActive ? "text-ink" : "text-ink/60"}`}
                  >
                    Profile
                  </Link>
                  <Button
                    variant="secondary"
                    className="w-full justify-center mt-4"
                    disabled={isPending}
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    {isPending ? "Signing out..." : "Logout"}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button href="/auth/login" variant="secondary" className="w-full justify-center">Login</Button>
                  <Button href="/auth/register" className="w-full justify-center">Join free</Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}

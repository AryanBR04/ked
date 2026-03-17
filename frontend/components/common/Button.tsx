"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

const variants = {
  primary: "bg-ink text-fog hover:bg-moss shadow-sm hover:shadow-md",
  secondary: "bg-white text-ink ring-1 ring-ink/12 hover:bg-[#eef4ef] hover:ring-ink/20",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm"
};

function classes(variant: NonNullable<ButtonProps["variant"]>, className?: string, disabled?: boolean) {
  return [
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold tracking-tight transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    className ?? ""
  ].join(" ");
}

export function Button({
  href,
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  if (href) {
    return (
      <Link href={href} className={classes(variant, className)}>
        {children}
      </Link>
    );
  }

  return (
    <button {...props} className={classes(variant, className)}>
      {children}
    </button>
  );
}

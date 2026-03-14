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
  primary: "bg-ink text-fog hover:bg-moss",
  secondary: "bg-white text-ink ring-1 ring-ink/12 hover:bg-[#eef4ef]",
  ghost: "bg-transparent text-ink hover:bg-ink/5"
};

function classes(variant: NonNullable<ButtonProps["variant"]>, className?: string) {
  return [
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition",
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

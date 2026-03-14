import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { SessionBootstrap } from "@/components/Auth/SessionBootstrap";
import { AppShell } from "@/components/Layout/AppShell";
import "@/styles/globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"]
});

export const metadata: Metadata = {
  title: "KED LMS",
  description: "A structured YouTube-powered learning platform."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} font-sans text-ink antialiased`}>
        <SessionBootstrap />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

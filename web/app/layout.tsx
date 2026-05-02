import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Nexus — Career Intelligence",
  description: "Build distinctive CVs, resumes, and cover letters with AI.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='10' y='8' width='44' height='48' rx='8' fill='%23141418' stroke='%23e85d4c' stroke-width='3'/%3E%3Cpath d='M22 32l7 7 13-14' fill='none' stroke='%2334d399' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
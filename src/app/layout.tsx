// src/app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Produto",
  description: "Wallboard Spotter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

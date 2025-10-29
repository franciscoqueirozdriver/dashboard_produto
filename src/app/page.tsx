// src/app/page.tsx
// Página raiz mínima. Redireciona para o seu dashboard existente.
import { redirect } from "next/navigation";

export default function Home() {
  // Se seu dashboard é /dashboard, mantenha abaixo:
  redirect("/dashboard");
  return null;
}

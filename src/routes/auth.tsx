import { createFileRoute, redirect } from "@tanstack/react-router";

// Não existe página /auth dedicada — a tela de login é renderizada em "/"
// quando o usuário não está autenticado. Redireciona preservando ?next=.
export const Route = createFileRoute("/auth")({
  beforeLoad: ({ search }) => {
    const next = (search as any)?.next;
    if (typeof window !== "undefined" && next) {
      try { sessionStorage.setItem("auth_next", String(next)); } catch {}
    }
    throw redirect({ to: "/" });
  },
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  component: () => null,
});

"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { masterNav } from "@/components/layout/nav";

const titles: Record<string, { title: string; subtitle?: string }> = {
  "/organizations": {
    title: "Organizações",
    subtitle: "Controle as associações cadastradas, planos e dados principais.",
  },
  "/organizations/new": {
    title: "Cadastrar organização",
    subtitle: "Registre uma associação com dados empresariais, endereço e plano inicial.",
  },
};

export function MasterShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = titles[pathname] ?? titles["/organizations"];

  return (
    <AppShell
      variant="master"
      title={current.title}
      subtitle={current.subtitle}
      nav={masterNav}
      user={{ name: "Lucas Fontinele", detail: "Master SaaS" }}
    >
      {children}
    </AppShell>
  );
}

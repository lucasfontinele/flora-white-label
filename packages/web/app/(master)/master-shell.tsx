"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { masterNav } from "@/components/layout/nav";

const titles: Record<string, { title: string; subtitle?: string }> = {
  "/painel": {
    title: "Visão geral",
    subtitle: "Indicadores gerais da operação Flora em toda a rede de organizações.",
  },
  "/organizations": {
    title: "Organizações",
    subtitle: "Controle as associações cadastradas, planos e dados principais.",
  },
  "/planos": {
    title: "Planos",
    subtitle: "Configure os planos de assinatura disponíveis para as organizações.",
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

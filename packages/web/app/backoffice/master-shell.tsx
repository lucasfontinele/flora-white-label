"use client";

import type { AuthContextDto, AuthenticatedUserDto } from "@flora/shared/authentication";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { masterNav } from "@/components/layout/nav";

const titles: Record<string, { title: string; subtitle?: string }> = {
  "/backoffice/painel": {
    title: "Visão geral",
    subtitle: "Indicadores gerais da operação Flora em toda a rede de organizações.",
  },
  "/backoffice/organizations": {
    title: "Organizações",
    subtitle: "Controle as associações cadastradas, planos e dados principais.",
  },
  "/backoffice/planos": {
    title: "Planos",
    subtitle: "Configure os planos de assinatura disponíveis para as organizações.",
  },
  "/backoffice/organizations/new": {
    title: "Cadastrar organização",
    subtitle: "Registre uma associação com dados empresariais, endereço e plano inicial.",
  },
};

type MasterShellProps = {
  user: AuthenticatedUserDto;
  context: AuthContextDto;
  children: React.ReactNode;
};

export function MasterShell({ user, context, children }: MasterShellProps) {
  const pathname = usePathname();
  const current = titles[pathname] ?? titles["/backoffice/organizations"];
  const organizationName = context.organization?.tradeName ?? "Backoffice Master";

  return (
    <AppShell
      variant="master"
      title={current.title}
      subtitle={current.subtitle}
      nav={masterNav}
      user={{ name: user.email, detail: organizationName }}
    >
      {children}
    </AppShell>
  );
}

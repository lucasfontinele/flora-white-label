"use client";

import type { AuthContextDto, AuthenticatedUserDto } from "@flora/shared/authentication";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { organizationNav } from "@/components/layout/nav";

const titles: Record<string, { title: string; subtitle?: string }> = {
  "/organization/operacional/dashboard": {
    title: "Visão geral",
    subtitle: "Indicadores e filas críticas da associação.",
  },
  "/organization/operacional/orders": {
    title: "Pedidos",
    subtitle: "Fila operacional com filtros, documentos e status.",
  },
  "/organization/operacional/approvals": {
    title: "Aprovações",
    subtitle: "Valide cadastros que enviaram documentos para entrar na associação.",
  },
  "/organization/operacional/required-documents": {
    title: "Documentos exigidos",
    subtitle: "Documentos que o paciente precisa enviar para se associar.",
  },
  "/organization/operacional/members": {
    title: "Associados",
    subtitle: "Cadastro, responsáveis e vínculos de pacientes.",
  },
  "/organization/operacional/products": {
    title: "Produtos",
    subtitle: "Produtos dispensados, lotes e rastreabilidade.",
  },
  "/organization/operacional/strains": {
    title: "Strains",
    subtitle: "Dados técnicos exibidos no catálogo educativo.",
  },
  "/organization/operacional/inventory": {
    title: "Estoque",
    subtitle: "Saldos, alertas de reposição e unidades.",
  },
  "/organization/operacional/reports": {
    title: "Relatórios",
    subtitle: "Indicadores para diretoria e governança.",
  },
  "/organization/operacional/access": {
    title: "Gestão de acessos",
    subtitle: "Perfis, permissões e convite de funcionários.",
  },
};

type OrganizationShellProps = {
  user: AuthenticatedUserDto;
  context: AuthContextDto;
  children: React.ReactNode;
};

export function OrganizationShell({ user, context, children }: OrganizationShellProps) {
  const pathname = usePathname();
  const normalized = pathname.startsWith("/organization/operacional/orders/")
    ? "/organization/operacional/orders"
    : pathname.startsWith("/organization/operacional/approvals/")
      ? "/organization/operacional/approvals"
      : pathname;
  const current = titles[normalized] ?? titles["/organization/operacional/dashboard"];
  const organizationName = context.organization?.tradeName ?? "Organização";
  const employeeName = context.employee?.fullName ?? user.email;

  return (
    <AppShell
      variant="organization"
      title={current.title}
      subtitle={current.subtitle}
      tenantLabel={`Operação · ${organizationName}`}
      nav={organizationNav}
      user={{ name: employeeName, detail: organizationName }}
    >
      {children}
    </AppShell>
  );
}

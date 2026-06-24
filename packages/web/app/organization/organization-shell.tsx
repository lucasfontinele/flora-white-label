"use client";

import type { AuthContextDto, AuthenticatedUserDto } from "@flora/shared/authentication";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { organizationNav } from "@/components/layout/nav";
import { useOrganizationOverview } from "./queries/use-organization-overview";

const ORDERS_HREF = "/organization/operacional/orders";
const APPROVALS_HREF = "/organization/operacional/approvals";

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

  // Live sidebar counters: total orders and patients awaiting validation.
  const { data: overview } = useOrganizationOverview(context.organizationId);
  const nav = useMemo(
    () =>
      organizationNav.map((item) => {
        if (item.href === ORDERS_HREF) {
          return { ...item, count: overview?.ordersCount };
        }
        if (item.href === APPROVALS_HREF) {
          return { ...item, count: overview?.pendingApprovalsCount };
        }
        return item;
      }),
    [overview],
  );

  return (
    <AppShell
      variant="organization"
      title={current.title}
      subtitle={current.subtitle}
      tenantLabel={`Operação · ${organizationName}`}
      nav={nav}
      user={{ name: employeeName, detail: organizationName }}
    >
      {children}
    </AppShell>
  );
}

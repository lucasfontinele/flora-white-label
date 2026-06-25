"use client";

import type { AuthContextDto, AuthenticatedUserDto } from "@flora/shared/authentication";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { organizationNav } from "@/components/layout/nav";
import { PermissionsProvider } from "./permissions/permissions-context";
import type { PermissionModule } from "./permissions/types";
import { useEmployeePermissionsQuery } from "./permissions/use-employee-permissions-query";
import { useOrganizationOverview } from "./queries/use-organization-overview";

const ORDERS_HREF = "/organization/operacional/orders";
const APPROVALS_HREF = "/organization/operacional/approvals";

// Hrefs restricted to "diretoria pra cima" (view-everything roles).
const DIRECTORS_ONLY_HREFS = new Set<string>(["/organization/operacional/dashboard"]);

// Which permission module gates each nav item. Items without an entry here (and
// not directors-only) are always visible.
const NAV_MODULE_BY_HREF: Record<string, PermissionModule> = {
  "/organization/operacional/orders": "ORDERS",
  "/organization/operacional/approvals": "DOCUMENTS",
  "/organization/operacional/required-documents": "DOCUMENTS",
  "/organization/operacional/prescriptions": "DOCUMENTS",
  "/organization/operacional/members": "ASSOCIATES",
  "/organization/operacional/products": "PRODUCTS",
  "/organization/operacional/inventory": "INVENTORY",
  "/organization/operacional/access": "ACCESS",
};

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
  "/organization/operacional/prescriptions": {
    title: "Receitas",
    subtitle: "Data limite da receita de cada paciente aprovado.",
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
  const router = useRouter();
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

  // Current user's effective permissions, used to gate the nav and the pages.
  const employeeId = context.organizationEmployeeId ?? "";
  const permissionsQuery = useEmployeePermissionsQuery(context.organizationId, employeeId);
  const permissions = permissionsQuery.data;
  const permissionsReady = permissionsQuery.isSuccess || permissionsQuery.isError;

  function canViewModule(module: PermissionModule): boolean {
    if (!permissions) return false;
    if (permissions.fullAccess || permissions.viewAll) return true;
    return permissions.permissions.some(
      (permission) => permission.module === module && permission.action === "VIEW",
    );
  }

  // "Diretoria pra cima": only view-everything roles (Diretoria, Super admin).
  const canViewDirectors = Boolean(permissions?.fullAccess || permissions?.viewAll);

  const nav = useMemo(() => {
    return organizationNav
      .filter((item) => {
        // Gate everything only once permissions load, to avoid hiding items
        // during the initial fetch.
        if (DIRECTORS_ONLY_HREFS.has(item.href)) {
          return !permissionsReady || canViewDirectors;
        }
        const module = NAV_MODULE_BY_HREF[item.href];
        return !module || !permissionsReady || canViewModule(module);
      })
      .map((item) => {
        if (item.href === ORDERS_HREF) {
          return { ...item, count: overview?.ordersCount };
        }
        if (item.href === APPROVALS_HREF) {
          return { ...item, count: overview?.pendingApprovalsCount };
        }
        return item;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overview, permissions, permissionsReady]);

  // Whether the current screen is one the user is allowed to see. Routes that
  // are neither directors-only nor module-gated are always accessible.
  function isAccessibleHref(href: string): boolean {
    if (DIRECTORS_ONLY_HREFS.has(href)) return canViewDirectors;
    const module = NAV_MODULE_BY_HREF[href];
    return !module || canViewModule(module);
  }

  // The landing redirect after login points everyone at "Visão geral", which is
  // directors-only — so an operator without access would just see the "Acesso
  // restrito" card. Once permissions load, bounce them to the first sidebar
  // screen they can actually open instead.
  const firstAccessibleHref = permissionsReady ? nav[0]?.href : undefined;
  const currentIsAccessible = permissionsReady && isAccessibleHref(normalized);

  useEffect(() => {
    if (!permissionsReady || currentIsAccessible) return;
    if (!firstAccessibleHref || firstAccessibleHref === normalized) return;
    router.replace(firstAccessibleHref);
  }, [permissionsReady, currentIsAccessible, firstAccessibleHref, normalized, router]);

  return (
    <PermissionsProvider value={{ data: permissions, ready: permissionsReady }}>
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
    </PermissionsProvider>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { organizationNav } from "@/components/layout/nav";

const titles: Record<string, { title: string; subtitle?: string }> = {
  "/operacional/dashboard": {
    title: "Visão geral",
    subtitle: "Indicadores e filas críticas da associação.",
  },
  "/operacional/orders": {
    title: "Pedidos",
    subtitle: "Fila operacional com filtros, documentos e status.",
  },
  "/operacional/approvals": {
    title: "Aprovações",
    subtitle: "Valide cadastros que enviaram documentos para entrar na associação.",
  },
  "/operacional/members": {
    title: "Associados",
    subtitle: "Cadastro, responsáveis e vínculos de pacientes.",
  },
  "/operacional/products": {
    title: "Produtos",
    subtitle: "Produtos dispensados, lotes e rastreabilidade.",
  },
  "/operacional/strains": {
    title: "Strains",
    subtitle: "Dados técnicos exibidos no catálogo educativo.",
  },
  "/operacional/inventory": {
    title: "Estoque",
    subtitle: "Saldos, alertas de reposição e unidades.",
  },
  "/operacional/reports": {
    title: "Relatórios",
    subtitle: "Indicadores para diretoria e governança.",
  },
  "/operacional/access": {
    title: "Gestão de acessos",
    subtitle: "Perfis, permissões e convite de funcionários.",
  },
};

export function OrganizationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalized = pathname.startsWith("/operacional/orders/")
    ? "/operacional/orders"
    : pathname.startsWith("/operacional/approvals/")
      ? "/operacional/approvals"
      : pathname;
  const current = titles[normalized] ?? titles["/operacional/dashboard"];

  return (
    <AppShell
      variant="organization"
      title={current.title}
      subtitle={current.subtitle}
      nav={organizationNav}
      user={{ name: "Lucas Andrade", detail: "Operador" }}
    >
      {children}
    </AppShell>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { associatedNav } from "@/components/layout/nav";
import { usePatientSelection } from "@/components/associated/patient-context";
import { associatedUser, tenant } from "@/lib/data";

const titles: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": {
    title: "Início",
    subtitle: "Acompanhe pedidos, documentos e dados do paciente ativo.",
  },
  "/orders": {
    title: "Meus pedidos",
    subtitle: "Histórico e andamento dos pedidos solicitados.",
  },
  "/catalog": {
    title: "Catálogo educativo",
    subtitle: "Informações descritivas para consulta junto à orientação médica.",
  },
  "/documents": {
    title: "Meus documentos",
    subtitle: "Receitas, laudos e autorizações vinculadas ao cadastro.",
  },
  "/profile": {
    title: "Perfil",
    subtitle: "Dados do associado e paciente gerenciado.",
  },
};

export function AssociatedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedPatient } = usePatientSelection();
  const current = titles[pathname] ?? titles["/dashboard"];

  return (
    <AppShell
      variant="associated"
      title={current.title}
      subtitle={current.subtitle}
      nav={associatedNav}
      user={{
        name: associatedUser.name,
        detail: `${selectedPatient.name} · ${tenant.shortName}`,
      }}
    >
      {children}
    </AppShell>
  );
}

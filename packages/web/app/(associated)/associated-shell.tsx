"use client";

import type { AuthContextDto, AuthenticatedUserDto } from "@flora/shared/authentication";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { associatedNav } from "@/components/layout/nav";
import { usePatientSelection } from "@/components/associated/patient-context";
import { tenant } from "@/lib/data";

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
    title: "Catálogo",
    subtitle: "Catálogo de produtos disponíveis para adquirir de acordo com a receita médica.",
  },
  "/limites": {
    title: "Limites de compra",
    subtitle: "Quantidades liberadas pela receita do paciente no período vigente.",
  },
  "/documents": {
    title: "Meus documentos",
    subtitle: "Receitas, laudos e autorizações vinculadas ao cadastro.",
  },
  "/profile": {
    title: "Perfil",
    subtitle: "Dados do responsável e pacientes representados.",
  },
  "/tornar-se-paciente": {
    title: "Tornar-me paciente",
    subtitle: "Solicite seu próprio cadastro como paciente da associação.",
  },
};

type AssociatedShellProps = {
  user: AuthenticatedUserDto;
  context: AuthContextDto;
  children: React.ReactNode;
};

export function AssociatedShell({ user, context, children }: AssociatedShellProps) {
  const pathname = usePathname();
  const { selectedPatient } = usePatientSelection();
  const current = titles[pathname] ?? titles["/dashboard"];
  const organizationName = context.organization?.tradeName ?? tenant.shortName;
  const accountName = context.guardian?.name ?? context.patient?.name ?? user.email;
  const patientName =
    context.patient?.name ?? context.managedPatients[0]?.name ?? selectedPatient.name;

  return (
    <AppShell
      variant="associated"
      title={current.title}
      subtitle={current.subtitle}
      tenantLabel={`Portal · ${organizationName}`}
      nav={associatedNav}
      user={{
        name: accountName,
        detail: `${patientName} · ${organizationName}`,
      }}
      showSearch={false}
    >
      {children}
    </AppShell>
  );
}

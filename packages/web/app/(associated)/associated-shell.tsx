"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { associatedNav } from "@/components/layout/nav";
import { usePatientSelection } from "@/components/associated/patient-context";
import { useScenario } from "@/components/associated/scenario-context";
import { ScenarioSwitcher } from "@/components/associated/scenario-switcher";
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
    title: "Catálogo educativo",
    subtitle: "Informações descritivas para consulta junto à orientação médica.",
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

export function AssociatedShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedPatient } = usePatientSelection();
  const { scenario } = useScenario();
  const current = titles[pathname] ?? titles["/dashboard"];

  return (
    <AppShell
      variant="associated"
      title={current.title}
      subtitle={current.subtitle}
      nav={associatedNav}
      user={{
        name: scenario.responsible.name,
        detail: `${selectedPatient.name} · ${tenant.shortName}`,
      }}
      actions={<ScenarioSwitcher />}
    >
      {children}
    </AppShell>
  );
}

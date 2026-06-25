"use client";

import Link from "next/link";
import { usePatientSelection } from "@/components/associated/patient-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { tenant } from "@/lib/data";
import type { PurchaseLimit } from "../types";
import { useLimitsQuery } from "../queries/use-limits-query";
import { LimitCard } from "./limit-card";

export function LimitsView() {
  const { selectedPatient } = usePatientSelection();
  // Portal white-label: a associação é fixa pelo contexto (tenant). Limites e
  // receitas valem apenas nesta organização.
  const { data = [], isLoading } = useLimitsQuery(tenant.id, selectedPatient.id);

  const monthly = data.filter((limit) => limit.period === "mensal");
  const annual = data.filter((limit) => limit.period === "anual");
  const attention = data.filter((limit) => limit.used >= limit.allowed * 0.75).length;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <Card className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between md:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-[var(--green-700)]">
            <Icon name="gauge" size={22} />
          </span>
          <div>
            <p className="text-sm font-bold text-[var(--text-secondary)]">Limites de {selectedPatient.name}</p>
            <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
              Quantidades liberadas pela receita para compra no período vigente.
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-secondary-subtle px-2.5 py-1 text-xs font-bold text-[var(--petrol-700)]">
              <Icon name="store" size={13} />
              {tenant.name}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center md:flex-col md:items-end">
          {data.length > 0 ? (
            <div className="flex gap-3">
              <Stat label="Produtos" value={String(data.length)} />
              <Stat label="Em atenção" value={String(attention)} tone={attention > 0 ? "warning" : undefined} />
            </div>
          ) : null}
          <ImportReceitaButton />
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-6 text-sm text-[var(--text-secondary)]">Carregando limites…</Card>
      ) : data.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-warning-subtle text-[var(--warning-600)]">
            <Icon name="alert-triangle" size={24} />
          </span>
          <h2 className="mt-4 font-heading">Nenhuma receita importada</h2>
          <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
            {selectedPatient.name} ainda não tem uma receita aprovada na {tenant.name}. Os limites de compra aparecem
            aqui assim que uma receita for importada e validada nesta associação.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <ImportReceitaButton />
            <Button asChild variant="ghost">
              <Link href="/documents">
                <Icon name="file-text" size={18} />
                Ver documentos
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <LimitSection title="Limite mensal" description="Renova a cada mês." icon="calendar" items={monthly} />
          <LimitSection
            title="Cota anual"
            description="Saldo distribuído ao longo do ano."
            icon="package-check"
            items={annual}
          />

          <p className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
            <Icon name="shield-check" size={15} className="mt-0.5 shrink-0" />
            Os limites seguem a receita médica vigente e valem apenas na {tenant.name}. Pedidos acima do saldo precisam
            de nova prescrição.
          </p>
        </>
      )}
    </div>
  );
}

// Ponto de entrada para importar a receita na associação atual. O fluxo (token
// MEMED / upload de PDF) ainda será construído — por ora é um gancho visível.
// TODO(feature): abrir o fluxo de importação de receita escopado a tenant.id.
function ImportReceitaButton() {
  return (
    <Button variant="secondary" size="sm" disabled title="Disponível em breve">
      <Icon name="upload" size={16} />
      Importar receita
      <span className="ml-1 rounded-pill bg-muted px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-tertiary)]">
        em breve
      </span>
    </Button>
  );
}

function LimitSection({
  title,
  description,
  icon,
  items,
}: {
  title: string;
  description: string;
  icon: "calendar" | "package-check";
  items: PurchaseLimit[];
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Icon name={icon} size={18} className="text-[var(--green-700)]" />
        <h2 className="font-heading">{title}</h2>
        <span className="text-sm text-[var(--text-secondary)]">· {description}</span>
        <span className="ml-auto rounded-pill bg-muted px-2.5 py-1 text-xs font-bold text-[var(--text-secondary)]">
          {items.length} {items.length === 1 ? "produto" : "produtos"}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((limit) => (
          <LimitCard key={limit.id} limit={limit} />
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warning" }) {
  return (
    <div className="rounded-md bg-muted px-4 py-2 text-center">
      <p className={tone === "warning" ? "text-xl font-extrabold text-warning" : "text-xl font-extrabold"}>{value}</p>
      <p className="text-xs font-bold text-[var(--text-tertiary)]">{label}</p>
    </div>
  );
}

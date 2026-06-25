"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/domain/stat-card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { useOrganizations } from "../../organizations/queries/use-organizations";
import { useMasterReportsQuery } from "../queries/use-master-reports-query";
import type {
  MasterMonthlyOrganizations,
  MasterPlanDistributionItem,
  MasterRecentOrganization,
  MasterReports,
} from "../types";
import { MasterDashboardSkeleton } from "./master-dashboard-skeleton";

// Plan/organization badges cycle through these tones for a consistent palette.
const ROTATING_TONES: BadgeProps["tone"][] = ["primary", "accent", "petrol", "neutral"];

type MasterDashboardProps = {
  userId: string;
};

export function MasterDashboard({ userId }: MasterDashboardProps) {
  const [selectedOrganizationIds, setSelectedOrganizationIds] = useState<string[]>([]);

  const organizationsQuery = useOrganizations();
  const reportsQuery = useMasterReportsQuery(userId, selectedOrganizationIds);

  const organizationOptions = useMemo<MultiSelectOption[]>(
    () =>
      (organizationsQuery.data?.data ?? [])
        .map((organization) => ({ label: organization.tradeName, value: organization.id }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    [organizationsQuery.data],
  );

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">Housekeeping Master</p>
          <h2 className="mt-1 font-heading text-2xl text-[var(--text-primary)]">Visão geral da rede</h2>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            Totalizadores consolidados das organizações ativas na plataforma Flora.
          </p>
        </div>
        <div className="w-full lg:w-72">
          <label className="mb-1.5 block text-xs font-semibold uppercase text-[var(--text-secondary)]">
            Filtrar organizações
          </label>
          <MultiSelect
            options={organizationOptions}
            value={selectedOrganizationIds}
            onChange={setSelectedOrganizationIds}
            allLabel="Todas as organizações"
            searchPlaceholder="Buscar organização..."
            emptyMessage="Nenhuma organização encontrada."
            disabled={organizationsQuery.isPending}
          />
        </div>
      </section>

      {reportsQuery.isPending ? (
        <MasterDashboardSkeleton />
      ) : reportsQuery.error ? (
        <MasterDashboardError
          message={reportsQuery.error.message}
          onRetry={() => reportsQuery.refetch()}
        />
      ) : (
        <MasterDashboardContent reports={reportsQuery.data} />
      )}
    </div>
  );
}

function MasterDashboardContent({ reports }: { reports: MasterReports }) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-heading">Novas organizações por mês</h2>
            {reports.monthlyOrganizations.growthLabel ? (
              <Badge tone="success" size="sm">
                {reports.monthlyOrganizations.growthLabel}
              </Badge>
            ) : null}
          </div>
          <GrowthChart monthly={reports.monthlyOrganizations} />
        </Card>

        <Card className="p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-heading">Organizações por plano</h2>
            <Link href="/backoffice/organizations" className="text-sm font-bold text-[var(--green-700)]">
              Ver todas
            </Link>
          </div>
          <PlanDistribution plans={reports.planDistribution} />
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-heading">Organizações recentes</h2>
            <Link href="/backoffice/organizations" className="text-sm font-bold text-[var(--green-700)]">
              Ver todas
            </Link>
          </div>
          <RecentOrganizations organizations={reports.recentOrganizations} />
        </Card>

        <Card className="p-5 md:p-6">
          <h2 className="mb-4 font-heading">Saúde da rede</h2>
          <div className="divide-y divide-border">
            {reports.networkHealth.map((highlight) => (
              <div key={highlight.label} className="flex items-center gap-3 py-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-[var(--text-secondary)]">
                  <Icon name={highlight.icon} size={18} />
                </span>
                <p className="min-w-0 flex-1 truncate text-sm text-[var(--text-secondary)]">{highlight.label}</p>
                <span className="font-mono text-sm font-bold text-[var(--text-primary)]">{highlight.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}

function GrowthChart({ monthly }: { monthly: MasterMonthlyOrganizations }) {
  const max = Math.max(1, ...monthly.points.map((point) => point.value));

  return (
    <div className="flex items-end gap-2 sm:gap-3">
      {monthly.points.map((point) => (
        <div key={point.month} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-primary)]">{point.value}</span>
          <div className="flex h-32 w-full items-end">
            <div
              className="w-full rounded-t-md bg-primary"
              style={{ height: `${Math.max(6, (point.value / max) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-[var(--text-secondary)]">{point.month}</span>
        </div>
      ))}
    </div>
  );
}

function PlanDistribution({ plans }: { plans: MasterPlanDistributionItem[] }) {
  const max = Math.max(1, ...plans.map((plan) => plan.organizations));

  if (plans.length === 0) {
    return <p className="py-6 text-sm text-[var(--text-secondary)]">Nenhuma organização no recorte selecionado.</p>;
  }

  return (
    <div className="space-y-4">
      {plans.map((plan, index) => (
        <div key={plan.name}>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge tone={ROTATING_TONES[index % ROTATING_TONES.length]} size="sm">
                {plan.name}
              </Badge>
              <span className="text-xs text-[var(--text-secondary)]">{plan.percentage}%</span>
            </div>
            <span className="font-mono text-sm font-bold text-[var(--text-primary)]">{plan.organizations}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-pill bg-muted">
            <div
              className="h-full rounded-pill bg-primary"
              style={{ width: `${Math.max(6, (plan.organizations / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentOrganizations({ organizations }: { organizations: MasterRecentOrganization[] }) {
  if (organizations.length === 0) {
    return <p className="py-6 text-sm text-[var(--text-secondary)]">Nenhuma organização no recorte selecionado.</p>;
  }

  return (
    <div className="divide-y divide-border">
      {organizations.map((organization, index) => (
        <div key={`${organization.tradeName}-${index}`} className="flex items-center gap-3 py-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-[var(--green-700)]">
            <Icon name="store" size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[var(--text-primary)]">{organization.tradeName}</p>
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {organization.city}/{organization.state} · {organization.createdAt}
            </p>
          </div>
          <Badge tone={ROTATING_TONES[index % ROTATING_TONES.length]} size="sm">
            {organization.plan}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function MasterDashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-heading text-lg text-[var(--text-primary)]">
            Não foi possível carregar os relatórios
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{message}</p>
        </div>
        <Button onClick={onRetry} type="button" variant="secondary">
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  );
}

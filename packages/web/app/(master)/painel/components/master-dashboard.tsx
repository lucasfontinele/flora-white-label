import Link from "next/link";
import { StatCard } from "@/components/domain/stat-card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";

// Front-end prototype — static mock data to validate the dashboard concept.
// When the backend is ready, replace these constants with a query/request layer
// (e.g. queries/use-master-dashboard-query.ts) following the existing pattern.

const metrics = [
  { label: "Organizações ativas", value: "48", icon: "store", delta: "+5", hint: "novas no mês", tone: "success" },
  { label: "Associados na rede", value: "12.480", icon: "users", delta: "+842", hint: "no mês", tone: "success" },
  { label: "Operadores ativos", value: "326", icon: "shield-check", delta: "+18", hint: "no mês", tone: "success" },
  { label: "Receita recorrente (MRR)", value: "R$ 284,6 mil", icon: "bar-chart-3", delta: "+9,2%", hint: "vs. mês anterior", tone: "success" },
  { label: "Pedidos processados", value: "9.137", icon: "package", delta: "+12%", hint: "toda a rede no mês", tone: "success" },
  { label: "Ativações pendentes", value: "3", icon: "clock", delta: "+1", hint: "aguardando liberação", tone: "error" },
] satisfies Array<{
  label: string;
  value: string;
  icon: IconName;
  delta: string;
  hint: string;
  tone?: "success" | "error";
}>;

const monthlyGrowth = [
  { month: "Jan", value: 31 },
  { month: "Fev", value: 34 },
  { month: "Mar", value: 37 },
  { month: "Abr", value: 41 },
  { month: "Mai", value: 43 },
  { month: "Jun", value: 48 },
];

const planDistribution = [
  { name: "Starter", organizations: 22, tone: "neutral" },
  { name: "Growth", organizations: 18, tone: "primary" },
  { name: "Unlimited", organizations: 8, tone: "accent" },
] satisfies Array<{ name: string; organizations: number; tone: BadgeProps["tone"] }>;

const recentOrganizations = [
  { tradeName: "Verde Vida", city: "Palmas", state: "TO", plan: "Growth", createdAt: "12 jun 2026", tone: "primary" },
  { tradeName: "Cannabis & Cuidado", city: "Goiânia", state: "GO", plan: "Unlimited", createdAt: "10 jun 2026", tone: "accent" },
  { tradeName: "Instituto Folha", city: "Recife", state: "PE", plan: "Starter", createdAt: "08 jun 2026", tone: "neutral" },
  { tradeName: "Raiz Terapêutica", city: "Curitiba", state: "PR", plan: "Growth", createdAt: "05 jun 2026", tone: "primary" },
] satisfies Array<{
  tradeName: string;
  city: string;
  state: string;
  plan: string;
  createdAt: string;
  tone: BadgeProps["tone"];
}>;

const highlights = [
  { label: "Ticket médio por pedido", value: "R$ 312", icon: "bar-chart-3" },
  { label: "Taxa de retenção", value: "94%", icon: "check-circle-2" },
  { label: "Documentos aprovados", value: "98,2%", icon: "file-check" },
  { label: "Tempo médio de ativação", value: "2,4 dias", icon: "clock" },
] satisfies Array<{ label: string; value: string; icon: IconName }>;

export function MasterDashboard() {
  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">Housekeeping Master</p>
          <h2 className="mt-1 font-heading text-2xl text-[var(--text-primary)]">Visão geral da rede</h2>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            Totalizadores consolidados de todas as organizações ativas na plataforma Flora.
          </p>
        </div>
        <Badge tone="petrol" dot>
          Junho 2026
        </Badge>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-heading">Novas organizações por mês</h2>
            <Badge tone="success" size="sm">
              +54% no semestre
            </Badge>
          </div>
          <GrowthChart />
        </Card>

        <Card className="p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-heading">Organizações por plano</h2>
            <Link href="/organizations" className="text-sm font-bold text-[var(--green-700)]">
              Ver todas
            </Link>
          </div>
          <PlanDistribution />
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-heading">Organizações recentes</h2>
            <Link href="/organizations" className="text-sm font-bold text-[var(--green-700)]">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrganizations.map((organization) => (
              <div key={organization.tradeName} className="flex items-center gap-3 py-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-[var(--green-700)]">
                  <Icon name="store" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[var(--text-primary)]">{organization.tradeName}</p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {organization.city}/{organization.state} · {organization.createdAt}
                  </p>
                </div>
                <Badge tone={organization.tone} size="sm">
                  {organization.plan}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <h2 className="mb-4 font-heading">Saúde da rede</h2>
          <div className="divide-y divide-border">
            {highlights.map((highlight) => (
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
    </div>
  );
}

function GrowthChart() {
  const max = Math.max(...monthlyGrowth.map((item) => item.value));

  return (
    <div className="flex items-end gap-2 sm:gap-3">
      {monthlyGrowth.map((item) => (
        <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-primary)]">{item.value}</span>
          <div className="flex h-32 w-full items-end">
            <div
              className="w-full rounded-t-md bg-primary"
              style={{ height: `${Math.max(6, (item.value / max) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-[var(--text-secondary)]">{item.month}</span>
        </div>
      ))}
    </div>
  );
}

function PlanDistribution() {
  const total = planDistribution.reduce((sum, plan) => sum + plan.organizations, 0);
  const max = Math.max(...planDistribution.map((plan) => plan.organizations));

  return (
    <div className="space-y-4">
      {planDistribution.map((plan) => (
        <div key={plan.name}>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge tone={plan.tone} size="sm">
                {plan.name}
              </Badge>
              <span className="text-xs text-[var(--text-secondary)]">
                {Math.round((plan.organizations / total) * 100)}%
              </span>
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

"use client";

import Link from "next/link";
import { StatCard } from "@/components/domain/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useOperationalDashboardQuery } from "../queries/use-operational-dashboard-query";
import type { OperationalDashboard, OperationalOrdersByStatus } from "../types";
import { OperationalDashboardSkeleton } from "./operational-dashboard-skeleton";

export function OperationalDashboard() {
  const { data, error, isPending, refetch } = useOperationalDashboardQuery();

  if (isPending) {
    return <OperationalDashboardSkeleton />;
  }

  if (error) {
    return <OperationalDashboardError message={error.message} onRetry={() => refetch()} />;
  }

  return <OperationalDashboardContent dashboard={data} />;
}

function OperationalDashboardContent({ dashboard }: { dashboard: OperationalDashboard }) {
  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboard.metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <Card className="p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-heading">Pedidos por status</h2>
            <Badge tone="neutral">{dashboard.referenceLabel}</Badge>
          </div>
          <StatusBars ordersByStatus={dashboard.ordersByStatus} />
        </Card>

        <Card className="p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-heading">Estoque baixo</h2>
            <Link href="/organization/operacional/inventory" className="text-sm font-bold text-[var(--green-700)]">
              Ver estoque
            </Link>
          </div>
          {dashboard.lowStock.length === 0 ? (
            <p className="py-6 text-sm text-[var(--text-secondary)]">Nenhum item com estoque baixo.</p>
          ) : (
            <div className="divide-y divide-border">
              {dashboard.lowStock.map((item) => (
                <div key={item.name} className="flex items-center gap-3 py-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-muted text-[var(--text-secondary)]">
                    <Icon name="boxes" size={18} />
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-bold">{item.name}</p>
                  <Badge tone={item.tone} size="sm">
                    {item.amount}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

function StatusBars({ ordersByStatus }: { ordersByStatus: OperationalOrdersByStatus[] }) {
  const max = Math.max(1, ...ordersByStatus.map((item) => item.count));

  return (
    <div className="space-y-3">
      {ordersByStatus.map((item) => (
        <div key={item.status} className="grid grid-cols-[145px_1fr_36px] items-center gap-3">
          <span className="truncate text-sm text-[var(--text-secondary)]">{item.status}</span>
          <div className="h-2.5 overflow-hidden rounded-pill bg-muted">
            <div
              className="h-full rounded-pill bg-primary"
              style={{ width: `${Math.max(8, (item.count / max) * 100)}%` }}
            />
          </div>
          <span className="text-right font-mono text-sm font-bold">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

function OperationalDashboardError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-heading text-lg text-[var(--text-primary)]">
            Não foi possível carregar a visão geral
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

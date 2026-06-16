import Link from "next/link";
import { StatCard } from "@/components/domain/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { lowStock, metrics, orderStages, operatorOrders } from "@/lib/data";

export function OperationalDashboard() {
  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <Card className="p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-heading">Pedidos por status</h2>
            <Badge tone="neutral">Junho 2026</Badge>
          </div>
          <StatusBars />
        </Card>

        <Card className="p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-heading">Estoque baixo</h2>
            <Link href="/operacional/inventory" className="text-sm font-bold text-[var(--green-700)]">
              Ver estoque
            </Link>
          </div>
          <div className="divide-y divide-border">
            {lowStock.map((item) => (
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
        </Card>
      </section>
    </div>
  );
}

function StatusBars() {
  const data = orderStages.map((stage) => ({
    label: stage,
    count: operatorOrders.filter((order) => order.status === stage).length || (stage === "Entregue" ? 75 : 6),
  }));
  const max = Math.max(...data.map((item) => item.count));

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="grid grid-cols-[145px_1fr_36px] items-center gap-3">
          <span className="truncate text-sm text-[var(--text-secondary)]">{item.label}</span>
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

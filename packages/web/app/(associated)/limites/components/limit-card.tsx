import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { ConsumptionUnit, ProductForm, PurchaseLimit } from "../types";

const formIcon: Record<ProductForm, IconName> = {
  Óleo: "droplet",
  Flor: "leaf",
  Goma: "pill",
  Pomada: "package",
  Concentrado: "flask",
};

// Flores são medidas em gramas; os demais formatos são contados por quantidade.
function formatUnit(value: number, unit: ConsumptionUnit) {
  if (unit === "g") return `${value} g`;

  const labels: Record<Exclude<ConsumptionUnit, "g">, [string, string]> = {
    frasco: ["frasco", "frascos"],
    unidade: ["unidade", "unidades"],
    embalagem: ["embalagem", "embalagens"],
  };
  const [singular, plural] = labels[unit];
  return `${value} ${value === 1 ? singular : plural}`;
}

export function LimitCard({ limit }: { limit: PurchaseLimit }) {
  const remaining = Math.max(0, limit.allowed - limit.used);
  const usedPct = limit.allowed > 0 ? Math.min(100, Math.round((limit.used / limit.allowed) * 100)) : 0;
  const exhausted = remaining === 0;
  const low = !exhausted && usedPct >= 75;

  const tone = exhausted ? "error" : low ? "warning" : "primary";
  const barColor = exhausted ? "bg-error" : low ? "bg-warning" : "bg-primary";
  const windowLabel = limit.period === "mensal" ? "este mês" : "este ano";

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
            exhausted ? "bg-error-subtle text-[var(--error-600)]" : "bg-primary-subtle text-[var(--green-700)]",
          )}
        >
          <Icon name={formIcon[limit.form]} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-snug">{limit.product}</p>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            {limit.brand} · {limit.form}
          </p>
        </div>
        <Badge tone="neutral" size="sm" className="shrink-0">
          {limit.period === "mensal" ? "Mensal" : "Anual"}
        </Badge>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-extrabold leading-none">
            {remaining}
            <span className="ml-1 text-base font-bold text-[var(--text-secondary)]">
              {limit.unit === "g" ? "g" : ""}
            </span>
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {exhausted ? `Esgotado ${windowLabel}` : `${formatUnit(remaining, limit.unit)} ${windowLabel}`}
          </p>
        </div>
        <Badge tone={tone} dot className="shrink-0">
          {exhausted ? "Esgotado" : low ? "Pouco saldo" : "Disponível"}
        </Badge>
      </div>

      <div className="mt-3">
        <div
          className="h-2.5 w-full overflow-hidden rounded-pill bg-muted"
          role="progressbar"
          aria-valuenow={usedPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Consumo de ${limit.product}`}
        >
          <div className={cn("h-full rounded-pill transition-all", barColor)} style={{ width: `${usedPct}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>
            {formatUnit(limit.used, limit.unit)} de {formatUnit(limit.allowed, limit.unit)} usados
          </span>
          <span className="font-bold">{usedPct}%</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-[var(--text-secondary)]">
        <Icon name="file-check" size={14} />
        Receita válida até {limit.prescriptionDue}
      </div>
    </Card>
  );
}

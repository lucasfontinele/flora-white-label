import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { PurchaseLimitItem, PurchaseLimitUnit } from "../types";

const unitIcon: Record<PurchaseLimitUnit, IconName> = {
  GRAM: "leaf",
  MILLILITER: "droplet",
  UNIT: "package",
};

// Grams/millilitres carry a measurement suffix; units are counted as items.
function formatUnit(value: number, unit: PurchaseLimitUnit) {
  if (unit === "GRAM") return `${value} g`;
  if (unit === "MILLILITER") return `${value} ml`;
  return `${value} ${value === 1 ? "unidade" : "unidades"}`;
}

export function LimitCard({
  item,
  validUntilLabel,
}: {
  item: PurchaseLimitItem;
  validUntilLabel: string;
}) {
  const usedPct =
    item.allowedQuantity > 0
      ? Math.min(100, Math.round((item.used / item.allowedQuantity) * 100))
      : 0;
  const exhausted = item.remaining === 0;
  const low = !exhausted && usedPct >= 75;

  const tone = exhausted ? "error" : low ? "warning" : "primary";
  const barColor = exhausted ? "bg-error" : low ? "bg-warning" : "bg-primary";
  const windowLabel = item.period === "MONTHLY" ? "este mês" : "este ano";

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
            exhausted
              ? "bg-error-subtle text-[var(--error-600)]"
              : "bg-primary-subtle text-[var(--green-700)]",
          )}
        >
          <Icon name={unitIcon[item.unit]} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-snug">{item.productName}</p>
          {item.notes ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-[var(--text-secondary)]">{item.notes}</p>
          ) : null}
        </div>
        <Badge tone="neutral" size="sm" className="shrink-0">
          {item.period === "MONTHLY" ? "Mensal" : "Anual"}
        </Badge>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-extrabold leading-none">
            {item.remaining}
            <span className="ml-1 text-base font-bold text-[var(--text-secondary)]">
              {item.unit === "GRAM" ? "g" : item.unit === "MILLILITER" ? "ml" : ""}
            </span>
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {exhausted
              ? `Esgotado ${windowLabel}`
              : `${formatUnit(item.remaining, item.unit)} ${windowLabel}`}
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
          aria-label={`Consumo de ${item.productName}`}
        >
          <div
            className={cn("h-full rounded-pill transition-all", barColor)}
            style={{ width: `${usedPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>
            {formatUnit(item.used, item.unit)} de {formatUnit(item.allowedQuantity, item.unit)} usados
          </span>
          <span className="font-bold">{usedPct}%</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-[var(--text-secondary)]">
        <Icon name="file-check" size={14} />
        Receita válida até {validUntilLabel}
      </div>
    </Card>
  );
}

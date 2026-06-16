import { Icon, type IconName } from "@/components/ui/icon";
import { orderStages, stageIndex, type OrderStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

const statusIcon: Record<OrderStatus, IconName> = {
  Solicitado: "package",
  "Em análise": "clock",
  Aprovado: "check-circle-2",
  "Em separação": "package-open",
  "Pronto para retirada": "store",
  Enviado: "truck",
  Entregue: "check",
};

type OrderTimelineProps = {
  current: OrderStatus;
  timestamps?: Partial<Record<OrderStatus, string>>;
  compact?: boolean;
  className?: string;
};

export function OrderTimeline({ current, timestamps = {}, compact, className }: OrderTimelineProps) {
  const currentIndex = stageIndex(current);

  return (
    <div className={cn("flex flex-col", className)}>
      {orderStages.map((stage, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const last = index === orderStages.length - 1;

        return (
          <div
            key={stage}
            className={cn("grid grid-cols-[32px_1fr] gap-3", compact ? "min-h-11" : "min-h-14")}
          >
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-pill border-2 bg-card transition-colors",
                  done && "border-primary bg-primary text-white",
                  active && "border-accent text-[var(--accent-600)] shadow-[0_0_0_4px_rgba(99,193,140,0.20)]",
                  !done && !active && "border-border text-[var(--text-tertiary)]",
                )}
              >
                <Icon name={done ? "check" : statusIcon[stage]} size={16} strokeWidth={done ? 3 : 1.9} />
              </span>
              {!last ? (
                <span
                  className={cn(
                    "mt-0.5 w-0.5 flex-1 rounded-pill",
                    index < currentIndex ? "bg-primary" : "bg-border",
                  )}
                />
              ) : null}
            </div>
            <div className={cn("pb-3 pt-1", compact && "pb-2")}>
              <p
                className={cn(
                  "text-sm leading-snug",
                  (done || active) && "font-bold",
                  active ? "text-[var(--green-700)]" : done ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]",
                )}
              >
                {stage}
              </p>
              {timestamps[stage] ? (
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{timestamps[stage]}</p>
              ) : active ? (
                <p className="mt-1 text-sm text-[var(--accent-600)]">Em andamento</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

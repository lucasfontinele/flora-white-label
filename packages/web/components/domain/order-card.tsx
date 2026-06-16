import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { statusTone, type AssociatedOrder } from "@/lib/data";
import { cn } from "@/lib/utils";

type OrderCardProps = {
  order: AssociatedOrder;
  href?: string;
  className?: string;
};

export function OrderCard({ order, href, className }: OrderCardProps) {
  const content = (
    <Card className={cn("p-5 transition hover:-translate-y-0.5 hover:shadow-md", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text-secondary)]">Pedido</p>
          <p className="mt-1 font-mono text-lg font-bold">{order.number}</p>
        </div>
        <Badge tone={statusTone[order.status]} dot>
          {order.status}
        </Badge>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Meta icon="calendar" label="Data" value={order.createdAt} />
        <Meta icon="boxes" label="Itens" value={`${order.items} ${order.items === 1 ? "item" : "itens"}`} />
        <Meta
          icon={order.deliveryType === "Retirada na sede" ? "store" : "truck"}
          label="Entrega"
          value={order.deliveryType}
        />
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function Meta({
  icon,
  label,
  value,
}: {
  icon: "calendar" | "boxes" | "store" | "truck";
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-muted text-[var(--text-secondary)]">
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-[var(--text-tertiary)]">{label}</p>
        <p className="truncate text-sm font-bold text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}

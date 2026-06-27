import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_TYPE_LABELS,
  type Product,
} from "@/app/organization/operacional/products/types";

type CatalogCardProps = {
  item: Product;
};

function formatPercentage(value: number | null): string {
  return value === null ? "—" : `${value}%`;
}

function formatPrice(priceInCents: number): string {
  return (priceInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function CatalogCard({ item }: CatalogCardProps) {
  return (
    <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative flex h-36 items-center justify-center bg-[var(--green-100)]">
        <Badge tone="petrol" size="sm" className="absolute left-3 top-3 z-10">
          {PRODUCT_TYPE_LABELS[item.type]}
        </Badge>
        {item.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.coverImageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <Icon name="flask" size={48} className="text-[var(--green-700)]" />
        )}
      </div>
      <div className="p-5">
        <Badge tone="neutral" size="sm">
          {PRODUCT_CATEGORY_LABELS[item.category]}
        </Badge>
        <h3 className="mt-2 text-xl font-extrabold leading-tight">{item.name}</h3>
        {item.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">{item.description}</p>
        ) : null}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Metric label="THC" value={formatPercentage(item.thcPercentage)} />
          <Metric label="CBD" value={formatPercentage(item.cbdPercentage)} />
        </div>
        <p className="mt-4 text-lg font-extrabold text-[var(--text-primary)]">
          {formatPrice(item.priceInCents)}
        </p>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <p className="text-xs font-bold text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-1 font-mono text-sm font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

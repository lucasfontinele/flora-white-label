import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

type CatalogCardProps = {
  item: {
    name: string;
    type: string;
    thc: string;
    cbd: string;
    terpenes: string[];
    tags: string[];
  };
};

export function CatalogCard({ item }: CatalogCardProps) {
  return (
    <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-36 flex-col justify-between bg-[var(--green-100)] p-4">
        <Badge tone="petrol" size="sm">
          {item.type}
        </Badge>
        <Icon name="flask" size={48} className="mx-auto text-[var(--green-700)]" />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-extrabold leading-tight">{item.name}</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Metric label="THC" value={item.thc} />
          <Metric label="CBD" value={item.cbd} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.terpenes.map((terpene) => (
            <Badge key={terpene} tone="neutral" size="sm">
              {terpene}
            </Badge>
          ))}
        </div>
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

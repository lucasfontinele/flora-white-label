import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";

type ManagementRecord = {
  title: string;
  description: string;
  meta: string;
  status: string;
  tone?: "success" | "warning" | "error" | "info" | "primary" | "neutral";
};

type ManagementListProps = {
  eyebrow: string;
  heading: string;
  description: string;
  action: string;
  icon: IconName;
  records: ManagementRecord[];
};

export function ManagementList({
  eyebrow,
  heading,
  description,
  action,
  icon,
  records,
}: ManagementListProps) {
  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-[var(--green-700)]">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-extrabold">{heading}</h2>
          <p className="mt-2 text-[var(--text-secondary)]">{description}</p>
        </div>
        <Button>
          <Icon name="plus" size={18} />
          {action}
        </Button>
      </section>

      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          {records.map((record) => (
            <div
              key={`${record.title}-${record.description}`}
              className="grid gap-4 p-4 md:grid-cols-[1fr_180px_128px] md:items-center md:px-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-[var(--green-700)]">
                  <Icon name={icon} size={20} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold">{record.title}</p>
                  <p className="truncate text-sm text-[var(--text-secondary)]">{record.description}</p>
                </div>
              </div>
              <p className="font-mono text-sm font-bold text-[var(--text-secondary)]">{record.meta}</p>
              <Badge tone={record.tone ?? "neutral"}>{record.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

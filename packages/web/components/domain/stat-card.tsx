import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  icon: IconName;
  delta: string;
  hint: string;
  tone?: "success" | "error";
};

export function StatCard({ label, value, icon, delta, hint, tone }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-[12rem] text-sm font-bold text-[var(--text-secondary)]">{label}</p>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary-subtle text-[var(--green-700)]">
          <Icon name={icon} size={20} />
        </span>
      </div>
      <p className="mt-6 text-4xl font-extrabold leading-none text-[var(--text-primary)]">{value}</p>
      <p className="mt-4 text-sm text-[var(--text-secondary)]">
        <span
          className={cn(
            "font-bold",
            tone === "error" ? "text-error" : tone === "success" ? "text-success" : "text-[var(--text-secondary)]",
          )}
        >
          {delta}
        </span>{" "}
        {hint}
      </p>
    </Card>
  );
}

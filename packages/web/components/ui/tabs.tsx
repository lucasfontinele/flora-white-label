"use client";

import { cn } from "@/lib/utils";

export type TabItem<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

type TabsProps<T extends string> = {
  value: T;
  tabs: Array<TabItem<T>>;
  onChange: (value: T) => void;
  className?: string;
};

export function Tabs<T extends string>({ value, tabs, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="tablist">
      {tabs.map((tab) => {
        const selected = tab.value === value;

        return (
          <button
            key={tab.value}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-pill border px-4 text-sm font-semibold transition-colors",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-[var(--text-secondary)] hover:border-primary-border hover:bg-primary-subtle hover:text-[var(--green-700)]",
            )}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
            {typeof tab.count === "number" ? (
              <span
                className={cn(
                  "rounded-pill px-1.5 py-0.5 text-[11px]",
                  selected ? "bg-white/20 text-white" : "bg-muted text-[var(--text-secondary)]",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

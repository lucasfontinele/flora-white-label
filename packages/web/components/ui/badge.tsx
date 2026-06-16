import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-semibold leading-none",
  {
    variants: {
      tone: {
        neutral: "border-transparent bg-muted text-[var(--text-secondary)]",
        primary: "border-transparent bg-primary-subtle text-[var(--green-700)]",
        accent: "border-transparent bg-[rgba(99,193,140,0.18)] text-[var(--green-700)]",
        petrol: "border-transparent bg-secondary-subtle text-[var(--petrol-700)]",
        success: "border-transparent bg-success-subtle text-[var(--success-600)]",
        warning: "border-transparent bg-warning-subtle text-[var(--warning-600)]",
        error: "border-transparent bg-error-subtle text-[var(--error-600)]",
        info: "border-transparent bg-info-subtle text-[var(--info-600)]",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "md",
    },
  },
);

const dotTone = {
  neutral: "bg-[var(--neutral-400)]",
  primary: "bg-primary",
  accent: "bg-accent",
  petrol: "bg-petrol",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone = "neutral", size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size, className }))} {...props}>
      {dot ? <span className={cn("h-2 w-2 rounded-full", dotTone[tone ?? "neutral"])} /> : null}
      {children}
    </span>
  );
}

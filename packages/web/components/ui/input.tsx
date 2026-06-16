import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leadingIcon, ...props }, ref) => (
    <label className="relative block">
      {leadingIcon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 inline-flex -translate-y-1/2 text-[var(--text-tertiary)]">
          {leadingIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-md border border-input bg-card px-4 text-base shadow-xs transition-[border-color,box-shadow] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-focus)]",
          leadingIcon && "pl-10",
          className,
        )}
        {...props}
      />
    </label>
  ),
);

Input.displayName = "Input";

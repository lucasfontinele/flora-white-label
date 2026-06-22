import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-md border border-input bg-card px-4 py-3 text-base shadow-xs transition-[border-color,box-shadow] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-focus)]",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

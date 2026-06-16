import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-[background,border-color,box-shadow,color,transform] duration-200 disabled:pointer-events-none disabled:opacity-55 focus-visible:ring-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-primary hover:bg-primary-hover active:bg-[var(--color-primary-active)] active:translate-y-px",
        secondary:
          "border border-border bg-card text-[var(--text-primary)] shadow-xs hover:border-primary-border hover:bg-primary-subtle",
        ghost:
          "text-[var(--text-secondary)] hover:bg-muted hover:text-[var(--text-primary)]",
        danger:
          "bg-error text-white shadow-sm hover:bg-[var(--error-600)] active:translate-y-px",
      },
      size: {
        sm: "min-h-9 rounded-sm px-3 text-sm",
        md: "min-h-11 px-4",
        lg: "min-h-12 px-5 text-base",
        icon: "h-10 min-h-10 w-10 rounded-sm p-0",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "button";

    return (
      <Component
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };

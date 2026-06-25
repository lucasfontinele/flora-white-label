import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Generic loading placeholder. Render one or more to mimic the shape of the
 * content being loaded.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

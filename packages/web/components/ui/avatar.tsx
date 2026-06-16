import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  inverse?: boolean;
};

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ name, className, size = "md", inverse = false }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-pill font-bold",
        inverse ? "bg-white/15 text-white" : "bg-primary-subtle text-[var(--green-700)]",
        sizes[size],
        className,
      )}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}

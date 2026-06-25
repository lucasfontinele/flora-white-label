"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Trigger label shown when nothing is selected (i.e. "everything"). */
  allLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
};

/**
 * Dependency-free multi-select built on the same design tokens as {@link Select}
 * (shadcn recipe). An empty selection means "all", which is exactly what the
 * master reports filter needs. Closes on outside click or Escape.
 */
export function MultiSelect({
  options,
  value,
  onChange,
  allLabel = "Todas",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum resultado.",
  disabled = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectedCount = value.length;
  const triggerLabel =
    selectedCount === 0
      ? allLabel
      : selectedCount === 1
        ? (options.find((option) => option.value === value[0])?.label ?? `${selectedCount} selecionada`)
        : `${selectedCount} selecionadas`;

  const filteredOptions = search
    ? options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((id) => id !== optionValue)
        : [...value, optionValue],
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-card px-4 text-base shadow-xs transition-[border-color,box-shadow] focus:border-[var(--border-focus)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-55"
      >
        <span className={cn("line-clamp-1 text-left", selectedCount === 0 && "text-[var(--text-tertiary)]")}>
          {triggerLabel}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-multiselectable
          className="absolute right-0 z-[60] mt-1 max-h-80 w-full min-w-[16rem] overflow-hidden rounded-md border border-border bg-card text-[var(--text-primary)] shadow-lg"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-[var(--text-tertiary)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-tertiary)]"
            />
            {value.length > 0 ? (
              <button
                type="button"
                onClick={() => onChange([])}
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--green-700)]"
              >
                Limpar
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>

          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-[var(--text-secondary)]">{emptyMessage}</p>
            ) : (
              filteredOptions.map((option) => {
                const checked = value.includes(option.value);

                return (
                  <button
                    type="button"
                    key={option.value}
                    role="option"
                    aria-selected={checked}
                    onClick={() => toggle(option.value)}
                    className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-muted"
                  >
                    <span
                      className={cn(
                        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                        checked ? "border-primary bg-primary text-white" : "border-input",
                      )}
                    >
                      {checked ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span className="line-clamp-1">{option.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

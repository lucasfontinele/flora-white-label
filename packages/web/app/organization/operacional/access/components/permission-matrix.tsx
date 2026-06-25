"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  ACTION_LABELS,
  MODULE_LABELS,
  permissionKey,
  type PermissionCatalog,
  type PermissionModule,
  type PermissionAction,
  type Role,
} from "../types";

type PermissionMatrixProps = {
  role: Role;
  catalog: PermissionCatalog;
  selected: Set<string>;
  disabled?: boolean;
  onToggle: (module: PermissionModule, action: PermissionAction) => void;
};

export function PermissionMatrix({
  role,
  catalog,
  selected,
  disabled = false,
  onToggle,
}: PermissionMatrixProps) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead className="bg-muted text-xs font-bold text-[var(--text-secondary)]">
          <tr>
            <th className="px-4 py-3 text-left">Módulo</th>
            {catalog.actions.map((action) => (
              <th key={action} className="px-4 py-3 text-center">
                {ACTION_LABELS[action]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {catalog.modules.map((module) => (
            <tr key={module}>
              <td className="px-4 py-3 font-bold">{MODULE_LABELS[module]}</td>
              {catalog.actions.map((action) => {
                const impliedByView = action === "VIEW" && role.viewAll;
                const locked = disabled || role.fullAccess || impliedByView;
                const checked =
                  role.fullAccess || impliedByView || selected.has(permissionKey(module, action));

                return (
                  <td key={action} className="px-4 py-3 text-center">
                    <PermissionCheckbox
                      checked={checked}
                      disabled={locked}
                      label={`${MODULE_LABELS[module]} · ${ACTION_LABELS[action]}`}
                      onToggle={() => onToggle(module, action)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PermissionCheckbox({
  checked,
  disabled,
  label,
  onToggle,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-sm border-2 transition-colors",
        checked
          ? "border-[var(--green-500)] bg-[var(--green-500)] text-white"
          : "border-[var(--neutral-300)] bg-card text-transparent hover:border-primary-border",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      {checked ? <Icon name="check" size={15} strokeWidth={3} /> : null}
    </button>
  );
}

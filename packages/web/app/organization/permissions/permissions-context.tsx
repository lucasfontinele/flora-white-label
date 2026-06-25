"use client";

import { createContext, useContext, useMemo } from "react";
import type { EmployeePermissions, PermissionAction, PermissionModule } from "./types";

type PermissionsContextValue = {
  data: EmployeePermissions | undefined;
  ready: boolean;
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({
  value,
  children,
}: {
  value: PermissionsContextValue;
  children: React.ReactNode;
}) {
  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export type UsePermissions = {
  /** True once the current user's permissions have loaded. */
  ready: boolean;
  /** True when the user has a full-access role (sees/does everything). */
  fullAccess: boolean;
  /** True for "diretoria pra cima" roles that view everything (Diretoria, Super admin). */
  viewAll: boolean;
  can: (module: PermissionModule, action: PermissionAction) => boolean;
  canView: (module: PermissionModule) => boolean;
};

export function usePermissions(): UsePermissions {
  const context = useContext(PermissionsContext);
  const data = context?.data;
  const ready = context?.ready ?? false;

  const granted = useMemo(
    () => new Set((data?.permissions ?? []).map((permission) => `${permission.module}:${permission.action}`)),
    [data],
  );

  const can = (module: PermissionModule, action: PermissionAction): boolean => {
    if (!data) return false;
    if (data.fullAccess) return true;
    if (action === "VIEW" && data.viewAll) return true;
    return granted.has(`${module}:${action}`);
  };

  return {
    ready,
    fullAccess: data?.fullAccess ?? false,
    viewAll: data?.viewAll ?? false,
    can,
    canView: (module) => can(module, "VIEW"),
  };
}

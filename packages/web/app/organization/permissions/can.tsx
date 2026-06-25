"use client";

import { usePermissions } from "./permissions-context";
import type { PermissionAction, PermissionModule } from "./types";

/**
 * Inline gate for actions (buttons, links). Renders the children only when the
 * user has the given permission; otherwise renders `fallback` (nothing by
 * default). While permissions are still loading, nothing is rendered so an
 * action is never shown before access is confirmed.
 */
export function Can({
  module,
  action,
  fallback = null,
  children,
}: {
  module: PermissionModule;
  action: PermissionAction;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { ready, can } = usePermissions();

  if (!ready) return null;

  return can(module, action) ? <>{children}</> : <>{fallback}</>;
}

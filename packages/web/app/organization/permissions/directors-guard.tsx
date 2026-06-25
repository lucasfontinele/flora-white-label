"use client";

import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "./permissions-context";

/**
 * Page-level gate for "diretoria pra cima": renders the children only when the
 * current user has a view-everything role (Diretoria or Super administrador).
 * While permissions are loading it shows a skeleton; when access is denied it
 * shows a friendly "no access" card instead of the screen.
 */
export function DirectorsGuard({ children }: { children: React.ReactNode }) {
  const { ready, fullAccess, viewAll } = usePermissions();

  if (!ready) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!fullAccess && !viewAll) {
    return (
      <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-[var(--text-secondary)]">
          <Icon name="lock" size={24} />
        </span>
        <h2 className="font-heading text-lg text-[var(--text-primary)]">Acesso restrito</h2>
        <p className="max-w-md text-sm text-[var(--text-secondary)]">
          A visão geral é exclusiva da diretoria. Fale com um administrador da sua organização se
          precisar de acesso.
        </p>
      </Card>
    );
  }

  return <>{children}</>;
}

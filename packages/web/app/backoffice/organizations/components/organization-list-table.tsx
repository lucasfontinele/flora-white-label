"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCnpj } from "@/lib/masks";
import type { Organization } from "../types";

type OrganizationListTableProps = {
  error?: Error | null;
  isLoading?: boolean;
  onDelete?: (organization: Organization) => void;
  onRetry?: () => void;
  organizations: Organization[];
};

const columnCount = 6;

export function OrganizationListTable({
  error,
  isLoading = false,
  onDelete,
  onRetry,
  organizations,
}: OrganizationListTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <OrganizationTableShell>
            {Array.from({ length: 4 }).map((_, index) => (
              <OrganizationRowSkeleton key={index} />
            ))}
          </OrganizationTableShell>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-lg text-[var(--text-primary)]">
              Não foi possível carregar as organizações
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{error.message}</p>
          </div>
          {onRetry ? (
            <Button onClick={onRetry} type="button" variant="secondary">
              Tentar novamente
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (organizations.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <h2 className="font-heading text-lg text-[var(--text-primary)]">Nenhuma organização cadastrada</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Cadastre a primeira associação para iniciar a operação Master.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <OrganizationTableShell>
          {organizations.map((organization) => (
            <tr key={organization.id} className="bg-card">
              <td className="px-5 py-4">
                <div className="font-semibold text-[var(--text-primary)]">{organization.tradeName}</div>
                <div className="mt-1 text-xs text-[var(--text-secondary)]">{organization.legalName}</div>
              </td>
              <td className="px-5 py-4 font-mono text-xs text-[var(--text-primary)]">
                {formatCnpj(organization.cnpj)}
              </td>
              <td className="px-5 py-4 text-[var(--text-primary)]">
                {organization.address.city}/{organization.address.state}
              </td>
              <td className="px-5 py-4">
                <Badge tone="primary">{organization.currentPlan.title}</Badge>
              </td>
              <td className="px-5 py-4 text-[var(--text-secondary)]">
                <div>{organization.currentPlan.operatorsLimit} operadores</div>
                <div>{organization.currentPlan.patientsLimit} usuários</div>
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/backoffice/organizations/${organization.id}/edit`}>Editar</Link>
                  </Button>
                  <Button
                    aria-label={`Excluir organização ${organization.tradeName}`}
                    onClick={() => onDelete?.(organization)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </OrganizationTableShell>
        <div className="border-t border-border px-5 py-3 text-xs text-[var(--text-secondary)]">
          {organizations.length} {organizations.length === 1 ? "organização encontrada" : "organizações encontradas"}
        </div>
      </CardContent>
    </Card>
  );
}

function OrganizationTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead className="border-b border-border bg-muted text-xs uppercase text-[var(--text-secondary)]">
          <tr>
            <th className="px-5 py-3 font-semibold">Organização</th>
            <th className="px-5 py-3 font-semibold">CNPJ</th>
            <th className="px-5 py-3 font-semibold">Cidade/UF</th>
            <th className="px-5 py-3 font-semibold">Plano</th>
            <th className="px-5 py-3 font-semibold">Limites</th>
            <th className="px-5 py-3 text-right font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

function OrganizationRowSkeleton() {
  return (
    <tr aria-busy="true" className="bg-card">
      {Array.from({ length: columnCount }).map((_, index) => (
        <td key={index} className="px-5 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

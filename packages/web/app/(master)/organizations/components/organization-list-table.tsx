"use client";

import type { OrganizationListItemDto, PaginationDto } from "@flora/shared/organizations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCnpj } from "@/lib/masks";

type OrganizationListTableProps = {
  error?: Error | null;
  isLoading?: boolean;
  onRetry?: () => void;
  organizations: OrganizationListItemDto[];
  pagination: PaginationDto;
};

export function OrganizationListTable({
  error,
  isLoading = false,
  onRetry,
  organizations,
  pagination,
}: OrganizationListTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-[var(--text-secondary)]">Carregando organizações...</CardContent>
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="border-b border-border bg-muted text-xs uppercase text-[var(--text-secondary)]">
              <tr>
                <th className="px-5 py-3 font-semibold">Organização</th>
                <th className="px-5 py-3 font-semibold">CNPJ</th>
                <th className="px-5 py-3 font-semibold">Cidade/UF</th>
                <th className="px-5 py-3 font-semibold">Plano</th>
                <th className="px-5 py-3 font-semibold">Limites</th>
                <th className="px-5 py-3 font-semibold">Criada em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {organizations.map((organization) => (
                <tr key={organization.id} className="bg-card">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[var(--text-primary)]">{organization.tradeName}</div>
                    <div className="mt-1 text-xs text-[var(--text-secondary)]">{organization.legalName}</div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--text-primary)]">{formatCnpj(organization.cnpj)}</td>
                  <td className="px-5 py-4 text-[var(--text-primary)]">
                    {organization.city}/{organization.state}
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone="primary">{organization.subscriptionPlan.name}</Badge>
                  </td>
                  <td className="px-5 py-4 text-[var(--text-secondary)]">
                    <div>{formatOperatorLimit(organization)}</div>
                    <div>{organization.subscriptionPlan.maxActiveUsers} usuários</div>
                  </td>
                  <td className="px-5 py-4 text-[var(--text-secondary)]">{formatDate(organization.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-5 py-3 text-xs text-[var(--text-secondary)]">
          {pagination.total} organizações encontradas
        </div>
      </CardContent>
    </Card>
  );
}

function formatOperatorLimit(organization: OrganizationListItemDto) {
  if (organization.subscriptionPlan.operatorLimitType === "unlimited") return "Operadores ilimitados";

  return `${organization.subscriptionPlan.maxOperators ?? 0} operadores`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(value));
}

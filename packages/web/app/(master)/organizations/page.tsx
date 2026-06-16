"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { OrganizationListTable } from "./components/organization-list-table";
import { useOrganizations } from "./queries/use-organizations";

export default function MasterOrganizationsPage() {
  const query = useOrganizations({ page: 1, perPage: 20 });
  const data = query.data ?? {
    data: [],
    pagination: {
      page: 1,
      perPage: 20,
      total: 0,
      totalPages: 0,
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">Housekeeping Master</p>
          <h2 className="mt-1 font-heading text-2xl text-[var(--text-primary)]">Listagem de organizações</h2>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            Controle as associações cadastradas, seus planos e dados principais de identificação.
          </p>
        </div>
        <Button asChild>
          <Link href="/organizations/new">
            <Icon name="plus" size={18} />
            Cadastrar organização
          </Link>
        </Button>
      </section>

      <OrganizationListTable
        error={query.error instanceof Error ? query.error : null}
        isLoading={query.isLoading}
        onRetry={() => void query.refetch()}
        organizations={data.data}
        pagination={data.pagination}
      />
    </div>
  );
}

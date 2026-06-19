"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { OrganizationListTable } from "./components/organization-list-table";
import { useDeleteOrganization, useOrganizations } from "./queries/use-organizations";
import type { Organization } from "./types";

export default function MasterOrganizationsPage() {
  const query = useOrganizations();
  const deleteMutation = useDeleteOrganization();
  const { toast } = useToast();
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null);

  const organizations = query.data?.data ?? [];

  function requestDelete(organization: Organization) {
    deleteMutation.reset();
    setOrganizationToDelete(organization);
  }

  function cancelDelete() {
    if (deleteMutation.isPending) return;
    deleteMutation.reset();
    setOrganizationToDelete(null);
  }

  function confirmDelete() {
    if (!organizationToDelete) return;
    const { tradeName } = organizationToDelete;

    deleteMutation.mutate(organizationToDelete.id, {
      onSuccess: () => {
        setOrganizationToDelete(null);
        toast({
          variant: "success",
          title: "Organização excluída",
          description: `${tradeName} foi removida com sucesso.`,
        });
      },
    });
  }

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
        onDelete={requestDelete}
        onRetry={() => void query.refetch()}
        organizations={organizations}
      />

      <ConfirmDialog
        open={organizationToDelete !== null}
        title="Excluir organização"
        description={
          organizationToDelete ? (
            <>
              Tem certeza que deseja excluir a organização <strong>{organizationToDelete.tradeName}</strong>? Esta ação
              não pode ser desfeita.
            </>
          ) : null
        }
        confirmLabel="Excluir"
        confirmVariant="danger"
        pending={deleteMutation.isPending}
        pendingLabel="Excluindo..."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useOrganization } from "../queries/use-organizations";
import { AdminInvitePanel } from "./admin-invite-panel";

type OrganizationAdminViewProps = {
  organizationId: string;
  masterUserId: string;
};

export function OrganizationAdminView({
  organizationId,
  masterUserId,
}: OrganizationAdminViewProps) {
  const organizationQuery = useOrganization(organizationId);
  const organization = organizationQuery.data;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">
            Housekeeping Master
          </p>
          <h2 className="mt-1 font-heading text-2xl text-[var(--text-primary)]">
            Administrador master
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            Convide o administrador master{organization ? ` de ${organization.tradeName}` : ""}. Ele
            recebe acesso total ao painel da organização, incluindo a gestão de permissões.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/backoffice/organizations">
            <Icon name="arrow-left" size={18} />
            Voltar para listagem
          </Link>
        </Button>
      </section>

      <AdminInvitePanel organizationId={organizationId} masterUserId={masterUserId} />
    </div>
  );
}

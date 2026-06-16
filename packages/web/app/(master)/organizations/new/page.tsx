"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { OrganizationRegistrationForm } from "../components/organization-registration-form";
import { organizationsQueryKey } from "../queries/use-organizations";
import { useSubscriptionPlans } from "../queries/use-subscription-plans";

export default function NewOrganizationPage() {
  const queryClient = useQueryClient();
  const plansQuery = useSubscriptionPlans();

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">Housekeeping Master</p>
          <h2 className="mt-1 font-heading text-2xl text-[var(--text-primary)]">Nova organização</h2>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            Registre uma associação legalizada com dados empresariais, endereço e plano inicial.
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/organizations">
            <Icon name="arrow-left" size={18} />
            Voltar para listagem
          </Link>
        </Button>
      </section>
      <OrganizationRegistrationForm
        availablePlans={plansQuery.data?.data ?? []}
        isLoadingPlans={plansQuery.isLoading}
        onCreated={() => {
          void queryClient.invalidateQueries({ queryKey: organizationsQueryKey({ page: 1, perPage: 20 }) });
        }}
        plansError={plansQuery.error instanceof Error ? plansQuery.error : null}
      />
    </div>
  );
}

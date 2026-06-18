"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { ApiRequestError } from "@/lib/http";
import { OrganizationRegistrationForm } from "../components/organization-registration-form";
import { useCreateOrganization } from "../queries/use-organizations";
import { useSubscriptionPlans } from "../queries/use-subscription-plans";
import type { OrganizationWriteBody } from "../types";

function describeSaveError(error: unknown): string {
  if (error instanceof ApiRequestError && (error.status === 400 || error.status === 422)) {
    return "Verifique os dados do formulário e tente novamente.";
  }

  return "Não foi possível cadastrar a organização. Tente novamente.";
}

export default function NewOrganizationPage() {
  const router = useRouter();
  const plansQuery = useSubscriptionPlans();
  const createMutation = useCreateOrganization();
  const { toast } = useToast();

  function handleSubmit(body: OrganizationWriteBody) {
    createMutation.mutate(body, {
      onSuccess: (organization) => {
        toast({
          variant: "success",
          title: "Organização cadastrada",
          description: `${organization.tradeName} foi criada com sucesso.`,
        });
        router.push("/organizations");
      },
      onError: (error) => {
        toast({ variant: "error", title: "Erro ao cadastrar", description: describeSaveError(error) });
      },
    });
  }

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
        errorMessage={createMutation.isError ? describeSaveError(createMutation.error) : undefined}
        isLoadingPlans={plansQuery.isLoading}
        onSubmit={handleSubmit}
        pending={createMutation.isPending}
        plansError={plansQuery.error instanceof Error ? plansQuery.error : null}
      />
    </div>
  );
}

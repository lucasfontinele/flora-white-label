"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { OrganizationRegistrationForm } from "../../components/organization-registration-form";
import { useOrganization, useUpdateOrganization } from "../../queries/use-organizations";
import { useSubscriptionPlans } from "../../queries/use-subscription-plans";
import type { OrganizationRegistrationFormValues } from "../../schemas/organization-registration-schema";
import type { Organization, OrganizationWriteBody } from "../../types";

function organizationToFormValues(organization: Organization): OrganizationRegistrationFormValues {
  return {
    organization: {
      legalName: organization.legalName,
      tradeName: organization.tradeName,
      cnpj: organization.cnpj,
      primaryCnae: organization.primaryCnae,
      secondaryCnaes: organization.secondaryCnaes,
    },
    address: {
      title: organization.address.title ?? "",
      zipcode: organization.address.zipcode,
      // The number lives inside `street` (the API has no dedicated column), so
      // it stays in the street field on edit and the number field starts empty.
      street: organization.address.street,
      number: "",
      complement: organization.address.complement ?? "",
      neighborhood: organization.address.neighborhood,
      city: organization.address.city,
      state: organization.address.state,
    },
    currentPlanId: organization.currentPlan.id,
  };
}

export default function EditOrganizationPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const organizationQuery = useOrganization(id);
  const plansQuery = useSubscriptionPlans();
  const updateMutation = useUpdateOrganization();
  const { toast } = useToast();

  const organization = organizationQuery.data;

  function handleSubmit(body: OrganizationWriteBody) {
    updateMutation.mutate(
      { id, body },
      {
        onSuccess: (updated) => {
          toast({
            variant: "success",
            title: "Organização atualizada",
            description: `${updated.tradeName} foi atualizada com sucesso.`,
          });
          router.push("/backoffice/organizations");
        },
      },
    );
  }

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">Housekeeping Master</p>
          <h2 className="mt-1 font-heading text-2xl text-[var(--text-primary)]">Editar organização</h2>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            Atualize os dados empresariais, endereço e plano da organização.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link href={`/backoffice/organizations/${id}/admin`}>
              <Icon name="shield-check" size={18} />
              Administrador master
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/backoffice/organizations">
              <Icon name="arrow-left" size={18} />
              Voltar para listagem
            </Link>
          </Button>
        </div>
      </section>

      {organizationQuery.isLoading ? (
        <Card>
          <CardContent className="flex flex-col gap-4 py-8">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3" />
          </CardContent>
        </Card>
      ) : organizationQuery.isError || !organization ? (
        <Card>
          <CardContent className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-lg text-[var(--text-primary)]">
                Não foi possível carregar a organização
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Atualize a página e tente novamente.</p>
            </div>
            <Button onClick={() => void organizationQuery.refetch()} type="button" variant="secondary">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <OrganizationRegistrationForm
          availablePlans={plansQuery.data?.data ?? []}
          initialValues={organizationToFormValues(organization)}
          isLoadingPlans={plansQuery.isLoading}
          onSubmit={handleSubmit}
          pending={updateMutation.isPending}
          plansError={plansQuery.error instanceof Error ? plansQuery.error : null}
          submitLabel="Salvar alterações"
          submittingLabel="Salvando..."
        />
      )}
    </div>
  );
}

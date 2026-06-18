"use client";

import { useState } from "react";
import { ApiRequestError } from "@/lib/http";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  useSubscriptionPlans,
  useUpdateSubscriptionPlan,
} from "../queries/use-subscription-plans";
import type { SubscriptionPlanPayload } from "../schemas/subscription-plan-schema";
import type { BackofficeSubscriptionPlan, SubscriptionPlanRecord } from "../types";
import { PlanForm, emptyPlanDraft, formatBRL, planRecordToDraft } from "./plan-form";

// Maps GET /backoffice/subscription-plans into the local card record.
function planToRecord(plan: BackofficeSubscriptionPlan): SubscriptionPlanRecord {
  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    priceInCents: plan.priceInCents,
    patientsLimit: plan.patientsLimit,
    operatorsLimit: plan.operatorsLimit,
    unlimitedOperators: plan.unlimitedOperators,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

function describeSaveError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 400 || error.status === 422) {
      return "Verifique os dados do formulário e tente novamente.";
    }
    if (error.status === 404) {
      return "Plano não encontrado. Atualize a página e tente novamente.";
    }
  }
  return "Não foi possível salvar o plano. Tente novamente.";
}

function describeDeleteError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 409) {
      return "Este plano está vinculado a organizações e não pode ser excluído.";
    }
    if (error.status === 404) {
      return "Plano não encontrado. Atualize a página e tente novamente.";
    }
  }
  return "Não foi possível excluir o plano. Tente novamente.";
}

type EditingState = { mode: "new" } | { mode: "edit"; id: string } | null;

export function PlansManager() {
  const plansQuery = useSubscriptionPlans();
  const createMutation = useCreateSubscriptionPlan();
  const updateMutation = useUpdateSubscriptionPlan();
  const deleteMutation = useDeleteSubscriptionPlan();
  const [editing, setEditing] = useState<EditingState>(null);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlanRecord | null>(null);

  const plans = (plansQuery.data?.data ?? []).map(planToRecord);
  const editingRecord = editing?.mode === "edit" ? plans.find((plan) => plan.id === editing.id) : undefined;

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const saveError = createMutation.error ?? updateMutation.error;

  function openForm(state: NonNullable<EditingState>) {
    createMutation.reset();
    updateMutation.reset();
    setEditing(state);
  }

  function closeForm() {
    createMutation.reset();
    updateMutation.reset();
    setEditing(null);
  }

  function handleSubmit(payload: SubscriptionPlanPayload) {
    if (editing?.mode === "edit") {
      updateMutation.mutate({ id: editing.id, payload }, { onSuccess: () => setEditing(null) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => setEditing(null) });
    }
  }

  function requestDelete(plan: SubscriptionPlanRecord) {
    deleteMutation.reset();
    setPlanToDelete(plan);
  }

  function cancelDelete() {
    if (deleteMutation.isPending) return;
    deleteMutation.reset();
    setPlanToDelete(null);
  }

  function confirmDelete() {
    if (!planToDelete) return;
    const { id } = planToDelete;

    deleteMutation.mutate(id, {
      onSuccess: () => {
        setPlanToDelete(null);
        setEditing((current) => (current?.mode === "edit" && current.id === id ? null : current));
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">Housekeeping Master</p>
          <h2 className="mt-1 font-heading text-2xl text-[var(--text-primary)]">Planos e configuração</h2>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            Gerencie os planos de assinatura oferecidos às organizações: preço, limites de operadores e de usuários ativos.
          </p>
        </div>
        <Button type="button" onClick={() => openForm({ mode: "new" })}>
          <Icon name="plus" size={18} />
          Novo plano
        </Button>
      </section>

      {editing ? (
        <PlanForm
          key={editing.mode === "edit" ? editing.id : "new"}
          title={editing.mode === "edit" ? "Editar plano" : "Novo plano"}
          submitLabel={editing.mode === "edit" ? "Salvar alterações" : "Criar plano"}
          initialDraft={editingRecord ? planRecordToDraft(editingRecord) : emptyPlanDraft()}
          pending={isSaving}
          errorMessage={saveError ? describeSaveError(saveError) : undefined}
          onCancel={closeForm}
          onSubmit={handleSubmit}
        />
      ) : null}

      {plansQuery.isLoading ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <PlanCardSkeleton key={index} />
          ))}
        </section>
      ) : plansQuery.isError ? (
        <Card>
          <CardContent className="py-10">
            <h2 className="font-heading text-lg text-[var(--text-primary)]">Não foi possível carregar os planos</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Atualize a página e tente novamente.</p>
          </CardContent>
        </Card>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <h2 className="font-heading text-lg text-[var(--text-primary)]">Nenhum plano cadastrado</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Crie o primeiro plano de assinatura da plataforma.</p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={() => openForm({ mode: "edit", id: plan.id })}
              onDelete={() => requestDelete(plan)}
            />
          ))}
        </section>
      )}

      <ConfirmDialog
        open={planToDelete !== null}
        title="Excluir plano"
        description={
          planToDelete ? (
            <>
              Tem certeza que deseja excluir o plano <strong>{planToDelete.title}</strong>? Esta ação não pode ser
              desfeita.
            </>
          ) : null
        }
        confirmLabel="Excluir"
        confirmVariant="danger"
        pending={deleteMutation.isPending}
        pendingLabel="Excluindo..."
        errorMessage={deleteMutation.isError ? describeDeleteError(deleteMutation.error) : undefined}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}

function PlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: SubscriptionPlanRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-col gap-y-2">
          <div className="flex items-center gap-x-2">
            <p className="truncate font-heading text-lg text-[var(--text-primary)]">{plan.title}</p>

            {plan.unlimitedOperators ? (
              <Badge tone="success" size="sm" dot>
                Ilimitado
              </Badge>
            ) : (
              <Badge tone="neutral" size="sm" dot>
                Limitado
              </Badge>
            )}
          </div>
          {plan.description ? (
            <p className="text-[var(--text-secondary)] text-sm">{plan.description}</p>
          ) : null}
        </div>
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-[var(--green-700)]">
          <Icon name="credit-card" size={20} />
        </span>
      </div>

      <div>
        <p className="text-3xl font-extrabold leading-none text-[var(--text-primary)]">{formatBRL(plan.priceInCents)}</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">por mês</p>
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-secondary)]">Operadores</dt>
          <dd className="font-semibold text-[var(--text-primary)]">
            {plan.unlimitedOperators ? "Ilimitado" : plan.operatorsLimit.toLocaleString("pt-BR")}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-secondary)]">Usuários ativos</dt>
          <dd className="font-semibold text-[var(--text-primary)]">{plan.patientsLimit.toLocaleString("pt-BR")}</dd>
        </div>
      </dl>

      <div className="mt-auto flex gap-2 border-t border-border pt-4">
        <Button type="button" variant="secondary" size="sm" fullWidth onClick={onEdit}>
          Editar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDelete} aria-label={`Excluir plano ${plan.title}`}>
          Excluir
        </Button>
      </div>
    </Card>
  );
}

function PlanCardSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5" aria-busy="true">
      <div className="flex items-start justify-between gap-3">
        <div className="flex w-full flex-col gap-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-11 w-11 shrink-0" />
      </div>

      <Skeleton className="h-8 w-1/2" />

      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>

      <div className="mt-auto flex gap-2 border-t border-border pt-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-20" />
      </div>
    </Card>
  );
}

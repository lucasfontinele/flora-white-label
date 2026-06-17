"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { SubscriptionPlanPayload } from "../schemas/subscription-plan-schema";
import type { SubscriptionPlanRecord } from "../types";
import { PlanForm, emptyPlanDraft, formatBRL, planRecordToDraft } from "./plan-form";

// Seed = the platform default plans from the SubscriptionPlan domain
// (specs/001-organization-registration/data-model.md). Front-end prototype only:
// changes live in component state. Replace with a real CRUD API when wiring the backend.
const seedPlans: SubscriptionPlanRecord[] = [
  {
    id: "plan_starter",
    code: "starter",
    name: "Starter",
    priceInCents: 59700,
    operatorLimitType: "limited",
    maxOperators: 10,
    maxActiveUsers: 50,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "plan_growth",
    code: "growth",
    name: "Growth",
    priceInCents: 99700,
    operatorLimitType: "limited",
    maxOperators: 30,
    maxActiveUsers: 100,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "plan_unlimited",
    code: "unlimited",
    name: "Unlimited",
    priceInCents: 209700,
    operatorLimitType: "unlimited",
    maxOperators: null,
    maxActiveUsers: 3000,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-01-10T00:00:00.000Z",
  },
];

type EditingState = { mode: "new" } | { mode: "edit"; id: string } | null;

export function PlansManager() {
  const [plans, setPlans] = useState<SubscriptionPlanRecord[]>(seedPlans);
  const [editing, setEditing] = useState<EditingState>(null);

  const editingRecord = editing?.mode === "edit" ? plans.find((plan) => plan.id === editing.id) : undefined;

  function handleSubmit(payload: SubscriptionPlanPayload) {
    const now = new Date().toISOString();

    if (editing?.mode === "edit") {
      setPlans((current) =>
        current.map((plan) => (plan.id === editing.id ? { ...plan, ...payload, updatedAt: now } : plan)),
      );
    } else {
      setPlans((current) => [
        ...current,
        { id: `plan_${payload.code}_${Date.now()}`, ...payload, createdAt: now, updatedAt: now },
      ]);
    }

    setEditing(null);
  }

  function handleDelete(id: string) {
    setPlans((current) => current.filter((plan) => plan.id !== id));
    setEditing((current) => (current?.mode === "edit" && current.id === id ? null : current));
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
        <Button type="button" onClick={() => setEditing({ mode: "new" })}>
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
          onCancel={() => setEditing(null)}
          onSubmit={handleSubmit}
        />
      ) : null}

      {plans.length === 0 ? (
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
              onEdit={() => setEditing({ mode: "edit", id: plan.id })}
              onDelete={() => handleDelete(plan.id)}
            />
          ))}
        </section>
      )}
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
        <div className="min-w-0">
          <p className="truncate font-heading text-lg text-[var(--text-primary)]">{plan.name}</p>
          <Badge tone="neutral" size="sm" className="mt-1 font-mono">
            {plan.code}
          </Badge>
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
            {plan.operatorLimitType === "unlimited" ? "Ilimitado" : `${plan.maxOperators ?? 0}`}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[var(--text-secondary)]">Usuários ativos</dt>
          <dd className="font-semibold text-[var(--text-primary)]">{plan.maxActiveUsers.toLocaleString("pt-BR")}</dd>
        </div>
      </dl>

      <div className="mt-auto flex gap-2 border-t border-border pt-4">
        <Button type="button" variant="secondary" size="sm" fullWidth onClick={onEdit}>
          Editar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDelete} aria-label={`Excluir plano ${plan.name}`}>
          Excluir
        </Button>
      </div>
    </Card>
  );
}

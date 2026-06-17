"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { operatorLimitTypes, subscriptionPlanSchema, type SubscriptionPlanPayload } from "../schemas/subscription-plan-schema";
import type { PlanFormDraft, SubscriptionPlanRecord } from "../types";

export function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", { currency: "BRL", style: "currency" }).format(cents / 100);
}

function parseCentsFromInput(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits === "" ? 0 : Number(digits);
}

export function emptyPlanDraft(): PlanFormDraft {
  return {
    name: "",
    code: "",
    priceInCents: 0,
    operatorLimitType: "limited",
    maxActiveUsers: "",
    maxOperators: "",
  };
}

export function planRecordToDraft(record: SubscriptionPlanRecord): PlanFormDraft {
  return {
    name: record.name,
    code: record.code,
    priceInCents: record.priceInCents,
    operatorLimitType: record.operatorLimitType,
    maxActiveUsers: String(record.maxActiveUsers),
    maxOperators: record.maxOperators == null ? "" : String(record.maxOperators),
  };
}

type PlanFormProps = {
  title: string;
  submitLabel: string;
  initialDraft: PlanFormDraft;
  onCancel: () => void;
  onSubmit: (payload: SubscriptionPlanPayload) => void;
};

const operatorLimitLabels: Record<(typeof operatorLimitTypes)[number], string> = {
  limited: "Limitado",
  unlimited: "Ilimitado",
};

export function PlanForm({ title, submitLabel, initialDraft, onCancel, onSubmit }: PlanFormProps) {
  const [draft, setDraft] = useState<PlanFormDraft>(initialDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fieldId = useId();
  const isUnlimited = draft.operatorLimitType === "unlimited";

  function update<Key extends keyof PlanFormDraft>(key: Key, value: PlanFormDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const result = subscriptionPlanSchema.safeParse({
      name: draft.name,
      code: draft.code,
      priceInCents: draft.priceInCents,
      operatorLimitType: draft.operatorLimitType,
      maxActiveUsers: draft.maxActiveUsers,
      maxOperators: isUnlimited ? undefined : draft.maxOperators,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  }

  return (
    <Card className="p-5 md:p-6">
      <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
        <div>
          <h2 className="font-heading text-lg text-[var(--text-primary)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Dados de referência da plataforma usados na contratação das organizações.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field error={errors.name} htmlFor={`${fieldId}-name`} label="Nome do plano">
            <Input
              id={`${fieldId}-name`}
              placeholder="Ex.: Starter"
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </Field>

          <Field
            error={errors.code}
            hint="Identificador estável e único (slug). Ex.: starter, growth."
            htmlFor={`${fieldId}-code`}
            label="Código"
          >
            <Input
              id={`${fieldId}-code`}
              placeholder="Ex.: starter"
              value={draft.code}
              onChange={(event) => update("code", event.target.value)}
            />
          </Field>

          <Field error={errors.priceInCents} hint="Cobrança mensal recorrente." htmlFor={`${fieldId}-price`} label="Preço mensal">
            <Input
              id={`${fieldId}-price`}
              inputMode="numeric"
              value={formatBRL(draft.priceInCents)}
              onChange={(event) => update("priceInCents", parseCentsFromInput(event.target.value))}
            />
          </Field>

          <Field
            error={errors.maxActiveUsers}
            hint="Total de usuários ativos permitidos na organização."
            htmlFor={`${fieldId}-users`}
            label="Máximo de usuários ativos"
          >
            <Input
              id={`${fieldId}-users`}
              inputMode="numeric"
              placeholder="Ex.: 50"
              value={draft.maxActiveUsers}
              onChange={(event) => update("maxActiveUsers", event.target.value)}
            />
          </Field>

          <Field error={errors.operatorLimitType} label="Limite de operadores">
            <div className="inline-flex rounded-md border border-input bg-card p-1">
              {operatorLimitTypes.map((type) => {
                const active = draft.operatorLimitType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => update("operatorLimitType", type)}
                    className={cn(
                      "rounded-sm px-4 py-2 text-sm font-semibold transition-colors",
                      active
                        ? "bg-primary-subtle text-[var(--green-700)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                    )}
                  >
                    {operatorLimitLabels[type]}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field
            error={errors.maxOperators}
            hint={isUnlimited ? "Não se aplica a planos ilimitados." : "Número máximo de operadores."}
            htmlFor={`${fieldId}-operators`}
            label="Máximo de operadores"
          >
            <Input
              id={`${fieldId}-operators`}
              disabled={isUnlimited}
              inputMode="numeric"
              placeholder={isUnlimited ? "Ilimitado" : "Ex.: 10"}
              value={isUnlimited ? "" : draft.maxOperators}
              onChange={(event) => update("maxOperators", event.target.value)}
            />
          </Field>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Card>
  );
}

function Field({
  children,
  error,
  hint,
  htmlFor,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  hint?: string;
  htmlFor?: string;
  label: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-[var(--error-600)]">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-[var(--text-tertiary)]">{hint}</span>
      ) : null}
    </div>
  );
}

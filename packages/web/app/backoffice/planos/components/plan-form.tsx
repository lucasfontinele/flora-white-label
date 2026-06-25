"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { subscriptionPlanSchema, type SubscriptionPlanPayload } from "../schemas/subscription-plan-schema";
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
    title: "",
    description: "",
    priceInCents: 0,
    patientsLimit: "",
    unlimitedOperators: false,
    operatorsLimit: "",
  };
}

export function planRecordToDraft(record: SubscriptionPlanRecord): PlanFormDraft {
  return {
    title: record.title,
    description: record.description ?? "",
    priceInCents: record.priceInCents,
    patientsLimit: String(record.patientsLimit),
    unlimitedOperators: record.unlimitedOperators,
    operatorsLimit: record.unlimitedOperators ? "" : String(record.operatorsLimit),
  };
}

type PlanFormProps = {
  title: string;
  submitLabel: string;
  initialDraft: PlanFormDraft;
  pending?: boolean;
  errorMessage?: string;
  onCancel: () => void;
  onSubmit: (payload: SubscriptionPlanPayload) => void;
};

const operatorLimitOptions = [
  { value: false, label: "Limitado" },
  { value: true, label: "Ilimitado" },
] as const;

export function PlanForm({
  title,
  submitLabel,
  initialDraft,
  pending = false,
  errorMessage,
  onCancel,
  onSubmit,
}: PlanFormProps) {
  const [draft, setDraft] = useState<PlanFormDraft>(initialDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fieldId = useId();
  const isUnlimited = draft.unlimitedOperators;

  function update<Key extends keyof PlanFormDraft>(key: Key, value: PlanFormDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const result = subscriptionPlanSchema.safeParse({
      title: draft.title,
      description: draft.description,
      priceInCents: draft.priceInCents,
      patientsLimit: draft.patientsLimit,
      unlimitedOperators: draft.unlimitedOperators,
      operatorsLimit: isUnlimited ? undefined : draft.operatorsLimit,
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
          <Field error={errors.title} htmlFor={`${fieldId}-title`} label="Nome do plano">
            <Input
              id={`${fieldId}-title`}
              placeholder="Ex.: Starter"
              value={draft.title}
              onChange={(event) => update("title", event.target.value)}
            />
          </Field>

          <Field
            error={errors.description}
            hint="Texto exibido na Landing Page (opcional)."
            htmlFor={`${fieldId}-description`}
            label="Descrição"
          >
            <Input
              id={`${fieldId}-description`}
              placeholder="Ex.: Plano ideal para associações iniciantes."
              value={draft.description}
              onChange={(event) => update("description", event.target.value)}
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
            error={errors.patientsLimit}
            hint="Total de usuários ativos permitidos na organização."
            htmlFor={`${fieldId}-users`}
            label="Máximo de usuários ativos"
          >
            <Input
              id={`${fieldId}-users`}
              inputMode="numeric"
              placeholder="Ex.: 50"
              value={draft.patientsLimit}
              onChange={(event) => update("patientsLimit", event.target.value)}
            />
          </Field>

          <Field label="Limite de operadores">
            <div className="inline-flex rounded-md border border-input bg-card p-1">
              {operatorLimitOptions.map((option) => {
                const active = draft.unlimitedOperators === option.value;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => update("unlimitedOperators", option.value)}
                    className={cn(
                      "rounded-sm px-4 py-2 text-sm font-semibold transition-colors",
                      active
                        ? "bg-primary-subtle text-[var(--green-700)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field
            error={errors.operatorsLimit}
            hint={isUnlimited ? "Não se aplica a planos ilimitados." : "Número máximo de operadores."}
            htmlFor={`${fieldId}-operators`}
            label="Máximo de operadores"
          >
            <Input
              id={`${fieldId}-operators`}
              disabled={isUnlimited}
              inputMode="numeric"
              placeholder={isUnlimited ? "Ilimitado" : "Ex.: 10"}
              value={isUnlimited ? "" : draft.operatorsLimit}
              onChange={(event) => update("operatorsLimit", event.target.value)}
            />
          </Field>
        </div>

        {errorMessage ? (
          <p className="text-sm text-[var(--error-600)]" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" disabled={pending} onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : submitLabel}
          </Button>
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

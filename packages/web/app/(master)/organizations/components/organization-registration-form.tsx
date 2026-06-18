"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useRef, useState } from "react";
import { useForm, type FieldPath, type UseFormRegister, type UseFormSetValue } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { ApiRequestError } from "@/lib/http";
import { formatCep, formatCnae, formatCnpj, formatUf, isValidCnae, normalizeCnae, onlyDigits } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { lookupAddressByZipcode } from "../requests/lookup-address";
import {
  organizationRegistrationDefaultValues,
  organizationRegistrationSchema,
  organizationRegistrationStepFields,
  toOrganizationWriteBody,
  type OrganizationRegistrationFormValues,
  type OrganizationRegistrationSchema,
} from "../schemas/organization-registration-schema";
import type { OrganizationWriteBody, SubscriptionPlan } from "../types";

type OrganizationRegistrationFormProps = {
  availablePlans?: SubscriptionPlan[];
  isLoadingPlans?: boolean;
  plansError?: Error | null;
  initialValues?: OrganizationRegistrationFormValues;
  submitLabel?: string;
  submittingLabel?: string;
  pending?: boolean;
  errorMessage?: string;
  onSubmit: (body: OrganizationWriteBody) => void | Promise<void>;
};

type StepKey = "organization" | "address" | "plan" | "review";

type RegistrationStep = {
  description: string;
  fields: FieldPath<OrganizationRegistrationFormValues>[];
  key: StepKey;
  title: string;
};

const steps: RegistrationStep[] = [
  {
    key: "organization",
    title: "Dados da empresa",
    description: "Identificação legal e institucional da associação.",
    fields: [...organizationRegistrationStepFields.organization],
  },
  {
    key: "address",
    title: "Endereço",
    description: "Localização principal vinculada à organização.",
    fields: [...organizationRegistrationStepFields.address],
  },
  {
    key: "plan",
    title: "Plano",
    description: "Assinatura inicial usada para limites da organização.",
    fields: [...organizationRegistrationStepFields.plan],
  },
  {
    key: "review",
    title: "Revisão",
    description: "Confirme os dados antes de salvar a organização.",
    fields: [],
  },
];

export function OrganizationRegistrationForm({
  availablePlans = [],
  isLoadingPlans = false,
  plansError = null,
  initialValues,
  submitLabel = "Cadastrar organização",
  submittingLabel = "Cadastrando...",
  pending = false,
  errorMessage,
  onSubmit,
}: OrganizationRegistrationFormProps) {
  const [step, setStep] = useState(0);
  const [secondaryCnaeDraft, setSecondaryCnaeDraft] = useState("");
  const [secondaryCnaeError, setSecondaryCnaeError] = useState<string | null>(null);
  const [zipcodeStatus, setZipcodeStatus] = useState<"idle" | "loading" | "notFound" | "error">("idle");
  const lastRequestedZipcode = useRef<string | null>(null);
  const currentStep = steps[step] as RegistrationStep;
  const isFirstStep = step === 0;
  const isReviewStep = currentStep.key === "review";
  const progress = useMemo(() => `Etapa ${step + 1} de ${steps.length}`, [step]);

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    trigger,
    watch,
  } = useForm<OrganizationRegistrationFormValues, unknown, OrganizationRegistrationSchema>({
    defaultValues: initialValues ?? organizationRegistrationDefaultValues,
    mode: "onBlur",
    resolver: zodResolver(organizationRegistrationSchema),
  });

  const values = watch();
  const secondaryCnaes = values.organization.secondaryCnaes ?? [];
  const selectedPlan = availablePlans.find((plan) => plan.id === values.currentPlanId);

  async function goNext() {
    if (currentStep.key === "organization" && secondaryCnaeDraft.trim() && !addSecondaryCnae(secondaryCnaeDraft)) {
      return;
    }

    const valid = currentStep.fields.length === 0 ? true : await trigger(currentStep.fields);

    if (!valid) return;

    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submit(data: OrganizationRegistrationSchema) {
    await onSubmit(toOrganizationWriteBody(data));
  }

  function addSecondaryCnae(rawValue = secondaryCnaeDraft) {
    const candidates = rawValue
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (candidates.length === 0) {
      setSecondaryCnaeError("Digite um CNAE para adicionar.");
      return false;
    }

    const next = [...secondaryCnaes];

    for (const candidate of candidates) {
      if (!isValidCnae(candidate)) {
        setSecondaryCnaeError("Informe um CNAE válido.");
        return false;
      }

      const normalized = normalizeCnae(candidate);

      if (next.includes(normalized)) {
        setSecondaryCnaeError("Este CNAE já foi adicionado.");
        return false;
      }

      next.push(normalized);
    }

    setValue("organization.secondaryCnaes", next, { shouldDirty: true, shouldValidate: true });
    setSecondaryCnaeDraft("");
    setSecondaryCnaeError(null);
    return true;
  }

  function removeSecondaryCnae(value: string) {
    setValue(
      "organization.secondaryCnaes",
      secondaryCnaes.filter((item) => item !== value),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  // Auto-fills the address once a complete CEP is typed, querying the API (which
  // chains ViaCEP → BrasilAPI). Failures degrade gracefully: the user can still
  // fill the address by hand. Provider-empty fields (e.g. a city-wide CEP with
  // no street) are left untouched so we never erase what the user typed.
  async function lookupZipcode(digits: string) {
    if (lastRequestedZipcode.current === digits) return;
    lastRequestedZipcode.current = digits;
    setZipcodeStatus("loading");

    try {
      const address = await lookupAddressByZipcode(digits);

      if (address.street) setValue("address.street", address.street, { shouldValidate: true });
      if (address.neighborhood) setValue("address.neighborhood", address.neighborhood, { shouldValidate: true });
      if (address.city) setValue("address.city", address.city, { shouldValidate: true });
      if (address.state) setValue("address.state", address.state, { shouldValidate: true });
      if (address.complement) setValue("address.complement", address.complement, { shouldValidate: false });

      setZipcodeStatus("idle");
    } catch (error) {
      // Allow a retry on the same CEP after a transient failure.
      lastRequestedZipcode.current = null;
      setZipcodeStatus(error instanceof ApiRequestError && error.status === 404 ? "notFound" : "error");
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)}>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-[var(--text-secondary)]">{progress}</span>
        <h2 className="font-heading text-2xl text-[var(--text-primary)]">{currentStep.title}</h2>
        <p className="text-sm text-[var(--text-secondary)]">{currentStep.description}</p>
      </div>

      {currentStep.key === "organization" ? (
        <Card>
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              error={errors.organization?.legalName}
              label="Razão social"
              name="organization.legalName"
              register={register}
            />
            <FormField
              error={errors.organization?.tradeName}
              label="Nome fantasia"
              name="organization.tradeName"
              register={register}
            />
            <FormField
              error={errors.organization?.cnpj}
              label="CNPJ"
              mask={formatCnpj}
              name="organization.cnpj"
              register={register}
              setValue={setValue}
            />
            <FormField
              error={errors.organization?.primaryCnae}
              label="CNAE principal"
              mask={formatCnae}
              name="organization.primaryCnae"
              placeholder="0000-0/00"
              register={register}
              setValue={setValue}
            />
            <div className="md:col-span-2">
              <label
                className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
                htmlFor="organization-secondary-cnaes"
              >
                CNAEs secundários
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    id="organization-secondary-cnaes"
                    onChange={(event) => {
                      const value = event.target.value;

                      if (value.includes(",")) {
                        addSecondaryCnae(value);
                        return;
                      }

                      setSecondaryCnaeDraft(formatCnae(value));
                      setSecondaryCnaeError(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        addSecondaryCnae();
                      }
                    }}
                    placeholder="0000-0/00"
                    value={secondaryCnaeDraft}
                  />
                  <Button
                    aria-label="Adicionar CNAE secundário"
                    onClick={() => addSecondaryCnae()}
                    size="icon"
                    type="button"
                    variant="secondary"
                  >
                    <Icon name="plus" size={18} />
                  </Button>
                </div>
                {secondaryCnaes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {secondaryCnaes.map((cnae) => (
                      <span
                        className="inline-flex min-h-8 items-center gap-2 rounded-pill border border-border bg-muted px-3 text-xs font-semibold text-[var(--text-primary)]"
                        key={cnae}
                      >
                        {formatCnae(cnae)}
                        <button
                          aria-label={`Remover CNAE ${formatCnae(cnae)}`}
                          className="inline-flex text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                          onClick={() => removeSecondaryCnae(cnae)}
                          type="button"
                        >
                          <Icon name="x" size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              {secondaryCnaeError || getFieldErrorMessage(errors.organization?.secondaryCnaes) ? (
                <span className="mt-1 block text-xs text-[var(--error-600)]">
                  {secondaryCnaeError ?? getFieldErrorMessage(errors.organization?.secondaryCnaes)}
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {currentStep.key === "address" ? (
        <Card>
          <CardHeader>
            <CardTitle>Localização</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <FormField
              className="md:col-span-3"
              error={errors.address?.title}
              label="Título do endereço (opcional)"
              name="address.title"
              placeholder="Sede, Filial..."
              register={register}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]" htmlFor="address-zipcode">
                CEP
              </label>
              <Input
                aria-invalid={Boolean(errors.address?.zipcode)}
                id="address-zipcode"
                inputMode="numeric"
                placeholder="00000-000"
                {...register("address.zipcode", {
                  onChange: (event) => {
                    const masked = formatCep(event.target.value);
                    setValue("address.zipcode", masked, { shouldValidate: false });

                    const digits = onlyDigits(masked);
                    if (digits.length === 8) {
                      void lookupZipcode(digits);
                    } else {
                      setZipcodeStatus("idle");
                      lastRequestedZipcode.current = null;
                    }
                  },
                })}
              />
              {errors.address?.zipcode ? (
                <span className="mt-1 block text-xs text-[var(--error-600)]">
                  {getFieldErrorMessage(errors.address?.zipcode)}
                </span>
              ) : zipcodeStatus === "loading" ? (
                <span className="mt-1 block text-xs text-[var(--text-secondary)]">Buscando endereço...</span>
              ) : zipcodeStatus === "notFound" ? (
                <span className="mt-1 block text-xs text-[var(--warning-600)]">
                  CEP não encontrado. Preencha o endereço manualmente.
                </span>
              ) : zipcodeStatus === "error" ? (
                <span className="mt-1 block text-xs text-[var(--warning-600)]">
                  Não foi possível buscar o CEP. Preencha manualmente.
                </span>
              ) : null}
            </div>
            <FormField
              className="md:col-span-2"
              error={errors.address?.street}
              label="Logradouro"
              name="address.street"
              register={register}
            />
            <FormField error={errors.address?.number} label="Número" name="address.number" register={register} />
            <FormField
              error={errors.address?.complement}
              label="Complemento"
              name="address.complement"
              register={register}
            />
            <FormField
              error={errors.address?.neighborhood}
              label="Bairro"
              name="address.neighborhood"
              register={register}
            />
            <FormField error={errors.address?.city} label="Cidade" name="address.city" register={register} />
            <FormField
              error={errors.address?.state}
              label="Estado"
              mask={formatUf}
              name="address.state"
              register={register}
              setValue={setValue}
            />
          </CardContent>
        </Card>
      ) : null}

      {currentStep.key === "plan" ? (
        <Card>
          <CardHeader>
            <CardTitle>Planos disponíveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingPlans ? <p className="text-sm text-[var(--text-secondary)]">Carregando planos...</p> : null}
            {plansError ? (
              <p className="text-sm text-[var(--error-600)]">Não foi possível carregar os planos.</p>
            ) : null}
            {!isLoadingPlans && !plansError && availablePlans.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)]">Nenhum plano disponível.</p>
            ) : null}
            <div className="grid gap-3 md:grid-cols-3">
              {availablePlans.map((plan) => {
                const isSelected = values.currentPlanId === plan.id;

                return (
                  <label
                    className={cn(
                      "flex cursor-pointer flex-col gap-3 rounded-md border p-4 transition-colors hover:border-primary",
                      isSelected ? "border-primary bg-primary-subtle shadow-primary" : "border-border",
                    )}
                    key={plan.id}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-heading text-lg text-[var(--text-primary)]">{plan.title}</span>
                      {isSelected ? (
                        <span className="shrink-0 text-[var(--green-700)]">
                          <Icon name="check-circle-2" size={20} />
                        </span>
                      ) : null}
                    </div>
                    <input className="sr-only" type="radio" value={plan.id} {...register("currentPlanId")} />
                    <span className="text-2xl font-semibold text-[var(--text-primary)]">
                      {formatCurrency(plan.priceInCents)}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)]">{formatPlanOperators(plan)}</span>
                    <span className="text-sm text-[var(--text-secondary)]">{plan.patientsLimit} usuários</span>
                  </label>
                );
              })}
            </div>
            {errors.currentPlanId?.message ? (
              <span className="block text-xs text-[var(--error-600)]">{errors.currentPlanId.message}</span>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {currentStep.key === "review" ? (
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-[var(--text-secondary)] md:grid-cols-2">
            <SummaryItem label="Organização" value={values.organization.tradeName || values.organization.legalName} />
            <SummaryItem label="CNPJ" value={formatCnpj(values.organization.cnpj)} />
            <SummaryItem label="CNAE principal" value={formatCnae(values.organization.primaryCnae)} />
            <SummaryItem
              label="CNAEs secundários"
              value={secondaryCnaes.map((cnae) => formatCnae(cnae)).join(", ")}
            />
            <SummaryItem label="Cidade/UF" value={`${values.address.city}/${values.address.state}`} />
            <SummaryItem label="Plano" value={selectedPlan?.title ?? values.currentPlanId} />
          </CardContent>
        </Card>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-[var(--error-600)]" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button disabled={isFirstStep || pending} onClick={goBack} type="button" variant="secondary">
          Voltar
        </Button>
        {isReviewStep ? (
          <Button disabled={pending} type="submit">
            {pending ? submittingLabel : submitLabel}
          </Button>
        ) : (
          <Button disabled={pending} onClick={goNext} type="button">
            Continuar
          </Button>
        )}
      </div>
    </form>
  );
}

function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(valueInCents / 100);
}

function formatPlanOperators(plan: SubscriptionPlan) {
  if (plan.unlimitedOperators) return "Operadores ilimitados";

  return `${plan.operatorsLimit} operadores`;
}

function FormField({
  className,
  error,
  label,
  mask,
  name,
  placeholder,
  register,
  setValue,
  type = "text",
}: {
  className?: string;
  error?: unknown;
  label: string;
  mask?: (value: string) => string;
  name: FieldPath<OrganizationRegistrationFormValues>;
  placeholder?: string;
  register: UseFormRegister<OrganizationRegistrationFormValues>;
  setValue?: UseFormSetValue<OrganizationRegistrationFormValues>;
  type?: string;
}) {
  const fieldId = name.replace(/\./g, "-");
  const errorMessage = getFieldErrorMessage(error);
  const field = register(name, {
    onChange: mask
      ? (event) => {
          setValue?.(name, mask(event.target.value) as never, { shouldValidate: false });
        }
      : undefined,
  });

  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]" htmlFor={fieldId}>
        {label}
      </label>
      <Input aria-invalid={Boolean(error)} id={fieldId} placeholder={placeholder} type={type} {...field} />
      {errorMessage ? <span className="mt-1 block text-xs text-[var(--error-600)]">{errorMessage}</span> : null}
    </div>
  );
}

function getFieldErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message?: unknown }).message ?? "");
  }

  return "";
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-xs font-semibold uppercase text-[var(--text-secondary)]">{label}</span>
      <span className="mt-1 block text-[var(--text-primary)]">{value || "-"}</span>
    </div>
  );
}

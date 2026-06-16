"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
  SubscriptionPlanDto,
} from "@flora/shared/organizations";
import { useMemo, useState } from "react";
import { useForm, type FieldPath, type UseFormRegister, type UseFormSetValue } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  formatBrazilianPhone,
  formatCep,
  formatCnae,
  formatCnpj,
  formatUf,
  isValidCnae,
  normalizeCnae,
} from "@/lib/masks";
import { createOrganization } from "../requests/create-organization";
import {
  organizationRegistrationDefaultValues,
  organizationRegistrationSchema,
  organizationRegistrationStepFields,
  type OrganizationRegistrationFormValues,
  type OrganizationRegistrationSchema,
} from "../schemas/organization-registration-schema";

type OrganizationRegistrationFormProps = {
  availablePlans?: SubscriptionPlanDto[];
  isLoadingPlans?: boolean;
  onCreate?: (input: CreateOrganizationRequest) => Promise<CreateOrganizationResponse>;
  onCreated?: () => void;
  plansError?: Error | null;
};

type StepKey = "company" | "address" | "plan" | "review";

type RegistrationStep = {
  description: string;
  fields: FieldPath<OrganizationRegistrationFormValues>[];
  key: StepKey;
  title: string;
};

const steps: RegistrationStep[] = [
  {
    key: "company",
    title: "Dados da empresa",
    description: "Identificação legal e institucional da associação.",
    fields: [...organizationRegistrationStepFields.company],
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
    description: "Confirme os dados antes de cadastrar a organização.",
    fields: [],
  },
];

export function OrganizationRegistrationForm({
  availablePlans = [],
  isLoadingPlans = false,
  onCreate = createOrganization,
  onCreated,
  plansError = null,
}: OrganizationRegistrationFormProps = {}) {
  const [step, setStep] = useState(0);
  const [secondaryCnaeDraft, setSecondaryCnaeDraft] = useState("");
  const [secondaryCnaeError, setSecondaryCnaeError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const currentStep = steps[step] as RegistrationStep;
  const isFirstStep = step === 0;
  const isReviewStep = currentStep.key === "review";
  const progress = useMemo(() => `Etapa ${step + 1} de ${steps.length}`, [step]);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    trigger,
    watch,
  } = useForm<OrganizationRegistrationFormValues, unknown, OrganizationRegistrationSchema>({
    defaultValues: organizationRegistrationDefaultValues,
    mode: "onBlur",
    resolver: zodResolver(organizationRegistrationSchema),
  });

  const values = watch();
  const secondaryCnaes = values.company.secondaryCnaes ?? [];
  const selectedPlan = availablePlans.find((plan) => plan.id === values.subscriptionPlanId);

  async function goNext() {
    setStatus(null);

    if (currentStep.key === "company" && secondaryCnaeDraft.trim() && !addSecondaryCnae(secondaryCnaeDraft)) {
      return;
    }

    const valid = currentStep.fields.length === 0 ? true : await trigger(currentStep.fields);

    if (!valid) return;

    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setStatus(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submit(data: OrganizationRegistrationSchema) {
    setStatus(null);

    try {
      const response = await onCreate(data);
      setSubmitted(true);
      setStatus(`Organização ${response.data.company.tradeName} cadastrada.`);
      onCreated?.();
      reset(organizationRegistrationDefaultValues);
      setSecondaryCnaeDraft("");
      setSecondaryCnaeError(null);
      setStep(0);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível cadastrar a organização.");
    }
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

    setValue("company.secondaryCnaes", next, { shouldDirty: true, shouldValidate: true });
    setSecondaryCnaeDraft("");
    setSecondaryCnaeError(null);
    return true;
  }

  function removeSecondaryCnae(value: string) {
    setValue(
      "company.secondaryCnaes",
      secondaryCnaes.filter((item) => item !== value),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)}>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-[var(--text-secondary)]">{progress}</span>
        <h2 className="font-heading text-2xl text-[var(--text-primary)]">{currentStep.title}</h2>
        <p className="text-sm text-[var(--text-secondary)]">{currentStep.description}</p>
      </div>

      {currentStep.key === "company" ? (
        <Card>
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              error={errors.company?.legalName}
              label="Razão social"
              name="company.legalName"
              register={register}
            />
            <FormField
              error={errors.company?.tradeName}
              label="Nome fantasia"
              name="company.tradeName"
              register={register}
            />
            <FormField
              error={errors.company?.cnpj}
              label="CNPJ"
              mask={formatCnpj}
              name="company.cnpj"
              register={register}
              setValue={setValue}
            />
            <FormField
              error={errors.company?.foundationDate}
              label="Data de fundação"
              name="company.foundationDate"
              register={register}
              type="date"
            />
            <FormField
              error={errors.company?.primaryCnae}
              label="CNAE principal"
              mask={formatCnae}
              name="company.primaryCnae"
              placeholder="0000-0/00"
              register={register}
              setValue={setValue}
            />
            <div className="md:col-span-2">
              <label
                className="mb-1 block text-sm font-medium text-[var(--text-secondary)]"
                htmlFor="company-secondary-cnaes"
              >
                CNAEs secundários
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    id="company-secondary-cnaes"
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
              {secondaryCnaeError || getFieldErrorMessage(errors.company?.secondaryCnaes) ? (
                <span className="mt-1 block text-xs text-[var(--error-600)]">
                  {secondaryCnaeError ?? getFieldErrorMessage(errors.company?.secondaryCnaes)}
                </span>
              ) : null}
            </div>
            <FormField
              error={errors.company?.institutionalEmail}
              label="E-mail institucional"
              name="company.institutionalEmail"
              register={register}
              type="email"
            />
            <FormField
              error={errors.company?.phone}
              label="Telefone"
              mask={formatBrazilianPhone}
              name="company.phone"
              register={register}
              setValue={setValue}
            />
            <FormField
              error={errors.company?.whatsapp}
              label="WhatsApp"
              mask={formatBrazilianPhone}
              name="company.whatsapp"
              register={register}
              setValue={setValue}
            />
            <FormField
              error={errors.company?.site}
              label="Site"
              name="company.site"
              placeholder="https://associacao.org.br"
              register={register}
              type="url"
            />
            <FormField
              error={errors.company?.instagram}
              label="Instagram"
              name="company.instagram"
              placeholder="https://instagram.com/associacao"
              register={register}
              type="url"
            />
            <FormField
              error={errors.company?.facebook}
              label="Facebook"
              name="company.facebook"
              placeholder="https://facebook.com/associacao"
              register={register}
              type="url"
            />
            <FormField
              error={errors.company?.linkedin}
              label="LinkedIn"
              name="company.linkedin"
              placeholder="https://linkedin.com/company/associacao"
              register={register}
              type="url"
            />
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
              error={errors.address?.cep}
              label="CEP"
              mask={formatCep}
              name="address.cep"
              register={register}
              setValue={setValue}
            />
            <FormField
              className="md:col-span-2"
              error={errors.address?.logradouro}
              label="Logradouro"
              name="address.logradouro"
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
              {availablePlans.map((plan) => (
                <label
                  className="flex cursor-pointer flex-col gap-3 rounded-md border border-border p-4 transition-colors hover:border-primary"
                  key={plan.id}
                >
                  <input className="sr-only" type="radio" value={plan.id} {...register("subscriptionPlanId")} />
                  <span className="font-heading text-lg text-[var(--text-primary)]">{plan.name}</span>
                  <span className="text-2xl font-semibold text-[var(--text-primary)]">
                    {formatCurrency(plan.priceInCents)}
                  </span>
                  <span className="text-sm text-[var(--text-secondary)]">{formatPlanOperators(plan)}</span>
                  <span className="text-sm text-[var(--text-secondary)]">{plan.maxActiveUsers} usuários</span>
                </label>
              ))}
            </div>
            {errors.subscriptionPlanId?.message ? (
              <span className="block text-xs text-[var(--error-600)]">{errors.subscriptionPlanId.message}</span>
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
            <SummaryItem label="Organização" value={values.company.tradeName || values.company.legalName} />
            <SummaryItem label="CNPJ" value={values.company.cnpj} />
            <SummaryItem label="CNAE principal" value={formatCnae(values.company.primaryCnae)} />
            <SummaryItem
              label="CNAEs secundários"
              value={secondaryCnaes.map((cnae) => formatCnae(cnae)).join(", ")}
            />
            <SummaryItem label="Cidade/UF" value={`${values.address.city}/${values.address.state}`} />
            <SummaryItem label="Plano" value={selectedPlan?.name ?? values.subscriptionPlanId} />
          </CardContent>
        </Card>
      ) : null}

      {status ? (
        <p className={submitted ? "text-sm text-[var(--success-600)]" : "text-sm text-[var(--text-secondary)]"}>
          {status}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button disabled={isFirstStep || isSubmitting} onClick={goBack} type="button" variant="secondary">
          Voltar
        </Button>
        {isReviewStep ? (
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Cadastrando..." : "Cadastrar organização"}
          </Button>
        ) : (
          <Button disabled={isSubmitting} onClick={goNext} type="button">
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

function formatPlanOperators(plan: SubscriptionPlanDto) {
  if (plan.operatorLimitType === "unlimited") return "Operadores ilimitados";

  return `${plan.maxOperators ?? 0} operadores`;
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

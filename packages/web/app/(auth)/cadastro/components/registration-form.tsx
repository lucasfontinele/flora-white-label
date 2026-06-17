"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreatePatientRegistrationRequest } from "@flora/shared/patients";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type FieldErrors, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createPatientRegistration } from "../requests/create-patient-registration";
import { getAddressByCep } from "../requests/get-address-by-cep";
import { registrationSchema, type RegistrationSchema } from "../schemas/registration-schema";
import { useRegistrationDraftStore } from "../stores/registration-draft-store";

type StepKind = "profile" | "personal" | "access" | "pet" | "contact" | "address" | "legalGuardian";

type RegistrationStep = {
  description: string;
  fields: Array<keyof RegistrationSchema>;
  kind: StepKind;
  title: string;
};

const profileStepFields: Array<keyof RegistrationSchema> = ["role"];
const personalStepFields: Array<keyof RegistrationSchema> = ["fullName", "cpf", "birthDate", "nickname", "gender"];
const accessStepFields: Array<keyof RegistrationSchema> = ["email", "password", "passwordConfirmation"];
const contactStepFields: Array<keyof RegistrationSchema> = ["phone"];
const addressStepFields: Array<keyof RegistrationSchema> = [
  "cep",
  "street",
  "number",
  "complement",
  "neighborhood",
  "state",
  "city",
];

const legalGuardianStepFields: Array<keyof RegistrationSchema> = [
  "guardianFullName",
  "guardianCpf",
  "guardianRg",
  "guardianRelationship",
  "guardianBirthDate",
  "guardianPhone",
  "guardianCep",
  "guardianStreet",
  "guardianNumber",
  "guardianComplement",
  "guardianNeighborhood",
  "guardianState",
  "guardianCity",
];

const petTutorStepFields: Array<keyof RegistrationSchema> = [
  "petName",
  "petSpecies",
  "petBreed",
  "petBirthDate",
  "petDiagnosis",
];

const accessStep: RegistrationStep = {
  kind: "access",
  title: "Acesso",
  description: "E-mail e senha que serão usados para entrar na plataforma.",
  fields: accessStepFields,
};

const patientSteps: RegistrationStep[] = [
  { kind: "profile", title: "Perfil", description: "Escolha como você participa do cuidado.", fields: profileStepFields },
  {
    kind: "personal",
    title: "Dados pessoais",
    description: "Identificação inicial do cadastro.",
    fields: personalStepFields,
  },
  accessStep,
  { kind: "contact", title: "Contato", description: "Canais usados pela associação.", fields: contactStepFields },
  {
    kind: "address",
    title: "Endereço",
    description: "Local vinculado ao dependente ou paciente.",
    fields: addressStepFields,
  },
];

const petTutorSteps: RegistrationStep[] = [
  patientSteps[0],
  {
    kind: "personal",
    title: "Dados do tutor",
    description: "Identificação inicial do tutor do PET.",
    fields: personalStepFields,
  },
  accessStep,
  {
    kind: "pet",
    title: "Dados do PET",
    description: "Identificação e contexto clínico inicial do animal.",
    fields: petTutorStepFields,
  },
  {
    kind: "contact",
    title: "Contato do tutor",
    description: "Canais usados pela associação.",
    fields: contactStepFields,
  },
  {
    kind: "address",
    title: "Endereço do tutor",
    description: "Residência vinculada ao tutor do PET.",
    fields: addressStepFields,
  },
];

const legalGuardianSteps: RegistrationStep[] = [
  ...patientSteps,
  {
    kind: "legalGuardian",
    title: "Responsável legal",
    description: "Identificação e endereço do responsável pelo dependente.",
    fields: legalGuardianStepFields,
  },
];

const roleOptions = [
  {
    value: "pet_tutor",
    label: "Sou tutor de PET",
    description: "Cadastro para tutor que acompanha tratamento veterinário.",
    icon: "shield-check",
  },
  {
    value: "legal_guardian",
    label: "Responsável legal",
    description: "Cadastro para responsável por um dependente.",
    icon: "users",
  },
  {
    value: "patient",
    label: "Paciente",
    description: "Cadastro para quem acompanha o próprio tratamento.",
    icon: "user",
  },
] as const;

const documentCards = [
  {
    title: "Documento de identidade",
    description: "RG, CNH ou documento oficial com foto.",
    icon: "id-card",
  },
  {
    title: "Comprovante de residência",
    description: "Conta recente ou documento aceito pela associação.",
    icon: "home",
  },
  {
    title: "Receita médica válida",
    description: "Receita dentro do prazo exigido para análise.",
    icon: "file-check",
  },
  {
    title: "CPF",
    description: "Número do CPF do paciente ou responsável.",
    icon: "clipboard-check",
  },
] as const;

const petSpeciesOptions = ["Canina", "Felina", "Equina", "Aviária", "Exótica", "Silvestre", "Outras"] as const;

type RegistrationFormData = z.infer<typeof registrationSchema>;

const defaultValues: RegistrationFormData = {
  role: "patient",
  fullName: "",
  cpf: "",
  birthDate: "",
  nickname: "",
  gender: "prefiro_nao_informar",
  email: "",
  password: "",
  passwordConfirmation: "",
  phone: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  state: "",
  city: "",
  guardianFullName: "",
  guardianCpf: "",
  guardianRg: "",
  guardianRelationship: "pai_mae",
  guardianBirthDate: "",
  guardianPhone: "",
  guardianCep: "",
  guardianStreet: "",
  guardianNumber: "",
  guardianComplement: "",
  guardianNeighborhood: "",
  guardianState: "",
  guardianCity: "",
  petName: "",
  petSpecies: "",
  petBreed: "",
  petBirthDate: "",
  petDiagnosis: "",
};

function getStepCountForRole(role: RegistrationFormData["role"]) {
  return getStepsForRole(role).length;
}

function getStepsForRole(role: RegistrationFormData["role"]) {
  if (role === "legal_guardian") return legalGuardianSteps;
  if (role === "pet_tutor") return petTutorSteps;

  return patientSteps;
}

export function RegistrationForm() {
  const [step, setStep] = useState(0);
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [guardianCepStatus, setGuardianCepStatus] = useState<"idle" | "loading" | "found" | "error">("idle");
  const [lastCepLookup, setLastCepLookup] = useState("");
  const [lastGuardianCepLookup, setLastGuardianCepLookup] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const draftAppliedRef = useRef(false);
  const clearDraft = useRegistrationDraftStore((state) => state.clearDraft);
  const hasHydrated = useRegistrationDraftStore((state) => state.hasHydrated);
  const patchDraft = useRegistrationDraftStore((state) => state.patchDraft);
  const persistedDraft = useRegistrationDraftStore((state) => state.draft);
  const persistedStep = useRegistrationDraftStore((state) => state.step);
  const persistStep = useRegistrationDraftStore((state) => state.setStep);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset: resetForm,
    setError,
    setValue,
    trigger,
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues,
    mode: "onBlur",
  });

  const role = watch("role");
  const fullName = watch("fullName");
  const cep = watch("cep");
  const guardianCep = watch("guardianCep");
  const steps = useMemo(() => getStepsForRole(role), [role]);
  const maxStep = steps.length - 1;
  const visibleStep = Math.min(step, maxStep);
  const currentStep = steps[visibleStep];
  const addressTitle =
    role === "patient" ? "Endereço do paciente" : role === "pet_tutor" ? "Endereço do tutor" : "Endereço do dependente";
  const progress = useMemo(() => `Etapa ${visibleStep + 1} de ${steps.length}`, [visibleStep, steps.length]);

  useEffect(() => {
    if (!hasHydrated || draftAppliedRef.current) return;

    const nextValues = {
      ...defaultValues,
      ...persistedDraft,
    };
    const nextStepCount = getStepCountForRole(nextValues.role);
    const restoredStep = Math.min(persistedStep, nextStepCount - 1);

    resetForm(nextValues);
    setStep(restoredStep);
    persistStep(restoredStep);
    draftAppliedRef.current = true;
  }, [hasHydrated, persistStep, persistedDraft, persistedStep, resetForm]);

  useEffect(() => {
    if (!hasHydrated) return;

    const subscription = watch((values) => {
      patchDraft(values as Partial<RegistrationFormData>);
    });

    return () => subscription.unsubscribe();
  }, [hasHydrated, patchDraft, watch]);

  useEffect(() => {
    if (step <= maxStep) return;
    goToStep(maxStep);
  }, [maxStep, step]);

  useEffect(() => {
    const digits = onlyDigits(cep);

    if (digits.length < 8) {
      setCepStatus("idle");
      setLastCepLookup("");
      return;
    }

    if (digits.length !== 8 || digits === lastCepLookup) return;

    const timer = window.setTimeout(() => {
      void lookupCep(digits);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [cep, lastCepLookup]);

  useEffect(() => {
    if (role !== "legal_guardian") {
      setGuardianCepStatus("idle");
      setLastGuardianCepLookup("");
      return;
    }

    const digits = onlyDigits(guardianCep ?? "");

    if (digits.length < 8) {
      setGuardianCepStatus("idle");
      setLastGuardianCepLookup("");
      return;
    }

    if (digits.length !== 8 || digits === lastGuardianCepLookup) return;

    const timer = window.setTimeout(() => {
      void lookupGuardianCep(digits);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [guardianCep, lastGuardianCepLookup, role]);

  const cpfField = register("cpf", {
    onChange: (event) => setValue("cpf", formatCpf(event.target.value), { shouldValidate: false }),
  });
  const birthDateField = register("birthDate", {
    onChange: (event) => setValue("birthDate", formatBirthDate(event.target.value), { shouldValidate: false }),
  });
  const phoneField = register("phone", {
    onChange: (event) => setValue("phone", formatPhone(event.target.value), { shouldValidate: false }),
  });
  const cepField = register("cep", {
    onChange: (event) => setValue("cep", formatCep(event.target.value), { shouldValidate: false }),
  });
  const guardianCpfField = register("guardianCpf", {
    onChange: (event) => setValue("guardianCpf", formatCpf(event.target.value), { shouldValidate: false }),
  });
  const guardianBirthDateField = register("guardianBirthDate", {
    onChange: (event) =>
      setValue("guardianBirthDate", formatBirthDate(event.target.value), { shouldValidate: false }),
  });
  const guardianPhoneField = register("guardianPhone", {
    onChange: (event) =>
      setValue("guardianPhone", formatPhone(event.target.value), { shouldValidate: false }),
  });
  const guardianCepField = register("guardianCep", {
    onChange: (event) =>
      setValue("guardianCep", formatCep(event.target.value), { shouldValidate: false }),
  });
  const petBirthDateField = register("petBirthDate", {
    onChange: (event) =>
      setValue("petBirthDate", formatBirthDate(event.target.value), { shouldValidate: false }),
  });

  async function handleNext() {
    const valid = await trigger(currentStep.fields);
    if (!valid) return;
    goToStep(visibleStep + 1);
  }

  function handlePrevious() {
    goToStep(visibleStep - 1);
  }

  function goToStep(nextStep: number) {
    const safeStep = Math.min(Math.max(nextStep, 0), maxStep);

    setStep(safeStep);
    persistStep(safeStep);
  }

  async function lookupCep(value: string) {
    const digits = onlyDigits(value);
    if (digits.length !== 8) return;

    setLastCepLookup(digits);
    setCepStatus("loading");
    try {
      const address = await getAddressByCep(digits);
      setValue("street", address.logradouro, { shouldValidate: true });
      setValue("neighborhood", address.bairro, { shouldValidate: true });
      setValue("city", address.localidade, { shouldValidate: true });
      setValue("state", address.uf, { shouldValidate: true });
      setCepStatus("found");
    } catch (error) {
      setCepStatus("error");
      setError("cep", {
        type: "manual",
        message: error instanceof Error ? error.message : "Não foi possível consultar o CEP.",
      });
    }
  }

  async function handleCepBlur(value: string) {
    await lookupCep(value);
  }

  async function lookupGuardianCep(value: string) {
    const digits = onlyDigits(value);
    if (digits.length !== 8) return;

    setLastGuardianCepLookup(digits);
    setGuardianCepStatus("loading");
    try {
      const address = await getAddressByCep(digits);
      setValue("guardianStreet", address.logradouro, { shouldValidate: true });
      setValue("guardianNeighborhood", address.bairro, { shouldValidate: true });
      setValue("guardianCity", address.localidade, { shouldValidate: true });
      setValue("guardianState", address.uf, { shouldValidate: true });
      setGuardianCepStatus("found");
    } catch (error) {
      setGuardianCepStatus("error");
      setError("guardianCep", {
        type: "manual",
        message: error instanceof Error ? error.message : "Não foi possível consultar o CEP.",
      });
    }
  }

  async function handleGuardianCepBlur(value: string) {
    await lookupGuardianCep(value);
  }

  async function onSubmit(data: RegistrationFormData) {
    setSubmitError(null);

    try {
      await createPatientRegistration(data as CreatePatientRegistrationRequest);
      clearDraft();
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível enviar o cadastro.");
    }
  }

  if (submitted) {
    return (
      <Card className="p-6 md:p-8">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-success-subtle text-[var(--success-600)]">
          <Icon name="check-circle-2" size={24} />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold">Cadastro iniciado</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Recebemos as informações iniciais de {fullName || "seu cadastro"}. A próxima etapa será o
          envio e análise dos documentos.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard">Ir para o portal</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/entrar">Voltar para entrada</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Card className="p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone="primary">{progress}</Badge>
            <h2 className="mt-3 text-2xl font-extrabold">{currentStep.title}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{currentStep.description}</p>
          </div>
          <div className="flex gap-2">
            {steps.map((item, index) => (
              <button
                key={item.title}
                aria-label={`Etapa ${index + 1}`}
                className={cn(
                  "h-2.5 w-10 rounded-pill transition-colors",
                  index <= visibleStep ? "bg-primary" : "bg-muted",
                )}
                type="button"
                onClick={async () => {
                  if (index <= visibleStep) goToStep(index);
                }}
              />
            ))}
          </div>
        </div>
      </Card>

      {currentStep.kind === "profile" ? <ProfileStep errors={errors} role={role} setValue={setValue} /> : null}

      {currentStep.kind === "personal" ? (
        <PersonalStep
          birthDateField={birthDateField}
          cpfField={cpfField}
          cpfRequired
          errors={errors}
          register={register}
        />
      ) : null}

      {currentStep.kind === "access" ? <AccessStep errors={errors} register={register} /> : null}

      {currentStep.kind === "pet" ? (
        <PetStep birthDateField={petBirthDateField} errors={errors} register={register} />
      ) : null}

      {currentStep.kind === "contact" ? <ContactStep errors={errors} phoneField={phoneField} /> : null}

      {currentStep.kind === "address" ? (
        <AddressStep
          addressTitle={addressTitle}
          cepField={cepField}
          cepStatus={cepStatus}
          errors={errors}
          handleCepBlur={handleCepBlur}
          register={register}
        />
      ) : null}

      {currentStep.kind === "legalGuardian" ? (
        <LegalGuardianStep
          birthDateField={guardianBirthDateField}
          cepField={guardianCepField}
          cepStatus={guardianCepStatus}
          cpfField={guardianCpfField}
          errors={errors}
          handleCepBlur={handleGuardianCepBlur}
          phoneField={guardianPhoneField}
          register={register}
        />
      ) : null}

      {submitError ? (
        <Card className="border-error bg-error-subtle p-4 text-error">
          <div className="flex items-start gap-3">
            <Icon name="alert-triangle" size={20} />
            <p className="text-sm font-semibold">{submitError}</p>
          </div>
        </Card>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button disabled={visibleStep === 0} type="button" variant="secondary" onClick={handlePrevious}>
          Voltar
        </Button>
        {visibleStep < steps.length - 1 ? (
          <Button type="button" onClick={handleNext}>
            Continuar
            <Icon name="arrow-right" size={18} />
          </Button>
        ) : (
          <Button disabled={isSubmitting} type="submit">
            Enviar cadastro
          </Button>
        )}
      </div>
    </form>
  );
}

function ProfileStep({
  errors,
  role,
  setValue,
}: {
  errors: FieldErrors<RegistrationFormData>;
  role: RegistrationFormData["role"];
  setValue: ReturnType<typeof useForm<RegistrationFormData>>["setValue"];
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_460px]">
      <Card className="p-5 md:p-6">
        <h3 className="font-heading">Documentos que você vai precisar</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Separe estes arquivos antes da próxima etapa para acelerar a análise.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {documentCards.map((document) => (
            <div key={document.title} className="rounded-md border border-border bg-card p-4">
              <Icon name={document.icon} size={20} className="text-primary" />
              <p className="mt-3 font-bold">{document.title}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{document.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <fieldset>
          <legend className="font-heading">Tipo de cadastro</legend>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Essa escolha ajusta a linguagem do cadastro e os dados de endereço.
          </p>
          <div className="mt-5 grid gap-3">
            {roleOptions.map((option) => {
              const selected = role === option.value;

              return (
                <button
                  key={option.value}
                  aria-checked={selected}
                  className={cn(
                    "flex min-h-[92px] items-center gap-4 rounded-md border p-4 text-left transition",
                    selected
                      ? "border-primary bg-primary-subtle text-[var(--green-800)]"
                      : "border-border bg-card hover:border-primary-border hover:bg-primary-subtle",
                  )}
                  role="radio"
                  type="button"
                  onClick={() => setValue("role", option.value, { shouldValidate: true })}
                >
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-card text-primary shadow-xs">
                    <Icon name={option.icon} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-extrabold">{option.label}</span>
                    <span className="mt-1 block text-sm text-[var(--text-secondary)]">
                      {option.description}
                    </span>
                  </span>
                  {selected ? <Icon name="check-circle-2" size={20} className="text-primary" /> : null}
                </button>
              );
            })}
          </div>
          {errors.role ? <ErrorMessage>{errors.role.message}</ErrorMessage> : null}
        </fieldset>
      </Card>
    </div>
  );
}

function PersonalStep({
  birthDateField,
  cpfField,
  cpfRequired,
  errors,
  register,
}: {
  birthDateField: UseFormRegisterReturn<"birthDate">;
  cpfField: UseFormRegisterReturn<"cpf">;
  cpfRequired?: boolean;
  errors: FieldErrors<RegistrationFormData>;
  register: ReturnType<typeof useForm<RegistrationFormData>>["register"];
}) {
  return (
    <Card className="p-5 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
        <Field className="md:col-span-2 xl:col-span-6" error={errors.fullName?.message} label="Nome completo" required>
          <Input autoComplete="name" {...register("fullName")} />
        </Field>
        <Field className="xl:col-span-3" error={errors.cpf?.message} label="CPF" required={cpfRequired}>
          <Input inputMode="numeric" maxLength={14} placeholder="000.000.000-00" {...cpfField} />
        </Field>
        <Field className="xl:col-span-3" error={errors.birthDate?.message} label="Data de nascimento" required>
          <Input inputMode="numeric" maxLength={10} placeholder="DD/MM/AAAA" {...birthDateField} />
        </Field>
        <Field className="xl:col-span-4" error={errors.nickname?.message} label="Apelido">
          <Input placeholder="Como prefere ser chamado" {...register("nickname")} />
        </Field>
        <Field className="md:col-span-2 xl:col-span-4" error={errors.gender?.message} label="Gênero" required>
          <select
            className="h-11 w-full rounded-md border border-input bg-card px-4 text-base shadow-xs focus:border-[var(--border-focus)]"
            {...register("gender")}
          >
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
            <option value="outro">Outro</option>
            <option value="prefiro_nao_informar">Prefiro não informar</option>
          </select>
        </Field>
      </div>
    </Card>
  );
}

function AccessStep({
  errors,
  register,
}: {
  errors: FieldErrors<RegistrationFormData>;
  register: ReturnType<typeof useForm<RegistrationFormData>>["register"];
}) {
  return (
    <Card className="p-5 md:p-6">
      <div className="mb-5 flex items-start gap-3 rounded-md bg-primary-subtle p-4">
        <Icon name="lock" size={20} className="text-primary" />
        <div>
          <h3 className="font-heading">Informações de acesso</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Defina o e-mail e a senha que o responsável usará para entrar na plataforma.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field className="md:col-span-2" error={errors.email?.message} label="E-mail" required>
          <Input autoComplete="email" leadingIcon={<Icon name="mail" size={18} />} type="email" {...register("email")} />
        </Field>
        <Field error={errors.password?.message} label="Senha" required>
          <Input
            autoComplete="new-password"
            leadingIcon={<Icon name="lock" size={18} />}
            placeholder="Mínimo de 8 caracteres"
            type="password"
            {...register("password")}
          />
        </Field>
        <Field error={errors.passwordConfirmation?.message} label="Confirmar senha" required>
          <Input
            autoComplete="new-password"
            leadingIcon={<Icon name="lock" size={18} />}
            placeholder="Repita a senha"
            type="password"
            {...register("passwordConfirmation")}
          />
        </Field>
      </div>
    </Card>
  );
}

function ContactStep({
  errors,
  phoneField,
}: {
  errors: FieldErrors<RegistrationFormData>;
  phoneField: UseFormRegisterReturn<"phone">;
}) {
  return (
    <Card className="p-5 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field error={errors.phone?.message} label="Telefone" required>
          <Input
            autoComplete="tel"
            inputMode="tel"
            leadingIcon={<Icon name="phone" size={18} />}
            maxLength={15}
            placeholder="(00) 00000-0000"
            {...phoneField}
          />
        </Field>
      </div>
    </Card>
  );
}

function AddressStep({
  addressTitle,
  cepField,
  cepStatus,
  errors,
  handleCepBlur,
  register,
}: {
  addressTitle: string;
  cepField: UseFormRegisterReturn<"cep">;
  cepStatus: "idle" | "loading" | "found" | "error";
  errors: FieldErrors<RegistrationFormData>;
  handleCepBlur: (value: string) => Promise<void>;
  register: ReturnType<typeof useForm<RegistrationFormData>>["register"];
}) {
  return (
    <Card className="p-5 md:p-6">
      <div className="mb-5 flex items-start gap-3 rounded-md bg-primary-subtle p-4">
        <Icon name="map-pin" size={20} className="text-primary" />
        <div>
          <h3 className="font-heading">{addressTitle}</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            O CEP preenche automaticamente rua, bairro, estado e cidade quando encontrado.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <Field className="md:col-span-2" error={errors.cep?.message} label="CEP" required>
          <Input
            data-testid="registration-cep"
            inputMode="numeric"
            maxLength={9}
            placeholder="00000-000"
            {...cepField}
            onBlur={(event) => {
              cepField.onBlur(event);
              void handleCepBlur(event.currentTarget.value);
            }}
          />
          {cepStatus === "loading" ? (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Consultando CEP...</p>
          ) : null}
          {cepStatus === "found" ? (
            <p className="mt-1 text-sm font-semibold text-[var(--success-600)]">Endereço preenchido.</p>
          ) : null}
        </Field>
        <Field className="md:col-span-4" error={errors.street?.message} label="Rua" required>
          <Input {...register("street")} />
        </Field>
        <Field className="md:col-span-2" error={errors.number?.message} label="Número" required>
          <Input {...register("number")} />
        </Field>
        <Field className="md:col-span-4" error={errors.complement?.message} label="Complemento">
          <Input placeholder="Apartamento, bloco ou referência" {...register("complement")} />
        </Field>
        <Field className="md:col-span-2" error={errors.neighborhood?.message} label="Bairro" required>
          <Input {...register("neighborhood")} />
        </Field>
        <Field className="md:col-span-1" error={errors.state?.message} label="Estado" required>
          <Input maxLength={2} placeholder="UF" {...register("state")} />
        </Field>
        <Field className="md:col-span-3" error={errors.city?.message} label="Cidade" required>
          <Input {...register("city")} />
        </Field>
      </div>
    </Card>
  );
}

function LegalGuardianStep({
  birthDateField,
  cepField,
  cepStatus,
  cpfField,
  errors,
  handleCepBlur,
  phoneField,
  register,
}: {
  birthDateField: UseFormRegisterReturn<"guardianBirthDate">;
  cepField: UseFormRegisterReturn<"guardianCep">;
  cepStatus: "idle" | "loading" | "found" | "error";
  cpfField: UseFormRegisterReturn<"guardianCpf">;
  errors: FieldErrors<RegistrationFormData>;
  handleCepBlur: (value: string) => Promise<void>;
  phoneField: UseFormRegisterReturn<"guardianPhone">;
  register: ReturnType<typeof useForm<RegistrationFormData>>["register"];
}) {
  return (
    <div className="grid gap-5">
      <Card className="p-5 md:p-6">
        <div className="mb-5 flex items-start gap-3 rounded-md bg-primary-subtle p-4">
          <Icon name="users" size={20} className="text-primary" />
          <div>
            <h3 className="font-heading">Dados do responsável legal</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Estes dados identificam quem responderá pelo cadastro e pelas autorizações do dependente.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
          <Field
            className="md:col-span-2 xl:col-span-5"
            error={errors.guardianFullName?.message}
            label="Nome completo"
            required
          >
            <Input autoComplete="name" {...register("guardianFullName")} />
          </Field>
          <Field className="xl:col-span-3" error={errors.guardianCpf?.message} label="CPF" required>
            <Input inputMode="numeric" maxLength={14} placeholder="000.000.000-00" {...cpfField} />
          </Field>
          <Field className="xl:col-span-2" error={errors.guardianRg?.message} label="RG" required>
            <Input placeholder="Documento RG" {...register("guardianRg")} />
          </Field>
          <Field className="xl:col-span-2" error={errors.guardianBirthDate?.message} label="Nascimento" required>
            <Input inputMode="numeric" maxLength={10} placeholder="DD/MM/AAAA" {...birthDateField} />
          </Field>
          <Field className="md:col-span-1 xl:col-span-3" error={errors.guardianRelationship?.message} label="Parentesco" required>
            <select
              className="h-11 w-full rounded-md border border-input bg-card px-4 text-base shadow-xs focus:border-[var(--border-focus)]"
              {...register("guardianRelationship")}
            >
              <option value="pai_mae">Pai/Mãe</option>
              <option value="tutor">Tutor</option>
              <option value="filho">Filho</option>
              <option value="cuidador">Cuidador</option>
              <option value="procurador">Procurador</option>
            </select>
          </Field>
          <Field className="md:col-span-2 xl:col-span-4" error={errors.guardianPhone?.message} label="Telefone celular" required>
            <Input
              autoComplete="tel"
              inputMode="tel"
              leadingIcon={<Icon name="phone" size={18} />}
              maxLength={15}
              placeholder="(00) 00000-0000"
              {...phoneField}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <div className="mb-5 flex items-start gap-3 rounded-md bg-primary-subtle p-4">
          <Icon name="map-pin" size={20} className="text-primary" />
          <div>
            <h3 className="font-heading">Endereço do responsável legal</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              O CEP preenche automaticamente rua, bairro, estado e cidade quando encontrado.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <Field className="md:col-span-2" error={errors.guardianCep?.message} label="CEP" required>
            <Input
              data-testid="guardian-cep"
              inputMode="numeric"
              maxLength={9}
              placeholder="00000-000"
              {...cepField}
              onBlur={(event) => {
                cepField.onBlur(event);
                void handleCepBlur(event.currentTarget.value);
              }}
            />
            {cepStatus === "loading" ? (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Consultando CEP...</p>
            ) : null}
            {cepStatus === "found" ? (
              <p className="mt-1 text-sm font-semibold text-[var(--success-600)]">Endereço preenchido.</p>
            ) : null}
          </Field>
          <Field className="md:col-span-4" error={errors.guardianStreet?.message} label="Rua" required>
            <Input {...register("guardianStreet")} />
          </Field>
          <Field className="md:col-span-2" error={errors.guardianNumber?.message} label="Número" required>
            <Input {...register("guardianNumber")} />
          </Field>
          <Field className="md:col-span-4" error={errors.guardianComplement?.message} label="Complemento">
            <Input placeholder="Apartamento, bloco ou referência" {...register("guardianComplement")} />
          </Field>
          <Field className="md:col-span-2" error={errors.guardianNeighborhood?.message} label="Bairro" required>
            <Input {...register("guardianNeighborhood")} />
          </Field>
          <Field className="md:col-span-1" error={errors.guardianState?.message} label="Estado" required>
            <Input maxLength={2} placeholder="UF" {...register("guardianState")} />
          </Field>
          <Field className="md:col-span-3" error={errors.guardianCity?.message} label="Cidade" required>
            <Input {...register("guardianCity")} />
          </Field>
        </div>
      </Card>
    </div>
  );
}

function PetStep({
  birthDateField,
  errors,
  register,
}: {
  birthDateField: UseFormRegisterReturn<"petBirthDate">;
  errors: FieldErrors<RegistrationFormData>;
  register: ReturnType<typeof useForm<RegistrationFormData>>["register"];
}) {
  return (
    <Card className="p-5 md:p-6">
      <div className="mb-5 flex items-start gap-3 rounded-md bg-primary-subtle p-4">
        <Icon name="shield-check" size={20} className="text-primary" />
        <div>
          <h3 className="font-heading">Dados do PET</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Informe os dados básicos do animal para orientar a análise inicial do cadastro.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field error={errors.petName?.message} label="Nome do PET" required>
          <Input placeholder="Totó" {...register("petName")} />
        </Field>
        <Field error={errors.petSpecies?.message} label="Espécie" required>
          <select
            className="h-11 w-full rounded-md border border-input bg-card px-4 text-base shadow-xs focus:border-[var(--border-focus)]"
            {...register("petSpecies")}
          >
            <option value="">Selecione</option>
            {petSpeciesOptions.map((species) => (
              <option key={species} value={species}>
                {species}
              </option>
            ))}
          </select>
        </Field>
        <Field error={errors.petBreed?.message} label="Raça">
          <Input placeholder="Pastor Alemão" {...register("petBreed")} />
        </Field>
        <Field error={errors.petBirthDate?.message} label="Data de nascimento do PET">
          <Input inputMode="numeric" maxLength={10} placeholder="DD/MM/AAAA" {...birthDateField} />
        </Field>
        <Field className="md:col-span-2" error={errors.petDiagnosis?.message} label="Diagnóstico do PET">
          <textarea
            className="min-h-32 w-full resize-y rounded-md border border-input bg-card px-4 py-3 text-base shadow-xs transition-[border-color,box-shadow] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-focus)]"
            placeholder="Ansiedade, dor crônica, epilepsia..."
            {...register("petDiagnosis")}
          />
        </Field>
      </div>
    </Card>
  );
}

function Field({
  children,
  className,
  error,
  label,
  required,
}: {
  children: React.ReactNode;
  className?: string;
  error?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-bold text-[var(--text-primary)]">
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </label>
      {children}
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </div>
  );
}

function ErrorMessage({ children }: { children?: React.ReactNode }) {
  return <p className="text-sm font-semibold text-error">{children}</p>;
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function formatCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

function formatBirthDate(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

function formatPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

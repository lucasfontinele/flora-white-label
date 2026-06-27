"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useMemberAccount } from "@/components/associated/member-account-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { BRAZILIAN_UFS } from "@/lib/brazilian-ufs";
import { cn } from "@/lib/utils";
import { becomePatientSchema } from "../schemas/become-patient-schema";

type FormState = {
  condition: string;
  prescriber: { name: string; crm: string; uf: string };
  hasPrescription: "sim" | "nao";
  notes: string;
  consent: boolean;
};

const initialState: FormState = {
  condition: "",
  prescriber: { name: "", crm: "", uf: "" },
  hasPrescription: "sim",
  notes: "",
  consent: false,
};

export function BecomePatientForm() {
  const { applicationStatus, responsibleName, submitApplication } = useMemberAccount();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fieldId = useId();

  if (applicationStatus !== "none") {
    return <ApplicationStatusCard responsibleName={responsibleName} />;
  }

  function update<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updatePrescriber(key: keyof FormState["prescriber"], value: string) {
    setForm((current) => ({ ...current, prescriber: { ...current.prescriber, [key]: value } }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const result = becomePatientSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    submitApplication(result.data);
  }

  return (
    <div className="max-w-2xl space-y-5 pb-20 lg:pb-0">
      <Card className="flex items-start gap-3 bg-primary-subtle p-5">
        <Icon name="id-card" size={22} className="mt-0.5 shrink-0 text-[var(--green-700)]" />
        <div>
          <h2 className="font-heading text-[var(--green-700)]">Você está se cadastrando como paciente</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {responsibleName}, este é um pedido inicial. Após a análise da associação, solicitamos os documentos
            clínicos (receita, laudo e autorização) para concluir o cadastro de paciente.
          </p>
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
          <Field error={errors.condition} htmlFor={`${fieldId}-condition`} label="Condição ou diagnóstico principal">
            <Input
              id={`${fieldId}-condition`}
              placeholder="Ex.: Dor crônica, epilepsia, ansiedade…"
              value={form.condition}
              onChange={(event) => update("condition", event.target.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Field
                error={errors["prescriber.name"]}
                hint="Opcional — se já tem acompanhamento médico."
                htmlFor={`${fieldId}-prescriber-name`}
                label="Médico prescritor"
              >
                <Input
                  id={`${fieldId}-prescriber-name`}
                  placeholder="Ex.: Dra. Helena Costa"
                  value={form.prescriber.name}
                  onChange={(event) => updatePrescriber("name", event.target.value)}
                />
              </Field>
            </div>
            <div className="sm:col-span-4">
              <Field error={errors["prescriber.crm"]} htmlFor={`${fieldId}-prescriber-crm`} label="CRM">
                <Input
                  id={`${fieldId}-prescriber-crm`}
                  placeholder="Número do CRM"
                  value={form.prescriber.crm}
                  onChange={(event) => updatePrescriber("crm", event.target.value)}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field error={errors["prescriber.uf"]} htmlFor={`${fieldId}-prescriber-uf`} label="UF">
                <select
                  id={`${fieldId}-prescriber-uf`}
                  className="h-11 w-full rounded-md border border-input bg-card px-4 text-base shadow-xs focus:border-[var(--border-focus)]"
                  value={form.prescriber.uf}
                  onChange={(event) => updatePrescriber("uf", event.target.value)}
                >
                  <option value="">UF</option>
                  {BRAZILIAN_UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <Field error={errors.hasPrescription} label="Já possui receita ou laudo médico?">
            <div className="inline-flex rounded-md border border-input bg-card p-1">
              {(["sim", "nao"] as const).map((option) => {
                const active = form.hasPrescription === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => update("hasPrescription", option)}
                    className={cn(
                      "rounded-sm px-5 py-2 text-sm font-semibold transition-colors",
                      active
                        ? "bg-primary-subtle text-[var(--green-700)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                    )}
                  >
                    {option === "sim" ? "Sim" : "Não"}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field
            error={errors.notes}
            hint="Opcional — algo que ajude a associação a entender seu caso."
            htmlFor={`${fieldId}-notes`}
            label="Observações"
          >
            <textarea
              id={`${fieldId}-notes`}
              rows={3}
              placeholder="Conte um pouco sobre o tratamento desejado…"
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
              className="w-full rounded-md border border-input bg-card px-4 py-3 text-base shadow-xs transition-[border-color,box-shadow] placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-focus)]"
            />
          </Field>

          <div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(event) => update("consent", event.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--green-600)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">
                Autorizo a associação a analisar meus dados para avaliar minha solicitação de cadastro como paciente.
              </span>
            </label>
            {errors.consent ? <span className="mt-1 block text-xs text-[var(--error-600)]">{errors.consent}</span> : null}
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button asChild type="button" variant="secondary">
              <Link href="/dashboard">Cancelar</Link>
            </Button>
            <Button type="submit">Enviar solicitação</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function ApplicationStatusCard({ responsibleName }: { responsibleName: string }) {
  return (
    <div className="max-w-2xl pb-20 lg:pb-0">
      <Card className="p-6 md:p-8">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-warning-subtle text-[var(--warning-600)]">
            <Icon name="clock" size={26} />
          </span>
          <Badge tone="warning" dot className="mt-4">
            Em análise
          </Badge>
          <h2 className="mt-4 font-heading text-xl">Solicitação enviada</h2>
          <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
            {responsibleName}, recebemos seu pedido para se tornar paciente. A associação vai analisar os dados e, na
            sequência, solicitar os documentos clínicos (receita, laudo e autorização Anvisa) para concluir o cadastro.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Voltar ao início</Link>
          </Button>
        </div>
      </Card>
    </div>
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

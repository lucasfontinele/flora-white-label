"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { BRAZILIAN_UFS, isValidUf } from "@/lib/brazilian-ufs";
import { getApiErrorMessage } from "@/lib/http";
import { cn } from "@/lib/utils";
import {
  useCreatePatientPrescriber,
  useDeletePatientPrescriber,
  usePatientPrescribers,
  useUpdatePatientPrescriber,
} from "../queries/use-patient-prescribers";
import type { Prescriber } from "../types";

type PatientOption = { id: string; name: string };

type PrescribersViewProps = {
  organizationId: string;
  patients: PatientOption[];
  defaultPatientId: string;
};

type FormState = { fullName: string; crm: string; crmState: string };
type FormErrors = Partial<Record<keyof FormState, string>>;

const emptyForm: FormState = { fullName: "", crm: "", crmState: "" };

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (form.fullName.trim().length < 3) errors.fullName = "Informe o nome completo do médico.";
  if (form.crm.trim().length === 0) errors.crm = "Informe o CRM.";
  if (!isValidUf(form.crmState)) errors.crmState = "Selecione a UF do CRM.";
  return errors;
}

export function PrescribersView({ organizationId, patients, defaultPatientId }: PrescribersViewProps) {
  const { toast } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState(defaultPatientId);
  // null = no form open; "new" = creating; otherwise the id being edited.
  const [editing, setEditing] = useState<"new" | string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<Prescriber | null>(null);

  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ?? patients[0] ?? null;
  const patientId = selectedPatient?.id ?? "";

  const prescribersQuery = usePatientPrescribers(organizationId, patientId);
  const createMutation = useCreatePatientPrescriber(organizationId, patientId);
  const updateMutation = useUpdatePatientPrescriber(organizationId, patientId);
  const deleteMutation = useDeletePatientPrescriber(organizationId, patientId);

  if (!organizationId || !selectedPatient) {
    return (
      <div className="max-w-3xl pb-20 lg:pb-0">
        <Card className="p-6">
          <h2 className="font-heading text-lg text-[var(--text-primary)]">Prescritores indisponíveis</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Não encontramos um paciente vinculado à sua conta para gerenciar os prescritores.
          </p>
        </Card>
      </div>
    );
  }

  function selectPatient(id: string) {
    setSelectedPatientId(id);
    closeForm();
  }

  function openCreate() {
    setEditing("new");
    setForm(emptyForm);
    setErrors({});
  }

  function openEdit(prescriber: Prescriber) {
    setEditing(prescriber.id);
    setForm({ fullName: prescriber.fullName, crm: prescriber.crm, crmState: prescriber.crmState });
    setErrors({});
  }

  function closeForm() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
  }

  function update<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const body = {
      fullName: form.fullName.trim(),
      crm: form.crm.trim(),
      crmState: form.crmState.trim().toUpperCase(),
    };

    if (editing === "new") {
      createMutation.mutate(body, {
        onSuccess: () => {
          toast({ variant: "success", title: "Prescritor adicionado" });
          closeForm();
        },
        onError: (error) =>
          toast({ variant: "error", title: "Não foi possível salvar", description: getApiErrorMessage(error) }),
      });
      return;
    }

    if (typeof editing === "string") {
      updateMutation.mutate(
        { prescriberId: editing, body },
        {
          onSuccess: () => {
            toast({ variant: "success", title: "Prescritor atualizado" });
            closeForm();
          },
          onError: (error) =>
            toast({ variant: "error", title: "Não foi possível salvar", description: getApiErrorMessage(error) }),
        },
      );
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast({ variant: "success", title: "Prescritor removido" });
        setDeleteTarget(null);
      },
      onError: (error) =>
        toast({ variant: "error", title: "Não foi possível remover", description: getApiErrorMessage(error) }),
    });
  }

  const prescribers = prescribersQuery.data?.data ?? [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-3xl space-y-4 pb-20 lg:pb-0">
      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-[var(--green-700)]">
            <Icon name="id-card" size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold">Médicos prescritores</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Cadastre os médicos responsáveis pela prescrição de cada paciente.
            </p>
          </div>
        </div>
        {patients.length > 1 ? (
          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--text-secondary)]">Selecione o paciente</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar paciente">
              {patients.map((patient) => {
                const selected = patient.id === selectedPatient.id;
                return (
                  <button
                    key={patient.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectPatient(patient.id)}
                    className={cn(
                      "inline-flex min-h-10 items-center gap-2 rounded-pill border px-3.5 text-sm font-semibold transition-colors",
                      selected
                        ? "border-primary-border bg-primary-subtle text-[var(--green-700)]"
                        : "border-border bg-card text-[var(--text-secondary)] hover:bg-muted hover:text-[var(--text-primary)]",
                    )}
                  >
                    <Icon name={selected ? "check-circle-2" : "user"} size={16} />
                    <span className="max-w-[200px] truncate">{patient.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            Paciente: <span className="font-semibold text-[var(--text-primary)]">{selectedPatient.name}</span>
          </p>
        )}
      </Card>

      {prescribersQuery.isLoading ? (
        <PrescribersSkeleton />
      ) : prescribersQuery.error ? (
        <Card className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg text-[var(--text-primary)]">
              Não foi possível carregar os prescritores
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {prescribersQuery.error instanceof Error ? prescribersQuery.error.message : "Tente novamente."}
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => void prescribersQuery.refetch()}>
            Tentar novamente
          </Button>
        </Card>
      ) : prescribers.length === 0 && editing === null ? (
        <Card className="flex flex-col items-start gap-3 p-8">
          <h2 className="font-heading text-lg text-[var(--text-primary)]">Nenhum prescritor cadastrado</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Adicione o médico que prescreve o tratamento de {selectedPatient.name}.
          </p>
          <Button type="button" onClick={openCreate}>
            <Icon name="user-plus" size={16} />
            Adicionar prescritor
          </Button>
        </Card>
      ) : (
        <>
          {prescribers.map((prescriber) =>
            editing === prescriber.id ? (
              <PrescriberForm
                key={prescriber.id}
                errors={errors}
                form={form}
                pending={isSaving}
                title="Editar prescritor"
                onCancel={closeForm}
                onChange={update}
                onSubmit={handleSubmit}
              />
            ) : (
              <Card key={prescriber.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted text-[var(--text-secondary)]">
                  <Icon name="id-card" size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{prescriber.fullName}</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    CRM {prescriber.crm}/{prescriber.crmState}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => openEdit(prescriber)}>
                    Editar
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setDeleteTarget(prescriber)}>
                    <Icon name="trash-2" size={16} />
                    Remover
                  </Button>
                </div>
              </Card>
            ),
          )}

          {editing === "new" ? (
            <PrescriberForm
              errors={errors}
              form={form}
              pending={isSaving}
              title="Novo prescritor"
              onCancel={closeForm}
              onChange={update}
              onSubmit={handleSubmit}
            />
          ) : prescribers.length > 0 ? (
            <Button type="button" variant="secondary" onClick={openCreate}>
              <Icon name="user-plus" size={16} />
              Adicionar prescritor
            </Button>
          ) : null}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remover prescritor"
        description={
          deleteTarget
            ? `Tem certeza que deseja remover ${deleteTarget.fullName} (CRM ${deleteTarget.crm}/${deleteTarget.crmState})?`
            : undefined
        }
        confirmLabel="Remover"
        confirmVariant="danger"
        pending={deleteMutation.isPending}
        pendingLabel="Removendo..."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function PrescriberForm({
  errors,
  form,
  pending,
  title,
  onCancel,
  onChange,
  onSubmit,
}: {
  errors: FormErrors;
  form: FormState;
  pending: boolean;
  title: string;
  onCancel: () => void;
  onChange: <Key extends keyof FormState>(key: Key, value: FormState[Key]) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <Card className="p-5">
      <h3 className="font-heading">{title}</h3>
      <form className="mt-4 grid gap-4 md:grid-cols-12" noValidate onSubmit={onSubmit}>
        <Field className="md:col-span-6" error={errors.fullName} label="Nome completo do médico">
          <Input
            placeholder="Ex.: Dra. Helena Costa"
            value={form.fullName}
            onChange={(event) => onChange("fullName", event.target.value)}
          />
        </Field>
        <Field className="md:col-span-4" error={errors.crm} label="CRM">
          <Input
            placeholder="Número do CRM"
            value={form.crm}
            onChange={(event) => onChange("crm", event.target.value)}
          />
        </Field>
        <Field className="md:col-span-2" error={errors.crmState} label="UF">
          <select
            className="h-11 w-full rounded-md border border-input bg-card px-4 text-base shadow-xs focus:border-[var(--border-focus)]"
            value={form.crmState}
            onChange={(event) => onChange("crmState", event.target.value)}
          >
            <option value="">UF</option>
            {BRAZILIAN_UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </Field>
        <div className="md:col-span-12 flex justify-end gap-3">
          <Button type="button" variant="secondary" disabled={pending} onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Field({
  children,
  className,
  error,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  error?: string;
  label: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-bold text-[var(--text-primary)]">{label}</label>
      {children}
      {error ? <p className="text-sm font-semibold text-error">{error}</p> : null}
    </div>
  );
}

function PrescribersSkeleton() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index} className="flex items-center gap-4 p-4" aria-busy="true">
          <Skeleton className="h-11 w-11 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-24" />
        </Card>
      ))}
    </>
  );
}

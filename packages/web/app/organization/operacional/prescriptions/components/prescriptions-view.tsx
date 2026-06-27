"use client";

import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { prescriptionToFormValues } from "@/components/domain/prescription-editor";
import { usePatients } from "../../approvals/queries/use-patients";
import { useProducts } from "../../products/queries/use-products";
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS, PRODUCT_UNIT_LABELS } from "../../products/types";
import { PrescriptionFormDialog } from "./prescription-form-dialog";
import { PrescriptionsTable } from "./prescriptions-table";
import {
  useDeletePrescription,
  usePrescriptions,
  useUpsertPrescription,
} from "../queries/use-prescriptions";
import type { PrescriptionFormValues } from "../schemas/prescription-schema";
import type { PrescriptionRow, PrescriptionWriteBody } from "../types";

export function PrescriptionsView({ organizationId }: { organizationId: string }) {
  const patientsQuery = usePatients(organizationId, "APPROVAL");
  const prescriptionsQuery = usePrescriptions(organizationId);
  const productsQuery = useProducts(organizationId);
  const upsertMutation = useUpsertPrescription(organizationId);
  const deleteMutation = useDeletePrescription(organizationId);
  const { toast } = useToast();

  const productOptions = useMemo(
    () =>
      (productsQuery.data?.data ?? [])
        .filter((product) => product.isActive)
        .map((product) => ({
          id: product.id,
          name: product.name,
          unitLabel: PRODUCT_UNIT_LABELS[product.unit],
        })),
    [productsQuery.data],
  );

  const categoryOptions = useMemo(
    () =>
      PRODUCT_CATEGORIES.map((category) => ({
        value: category,
        label: PRODUCT_CATEGORY_LABELS[category],
      })),
    [],
  );

  const [formRow, setFormRow] = useState<PrescriptionRow | null>(null);
  const [rowToClear, setRowToClear] = useState<PrescriptionRow | null>(null);

  // One row per approved patient, merged with their prescription (if any).
  const rows = useMemo<PrescriptionRow[]>(() => {
    const patients = patientsQuery.data?.data ?? [];
    const byPatient = new Map(
      (prescriptionsQuery.data?.data ?? []).map((prescription) => [
        prescription.patientId,
        prescription,
      ]),
    );

    return patients.map((patient) => ({
      patientId: patient.id,
      patientName: patient.name,
      guardianName: patient.guardianName,
      prescription: byPatient.get(patient.id) ?? null,
    }));
  }, [patientsQuery.data, prescriptionsQuery.data]);

  const isLoading = patientsQuery.isLoading || prescriptionsQuery.isLoading;
  const error =
    patientsQuery.error instanceof Error
      ? patientsQuery.error
      : prescriptionsQuery.error instanceof Error
        ? prescriptionsQuery.error
        : null;

  // Stable across background refetches so the open form is not reset mid-edit.
  const formInitialValues = useMemo<PrescriptionFormValues | undefined>(() => {
    if (!formRow?.prescription) return undefined;
    return prescriptionToFormValues(formRow.prescription);
  }, [formRow]);

  function openSetDate(row: PrescriptionRow) {
    upsertMutation.reset();
    setFormRow(row);
  }

  function closeForm() {
    if (upsertMutation.isPending) return;
    setFormRow(null);
  }

  function submitForm(body: PrescriptionWriteBody) {
    if (!formRow) return;

    upsertMutation.mutate(
      { patientId: formRow.patientId, body },
      {
        onSuccess: () => {
          setFormRow(null);
          toast({
            variant: "success",
            title: "Receita atualizada",
            description: `Receita e posologia definidas para ${formRow.patientName}.`,
          });
        },
      },
    );
  }

  function requestClear(row: PrescriptionRow) {
    deleteMutation.reset();
    setRowToClear(row);
  }

  function cancelClear() {
    if (deleteMutation.isPending) return;
    deleteMutation.reset();
    setRowToClear(null);
  }

  function confirmClear() {
    if (!rowToClear) return;
    const { patientId, patientName } = rowToClear;

    deleteMutation.mutate(patientId, {
      onSuccess: () => {
        setRowToClear(null);
        toast({
          variant: "success",
          title: "Receita removida",
          description: `A data limite de ${patientName} foi removida.`,
        });
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">
          Validade de receita
        </p>
        <h2 className="mt-1 font-heading text-2xl text-[var(--text-primary)]">Receitas</h2>
        <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
          Defina a data limite da receita de cada paciente aprovado. Futuramente, pacientes sem
          receita válida ficarão impedidos de abrir novos pedidos.
        </p>
      </section>

      <PrescriptionsTable
        rows={rows}
        isLoading={isLoading}
        error={error}
        onSetDate={openSetDate}
        onClear={requestClear}
        onRetry={() => {
          void patientsQuery.refetch();
          void prescriptionsQuery.refetch();
        }}
      />

      <PrescriptionFormDialog
        key={formRow?.patientId ?? "none"}
        open={formRow !== null}
        patientName={formRow?.patientName ?? ""}
        hasExisting={formRow?.prescription !== null && formRow?.prescription !== undefined}
        products={productOptions}
        categories={categoryOptions}
        productsLoading={productsQuery.isLoading}
        initialValues={formInitialValues}
        pending={upsertMutation.isPending}
        onSubmit={submitForm}
        onCancel={closeForm}
      />

      <ConfirmDialog
        open={rowToClear !== null}
        title="Remover data limite da receita"
        description={
          rowToClear ? (
            <>
              Tem certeza que deseja remover a data limite da receita de{" "}
              <strong>{rowToClear.patientName}</strong>? Esta ação não pode ser desfeita.
            </>
          ) : null
        }
        confirmLabel="Remover"
        confirmVariant="danger"
        pending={deleteMutation.isPending}
        pendingLabel="Removendo..."
        onConfirm={confirmClear}
        onCancel={cancelClear}
      />
    </div>
  );
}

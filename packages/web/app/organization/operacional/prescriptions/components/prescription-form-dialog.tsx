"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  prescriptionFormSchema,
  type PrescriptionFormValues,
} from "../schemas/prescription-schema";

type PrescriptionFormDialogProps = {
  open: boolean;
  patientName: string;
  hasExisting: boolean;
  initialValues?: PrescriptionFormValues;
  pending: boolean;
  onSubmit: (values: PrescriptionFormValues) => void;
  onCancel: () => void;
};

const EMPTY_VALUES: PrescriptionFormValues = { validUntil: "", observations: "" };

/**
 * Modal to set/update the prescription validity date for a single patient.
 * Mirrors the RequiredDocumentFormDialog shell (portal, Escape, backdrop
 * dismissal disabled while pending) with its own react-hook-form state.
 */
export function PrescriptionFormDialog({
  open,
  patientName,
  hasExisting,
  initialValues,
  pending,
  onSubmit,
  onCancel,
}: PrescriptionFormDialogProps) {
  const titleId = React.useId();
  const [mounted, setMounted] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) reset(initialValues ?? EMPTY_VALUES);
  }, [open, initialValues, reset]);

  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onCancel();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, pending, onCancel]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          if (!pending) onCancel();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <h2 id={titleId} className="font-heading text-lg text-[var(--text-primary)]">
          {hasExisting ? "Editar data limite da receita" : "Definir data limite da receita"}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Paciente <strong className="text-[var(--text-primary)]">{patientName}</strong>. A partir do
          dia seguinte a esta data a receita é considerada vencida.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1.5">
            <label
              className="text-sm font-bold text-[var(--text-primary)]"
              htmlFor="prescription-valid-until"
            >
              Válida até
            </label>
            <Input id="prescription-valid-until" type="date" autoFocus {...register("validUntil")} />
            {errors.validUntil ? (
              <p className="text-sm text-error">{errors.validUntil.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-bold text-[var(--text-primary)]"
              htmlFor="prescription-observations"
            >
              Observações{" "}
              <span className="font-normal text-[var(--text-tertiary)]">(opcional)</span>
            </label>
            <Textarea
              id="prescription-observations"
              placeholder="Origem da receita, médico responsável..."
              {...register("observations")}
            />
            {errors.observations ? (
              <p className="text-sm text-error">{errors.observations.message}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" disabled={pending} onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  PrescriptionEditor,
  type CategoryOption,
  type ProductOption,
} from "@/components/domain/prescription-editor";
import type { PrescriptionFormValues } from "../schemas/prescription-schema";
import type { PrescriptionWriteBody } from "../types";

type PrescriptionFormDialogProps = {
  open: boolean;
  patientName: string;
  hasExisting: boolean;
  products: ProductOption[];
  categories: CategoryOption[];
  productsLoading?: boolean;
  initialValues?: PrescriptionFormValues;
  pending: boolean;
  onSubmit: (body: PrescriptionWriteBody) => void;
  onCancel: () => void;
};

/**
 * Modal to transcribe a patient's receita (emission date + posology) for a
 * single patient. Hosts the shared {@link PrescriptionEditor} in the same modal
 * shell as the other CRUD dialogs (portal, Escape, backdrop dismissal disabled
 * while pending).
 */
export function PrescriptionFormDialog({
  open,
  patientName,
  hasExisting,
  products,
  categories,
  productsLoading,
  initialValues,
  pending,
  onSubmit,
  onCancel,
}: PrescriptionFormDialogProps) {
  const titleId = React.useId();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <h2 id={titleId} className="font-heading text-lg text-[var(--text-primary)]">
          {hasExisting ? "Editar receita" : "Definir receita"}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Paciente <strong className="text-[var(--text-primary)]">{patientName}</strong>. A validade
          é calculada como emissão + 6 meses.
        </p>

        <div className="mt-5">
          <PrescriptionEditor
            products={products}
            categories={categories}
            productsLoading={productsLoading}
            defaultValues={initialValues}
            pending={pending}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

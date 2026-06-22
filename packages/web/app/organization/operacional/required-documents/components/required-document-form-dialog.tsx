"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  requiredDocumentFormSchema,
  type RequiredDocumentFormValues,
} from "../schemas/required-document-schema";

type RequiredDocumentFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: RequiredDocumentFormValues;
  pending: boolean;
  onSubmit: (values: RequiredDocumentFormValues) => void;
  onCancel: () => void;
};

const EMPTY_VALUES: RequiredDocumentFormValues = { name: "", observations: "" };

/**
 * Create/edit modal for a required document. Mirrors the ConfirmDialog shell
 * (portal, Escape, backdrop dismissal disabled while pending) and owns its own
 * react-hook-form state, reset whenever it (re)opens for a given record.
 */
export function RequiredDocumentFormDialog({
  open,
  mode,
  initialValues,
  pending,
  onSubmit,
  onCancel,
}: RequiredDocumentFormDialogProps) {
  const titleId = React.useId();
  const [mounted, setMounted] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequiredDocumentFormValues>({
    resolver: zodResolver(requiredDocumentFormSchema),
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

  const isEdit = mode === "edit";

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
          {isEdit ? "Editar documento exigido" : "Novo documento exigido"}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Defina o documento que o paciente precisa enviar no processo de associação.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[var(--text-primary)]" htmlFor="required-document-name">
              Nome do documento
            </label>
            <Input
              id="required-document-name"
              autoFocus
              placeholder="Ex.: Receita médica"
              {...register("name")}
            />
            {errors.name ? <p className="text-sm text-error">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-bold text-[var(--text-primary)]"
              htmlFor="required-document-observations"
            >
              Observações{" "}
              <span className="font-normal text-[var(--text-tertiary)]">(opcional)</span>
            </label>
            <Textarea
              id="required-document-observations"
              placeholder="Instrução importante sobre este documento..."
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
              {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

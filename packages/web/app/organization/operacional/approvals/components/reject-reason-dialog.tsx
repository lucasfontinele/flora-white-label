"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type RejectReasonDialogProps = {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  pending: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

/**
 * Confirmation modal with a required reason textarea, used both to reject a
 * single document and to reject the whole registration.
 */
export function RejectReasonDialog({
  open,
  title,
  description,
  pending,
  onConfirm,
  onCancel,
}: RejectReasonDialogProps) {
  const titleId = React.useId();
  const [reason, setReason] = React.useState("");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) setReason("");
  }, [open]);

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

  const trimmed = reason.trim();

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
          {title}
        </h2>
        {description ? (
          <div className="mt-2 text-sm text-[var(--text-secondary)]">{description}</div>
        ) : null}

        <label className="mt-4 block space-y-1.5">
          <span className="text-sm font-bold text-[var(--text-primary)]">Motivo da recusa</span>
          <Textarea
            autoFocus
            placeholder="Descreva o motivo para o solicitante poder corrigir..."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" disabled={pending} onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={pending || trimmed.length === 0}
            onClick={() => onConfirm(trimmed)}
          >
            {pending ? "Recusando..." : "Confirmar recusa"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

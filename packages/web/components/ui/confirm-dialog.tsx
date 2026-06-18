"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  pending?: boolean;
  pendingLabel?: string;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Generic, accessible confirmation modal. Renders into a portal, dims the
 * background, and can be dismissed with Escape or a backdrop click (disabled
 * while `pending`). Focus lands on Cancel so an accidental Enter never confirms
 * a destructive action.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmVariant = "primary",
  pending = false,
  pendingLabel = "Processando...",
  errorMessage,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = React.useId();
  const descriptionId = React.useId();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
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
    cancelRef.current?.focus();

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
        aria-describedby={description ? descriptionId : undefined}
        className="relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <h2 id={titleId} className="font-heading text-lg text-[var(--text-primary)]">
          {title}
        </h2>

        {description ? (
          <div id={descriptionId} className="mt-2 text-sm text-[var(--text-secondary)]">
            {description}
          </div>
        ) : null}

        {errorMessage ? (
          <p className="mt-3 text-sm text-[var(--error-600)]" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <Button ref={cancelRef} type="button" variant="secondary" disabled={pending} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={confirmVariant} disabled={pending} onClick={onConfirm}>
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

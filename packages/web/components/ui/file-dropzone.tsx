"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type FileDropzoneProps = {
  /** Currently selected file (controlled). */
  value: File | null;
  onChange: (file: File | null) => void;
  /** Preview URL for an already-stored file (e.g. an existing cover image). */
  existingPreviewUrl?: string | null;
  /** Accepted MIME types, e.g. ["image/png", "image/jpeg"]. */
  accept?: string[];
  maxSizeBytes?: number;
  disabled?: boolean;
  /** Surfaced when a dropped/selected file fails the accept/size checks. */
  onRejected?: (message: string) => void;
  id?: string;
  className?: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * A self-contained drag-and-drop upload field styled to match the design system
 * (shadcn does not ship an official upload primitive). Single-file, controlled
 * via `value`/`onChange`; renders an image preview for image files and a generic
 * file chip otherwise. Validation (type/size) runs here so the user gets
 * immediate feedback before the form is submitted.
 */
export function FileDropzone({
  value,
  onChange,
  existingPreviewUrl = null,
  accept,
  maxSizeBytes,
  disabled = false,
  onRejected,
  id,
  className,
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);

  // Object URLs must be revoked to avoid leaking memory; rebuild whenever the
  // selected file changes.
  React.useEffect(() => {
    if (!value || !value.type.startsWith("image/")) {
      setObjectUrl(null);
      return;
    }

    const url = URL.createObjectURL(value);
    setObjectUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [value]);

  const previewUrl = objectUrl ?? (value ? null : existingPreviewUrl);
  const acceptAttr = accept?.join(",");

  function validate(file: File): string | null {
    if (accept && accept.length > 0 && !accept.includes(file.type)) {
      return "Formato de arquivo não suportado.";
    }
    if (maxSizeBytes && file.size > maxSizeBytes) {
      return `Arquivo muito grande (máx. ${formatBytes(maxSizeBytes)}).`;
    }
    return null;
  }

  function acceptFile(file: File | undefined) {
    if (!file) return;
    const error = validate(file);
    if (error) {
      onRejected?.(error);
      return;
    }
    onChange(file);
  }

  function openPicker() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function clearSelection(event: React.MouseEvent) {
    event.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const hasPreview = Boolean(previewUrl);
  const fileName = value?.name;

  return (
    <div className={className}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={acceptAttr}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          acceptFile(event.target.files?.[0]);
          // Allow re-selecting the same file after a removal.
          event.target.value = "";
        }}
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (disabled) return;
          acceptFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative flex min-h-[148px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-card px-4 py-6 text-center transition-colors",
          "hover:border-[var(--border-focus)] focus-visible:border-[var(--border-focus)] focus-visible:outline-none",
          isDragging && "border-[var(--border-focus)] bg-muted",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        {hasPreview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl ?? undefined}
              alt="Pré-visualização da imagem de capa"
              className="max-h-28 w-auto rounded-md object-contain"
            />
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="max-w-[220px] truncate">
                {fileName ?? "Imagem atual"}
                {value ? ` · ${formatBytes(value.size)}` : null}
              </span>
              <button
                type="button"
                onClick={clearSelection}
                disabled={disabled}
                className="inline-flex items-center gap-1 rounded text-error hover:underline"
              >
                <Icon name="x" size={14} />
                Remover
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-muted text-[var(--text-secondary)]">
              <Icon name="image-plus" size={20} />
            </span>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Arraste uma imagem ou{" "}
                <span className="text-[var(--border-focus)] underline">clique para enviar</span>
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                {accept && accept.length > 0
                  ? accept
                      .map((type) => type.replace("image/", "").toUpperCase())
                      .join(", ")
                  : "Imagem"}
                {maxSizeBytes ? ` · até ${formatBytes(maxSizeBytes)}` : null}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

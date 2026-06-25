"use client";

import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = "application/pdf,image/jpeg,image/png";

type DocumentUploadButtonProps = {
  label: string;
  pending: boolean;
  onSelect: (file: File) => void;
};

/**
 * File-picker styled as a button. Wraps a hidden <input type="file"> so a click
 * opens the OS dialog; the chosen file is handed to `onSelect`.
 */
export function DocumentUploadButton({ label, pending, onSelect }: DocumentUploadButtonProps) {
  return (
    <label
      className={cn(
        buttonVariants({ variant: "secondary", size: "sm" }),
        "shrink-0 cursor-pointer",
        pending && "pointer-events-none opacity-55",
      )}
    >
      <input
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        disabled={pending}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onSelect(file);
        }}
      />
      <Icon name={pending ? "clock" : "upload"} size={16} />
      {pending ? "Enviando..." : label}
    </label>
  );
}

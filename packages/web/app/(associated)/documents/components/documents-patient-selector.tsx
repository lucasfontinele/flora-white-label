"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type PatientOption = { id: string; name: string };

type DocumentsPatientSelectorProps = {
  patients: PatientOption[];
  selectedPatientId: string;
  onSelect: (patientId: string) => void;
};

/**
 * Patient switcher for the documents screen. Each patient managed by the
 * responsável has its own required documents and statuses, so selecting one
 * re-scopes the list below to that patient.
 */
export function DocumentsPatientSelector({
  patients,
  selectedPatientId,
  onSelect,
}: DocumentsPatientSelectorProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[var(--text-secondary)]">Selecione o paciente</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Selecionar paciente">
        {patients.map((patient) => {
          const selected = patient.id === selectedPatientId;

          return (
            <button
              key={patient.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(patient.id)}
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
  );
}

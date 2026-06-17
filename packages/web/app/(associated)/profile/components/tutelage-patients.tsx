"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { usePatientSelection } from "@/components/associated/patient-context";
import { cn } from "@/lib/utils";

// Lista todos os pacientes sob a tutela do Responsável logado. Cada cartão
// funciona como uma mini-credencial e permite selecionar o paciente ativo
// (mesmo estado do seletor do dashboard, via usePatientSelection).
export function TutelagePatients() {
  const { patients, selectedPatientId, selectPatient } = usePatientSelection();

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-heading">Pacientes sob sua tutela</h2>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            {patients.length}{" "}
            {patients.length === 1 ? "paciente vinculado" : "pacientes vinculados"} ao seu cadastro
          </p>
        </div>
        <Badge tone="petrol" className="shrink-0">
          <Icon name="users" size={14} />
          {patients.length}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {patients.map((patient) => {
          const selected = patient.id === selectedPatientId;
          const active = patient.registrationStatus === "Ativo";

          return (
            <button
              key={patient.id}
              type="button"
              onClick={() => selectPatient(patient.id)}
              data-testid={`tutelage-patient-${patient.id}`}
              aria-pressed={selected}
              className={cn(
                "rounded-lg border bg-card p-5 text-left shadow-xs transition hover:border-primary-border hover:shadow-sm",
                selected ? "border-primary ring-1 ring-primary" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={patient.name} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-base font-extrabold">{patient.name}</p>
                    <p className="mt-0.5 truncate text-sm text-[var(--text-secondary)]">
                      {patient.relationship} · {patient.condition}
                    </p>
                  </div>
                </div>
                <Badge tone={active ? "success" : "warning"} dot className="shrink-0">
                  {patient.registrationStatus}
                </Badge>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2.5">
                <Info label="Associado Nº" value={patient.memberId} mono />
                <Info label="Nascimento" value={patient.birthDate} />
                <Info label="Receita válida" value={patient.prescriptionDue} />
                <Info label="Autorização Anvisa" value={patient.anvisaDue} />
              </dl>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-bold",
                    selected ? "text-[var(--green-700)]" : "text-[var(--text-secondary)]",
                  )}
                >
                  {selected ? (
                    <>
                      <Icon name="check-circle-2" size={16} />
                      Gerenciando agora
                    </>
                  ) : (
                    "Gerenciar este paciente"
                  )}
                </span>
                {!selected ? (
                  <Icon name="chevron-right" size={18} className="text-[var(--text-tertiary)]" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0 rounded-md bg-muted p-3">
      <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-tertiary)]">
        {label}
      </dt>
      <dd className={cn("mt-0.5 truncate text-sm font-bold", mono && "font-mono")}>{value}</dd>
    </div>
  );
}

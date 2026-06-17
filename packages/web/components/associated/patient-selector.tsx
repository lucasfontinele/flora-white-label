"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useMemberAccount } from "./member-account-context";
import { usePatientSelection } from "./patient-context";
import { cn } from "@/lib/utils";

export function PatientSelector() {
  const { patients, selectedPatient, selectedPatientId, selectPatient } = usePatientSelection();
  const { applicationStatus } = useMemberAccount();

  return (
    <Card className="overflow-hidden border-[var(--petrol-700)] bg-petrol-700 text-white">
      <div className="p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white/68">Você está gerenciando</p>
            <h2 className="mt-1 text-2xl font-extrabold">{selectedPatient.name}</h2>
            <p className="mt-1 text-sm text-white/68">
              {selectedPatient.relationship} · {selectedPatient.condition}
            </p>
          </div>
          <Badge tone={selectedPatient.registrationStatus === "Ativo" ? "success" : "warning"}>
            {selectedPatient.registrationStatus}
          </Badge>
        </div>

        {applicationStatus === "pending" ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/8 px-3 py-2 text-sm font-semibold text-white">
            <Icon name="clock" size={16} className="text-[var(--accent-500)]" />
            Sua solicitação para se tornar paciente está em análise
          </div>
        ) : applicationStatus === "none" ? (
          <Link
            href="/tornar-se-paciente"
            className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/12 bg-white/8 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/14"
          >
            <Icon name="user-plus" size={16} />
            Tornar-me paciente também
          </Link>
        ) : null}

        <label className="mt-5 block md:hidden">
          <span className="mb-2 block text-sm font-bold text-white/76">Selecionar paciente</span>
          <select
            value={selectedPatientId}
            onChange={(event) => selectPatient(event.target.value)}
            className="h-11 w-full rounded-md border border-white/12 bg-white/10 px-3 text-sm font-bold text-white"
          >
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id} className="text-[var(--text-primary)]">
                {patient.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="hidden grid-cols-3 gap-3 border-t border-white/10 bg-white/6 p-3 md:grid">
        {patients.map((patient) => {
          const selected = patient.id === selectedPatientId;

          return (
            <button
              key={patient.id}
              type="button"
              data-testid={`patient-option-${patient.id}`}
              onClick={() => selectPatient(patient.id)}
              className={cn(
                "flex min-h-[92px] items-center gap-3 rounded-md border p-3 text-left transition",
                selected
                  ? "border-[var(--accent-500)] bg-white text-[var(--text-primary)] shadow-sm"
                  : "border-white/10 bg-white/8 text-white hover:bg-white/14",
              )}
            >
              <Avatar name={patient.name} inverse={!selected} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold">{patient.name}</span>
                <span className={cn("mt-1 block truncate text-xs", selected ? "text-[var(--text-secondary)]" : "text-white/62")}>
                  {patient.relationship} · {patient.condition}
                </span>
              </span>
              {selected ? <Icon name="check-circle-2" size={18} className="text-[var(--green-700)]" /> : null}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { formatCpf } from "@/lib/masks";
import { usePatients } from "../queries/use-patients";
import { patientStatusMeta } from "../status-meta";
import type { Patient, PatientStatus } from "../types";

const tabs: Array<{ value: PatientStatus; label: string }> = [
  { value: "WAITING_APPROVAL", label: "Aguardando validação" },
  { value: "WAITING_DOCUMENTS", label: "Aguardando documentos" },
  { value: "APPROVAL", label: "Aprovados" },
  { value: "REJECTED", label: "Recusados" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ApprovalsList({ organizationId }: { organizationId: string }) {
  const [status, setStatus] = useState<PatientStatus>("WAITING_APPROVAL");
  const query = usePatients(organizationId, status);
  const patients = query.data?.data ?? [];

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="max-w-2xl">
        <p className="text-sm font-bold text-[var(--green-700)]">Validação</p>
        <h2 className="mt-2 text-2xl font-extrabold">Aprovações de cadastro</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Pacientes que enviaram a documentação e aguardam validação para fazer parte da associação.
        </p>
      </section>

      <Tabs value={status} onChange={setStatus} tabs={tabs} />

      {query.isLoading ? (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 p-4 md:p-5" aria-busy="true">
                <Skeleton className="h-11 w-11 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-32" />
              </div>
            ))}
          </div>
        </Card>
      ) : query.error ? (
        <Card className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-lg">Não foi possível carregar a fila</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {query.error instanceof Error ? query.error.message : "Tente novamente."}
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => void query.refetch()}>
            Tentar novamente
          </Button>
        </Card>
      ) : patients.length === 0 ? (
        <Card className="p-10 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-muted text-[var(--text-secondary)]">
            <Icon name="clipboard-check" size={24} />
          </span>
          <h3 className="mt-4 font-heading text-lg">Nada por aqui</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Nenhum paciente {patientStatusMeta[status].label.toLowerCase()} no momento.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {patients.map((patient) => (
              <PatientRow key={patient.id} patient={patient} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function PatientRow({ patient }: { patient: Patient }) {
  const badge = patientStatusMeta[patient.patientStatus];

  return (
    <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:p-5">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-[var(--green-700)]">
        <Icon name="user" size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{patient.name}</p>
        <p className="mt-0.5 truncate text-sm text-[var(--text-secondary)]">
          CPF {formatCpf(patient.document)}
          {patient.guardianName ? ` · Responsável: ${patient.guardianName}` : ""} · Cadastrado em{" "}
          {formatDate(patient.createdAt)}
        </p>
      </div>
      <Badge tone={badge.tone} dot>
        {badge.label}
      </Badge>
      <Button asChild variant="secondary" size="sm" className="md:ml-2">
        <Link href={`/organization/operacional/approvals/${patient.id}/details`}>
          <Icon name="file-text" size={16} />
          Ver documentos
        </Link>
      </Button>
    </div>
  );
}

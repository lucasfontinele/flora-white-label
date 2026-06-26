"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PrescriptionRow } from "../types";

type PrescriptionsTableProps = {
  rows: PrescriptionRow[];
  isLoading?: boolean;
  error?: Error | null;
  onSetDate?: (row: PrescriptionRow) => void;
  onClear?: (row: PrescriptionRow) => void;
  onRetry?: () => void;
};

const columnCount = 4;

// Date-only validity stored as UTC midnight; format and compare in UTC so the
// day never shifts with the viewer's timezone.
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function isExpired(iso: string) {
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const due = new Date(iso);
  const dueUtc = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
  return dueUtc < todayUtc;
}

export function PrescriptionsTable({
  rows,
  isLoading = false,
  error,
  onSetDate,
  onClear,
  onRetry,
}: PrescriptionsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <PrescriptionsTableShell>
            {Array.from({ length: 4 }).map((_, index) => (
              <PrescriptionRowSkeleton key={index} />
            ))}
          </PrescriptionsTableShell>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-lg text-[var(--text-primary)]">
              Não foi possível carregar as receitas
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{error.message}</p>
          </div>
          {onRetry ? (
            <Button onClick={onRetry} type="button" variant="secondary">
              Tentar novamente
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <h2 className="font-heading text-lg text-[var(--text-primary)]">
            Nenhum paciente aprovado
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            A data limite da receita só pode ser definida para pacientes já aprovados. Aprove
            cadastros em Aprovações para liberá-los aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <PrescriptionsTableShell>
          {rows.map((row) => {
            const prescription = row.prescription;
            const expired = prescription ? isExpired(prescription.validUntil) : false;

            return (
              <tr key={row.patientId} className="bg-card align-top">
                <td className="px-5 py-4">
                  <div className="font-semibold text-[var(--text-primary)]">{row.patientName}</div>
                  {row.guardianName ? (
                    <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">
                      Resp.: {row.guardianName}
                    </div>
                  ) : null}
                </td>
                <td className="px-5 py-4">
                  {prescription ? (
                    <>
                      <Badge tone={expired ? "error" : "success"}>
                        {expired ? "Vencida em" : "Válida até"} {formatDate(prescription.validUntil)}
                      </Badge>
                      <div className="mt-1 text-xs text-[var(--text-tertiary)]">
                        {prescription.items.length}{" "}
                        {prescription.items.length === 1 ? "produto" : "produtos"} na posologia
                      </div>
                    </>
                  ) : (
                    <Badge tone="neutral">Não definida</Badge>
                  )}
                </td>
                <td className="px-5 py-4 text-[var(--text-secondary)]">
                  {prescription?.observations ? (
                    <span className="line-clamp-2">{prescription.observations}</span>
                  ) : (
                    <span className="text-[var(--text-tertiary)]">—</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      aria-label={`${prescription ? "Editar" : "Definir"} receita de ${row.patientName}`}
                      onClick={() => onSetDate?.(row)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      {prescription ? "Editar receita" : "Definir receita"}
                    </Button>
                    {prescription ? (
                      <Button
                        aria-label={`Limpar receita de ${row.patientName}`}
                        onClick={() => onClear?.(row)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        Limpar
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </PrescriptionsTableShell>
        <div className="border-t border-border px-5 py-3 text-xs text-[var(--text-secondary)]">
          {rows.length} {rows.length === 1 ? "paciente" : "pacientes"}
        </div>
      </CardContent>
    </Card>
  );
}

function PrescriptionsTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead className="border-b border-border bg-muted text-xs uppercase text-[var(--text-secondary)]">
          <tr>
            <th className="px-5 py-3 font-semibold">Paciente</th>
            <th className="px-5 py-3 font-semibold">Validade</th>
            <th className="px-5 py-3 font-semibold">Observações</th>
            <th className="px-5 py-3 text-right font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

function PrescriptionRowSkeleton() {
  return (
    <tr aria-busy="true" className="bg-card">
      {Array.from({ length: columnCount }).map((_, index) => (
        <td key={index} className="px-5 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

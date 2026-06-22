"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RequiredDocument } from "../types";

type RequiredDocumentsTableProps = {
  documents: RequiredDocument[];
  isLoading?: boolean;
  error?: Error | null;
  onEdit?: (document: RequiredDocument) => void;
  onDelete?: (document: RequiredDocument) => void;
  onRetry?: () => void;
};

const columnCount = 3;

export function RequiredDocumentsTable({
  documents,
  isLoading = false,
  error,
  onEdit,
  onDelete,
  onRetry,
}: RequiredDocumentsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <RequiredDocumentsTableShell>
            {Array.from({ length: 4 }).map((_, index) => (
              <RequiredDocumentRowSkeleton key={index} />
            ))}
          </RequiredDocumentsTableShell>
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
              Não foi possível carregar os documentos
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

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <h2 className="font-heading text-lg text-[var(--text-primary)]">
            Nenhum documento exigido cadastrado
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Cadastre o primeiro documento que o paciente precisará enviar para se associar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <RequiredDocumentsTableShell>
          {documents.map((document) => (
            <tr key={document.id} className="bg-card align-top">
              <td className="px-5 py-4">
                <div className="font-semibold text-[var(--text-primary)]">{document.name}</div>
              </td>
              <td className="px-5 py-4 text-[var(--text-secondary)]">
                {document.observations ? (
                  <span className="line-clamp-2">{document.observations}</span>
                ) : (
                  <span className="text-[var(--text-tertiary)]">—</span>
                )}
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <Button
                    aria-label={`Editar documento ${document.name}`}
                    onClick={() => onEdit?.(document)}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    Editar
                  </Button>
                  <Button
                    aria-label={`Remover documento ${document.name}`}
                    onClick={() => onDelete?.(document)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Remover
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </RequiredDocumentsTableShell>
        <div className="border-t border-border px-5 py-3 text-xs text-[var(--text-secondary)]">
          {documents.length} {documents.length === 1 ? "documento exigido" : "documentos exigidos"}
        </div>
      </CardContent>
    </Card>
  );
}

function RequiredDocumentsTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="border-b border-border bg-muted text-xs uppercase text-[var(--text-secondary)]">
          <tr>
            <th className="px-5 py-3 font-semibold">Documento</th>
            <th className="px-5 py-3 font-semibold">Observações</th>
            <th className="px-5 py-3 text-right font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

function RequiredDocumentRowSkeleton() {
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

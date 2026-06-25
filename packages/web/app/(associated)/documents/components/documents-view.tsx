"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { DocumentsPatientSelector } from "./documents-patient-selector";
import { DocumentUploadButton } from "./document-upload-button";
import {
  usePatientDocumentApprovals,
  useRequiredDocuments,
  useUploadPatientDocument,
} from "../queries/use-patient-documents";
import type {
  DocumentApprovalStatus,
  PatientDocumentApproval,
  PatientDocumentItem,
} from "../types";

type PatientOption = { id: string; name: string };

type DocumentsViewProps = {
  organizationId: string;
  patients: PatientOption[];
  defaultPatientId: string;
};

type StatusTone = "neutral" | "warning" | "success" | "error";

const statusInfo: Record<DocumentApprovalStatus | "MISSING", { label: string; tone: StatusTone }> = {
  MISSING: { label: "Não enviado", tone: "neutral" },
  PENDING: { label: "Em análise", tone: "warning" },
  APPROVED: { label: "Aprovado", tone: "success" },
  REJECTED: { label: "Recusado", tone: "error" },
};

export function DocumentsView({ organizationId, patients, defaultPatientId }: DocumentsViewProps) {
  const { toast } = useToast();
  const [selectedPatientId, setSelectedPatientId] = useState(defaultPatientId);

  const requiredQuery = useRequiredDocuments(organizationId);
  const approvalsQuery = usePatientDocumentApprovals(organizationId, selectedPatientId);
  const uploadMutation = useUploadPatientDocument(organizationId, selectedPatientId);

  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ?? patients[0] ?? null;

  if (!organizationId || !selectedPatient) {
    return (
      <div className="max-w-3xl pb-20 lg:pb-0">
        <Card className="p-6">
          <h2 className="font-heading text-lg text-[var(--text-primary)]">Documentos indisponíveis</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Não encontramos um paciente vinculado à sua conta para listar os documentos.
          </p>
        </Card>
      </div>
    );
  }

  const isLoading = requiredQuery.isLoading || approvalsQuery.isLoading;
  const queryError = requiredQuery.error ?? approvalsQuery.error;

  const approvalByDocument = new Map<string, PatientDocumentApproval>();
  for (const approval of approvalsQuery.data?.data ?? []) {
    approvalByDocument.set(approval.documentId, approval);
  }
  const items: PatientDocumentItem[] = (requiredQuery.data?.data ?? []).map((document) => ({
    document,
    approval: approvalByDocument.get(document.id) ?? null,
  }));

  function handleUpload(documentId: string, documentName: string, file: File) {
    uploadMutation.mutate(
      { documentId, file },
      {
        onSuccess: () =>
          toast({
            variant: "success",
            title: "Documento enviado",
            description: `${documentName} foi enviado para análise da associação.`,
          }),
      },
    );
  }

  return (
    <div className="max-w-3xl space-y-4 pb-20 lg:pb-0">
      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-[var(--green-700)]">
            <Icon name="file-text" size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold">Documentos solicitados</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Envie os documentos que a associação precisa para o processo de associação.
            </p>
          </div>
        </div>
        {patients.length > 1 ? (
          <DocumentsPatientSelector
            patients={patients}
            selectedPatientId={selectedPatient.id}
            onSelect={setSelectedPatientId}
          />
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            Paciente: <span className="font-semibold text-[var(--text-primary)]">{selectedPatient.name}</span>
          </p>
        )}
      </Card>

      {isLoading ? (
        <DocumentsSkeleton />
      ) : queryError ? (
        <Card className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg text-[var(--text-primary)]">
              Não foi possível carregar seus documentos
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {queryError instanceof Error ? queryError.message : "Tente novamente."}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void requiredQuery.refetch();
              void approvalsQuery.refetch();
            }}
          >
            Tentar novamente
          </Button>
        </Card>
      ) : items.length === 0 ? (
        <Card className="py-8">
          <h2 className="font-heading text-lg text-[var(--text-primary)]">
            Nenhum documento solicitado
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            A associação ainda não configurou documentos obrigatórios para envio.
          </p>
        </Card>
      ) : (
        items.map(({ document, approval }) => {
          const status = approval ? statusInfo[approval.status] : statusInfo.MISSING;
          const uploading =
            uploadMutation.isPending && uploadMutation.variables?.documentId === document.id;

          return (
            <Card key={document.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted text-[var(--text-secondary)]">
                <Icon name="file-text" size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{document.name}</p>
                {document.observations ? (
                  <p className="text-sm text-[var(--text-secondary)]">{document.observations}</p>
                ) : null}
                {approval?.fileName ? (
                  <p className="mt-1 truncate text-xs text-[var(--text-tertiary)]">
                    Arquivo enviado: {approval.fileName}
                  </p>
                ) : null}
                {approval?.status === "REJECTED" && approval.rejectedReason ? (
                  <p className="mt-1 text-xs text-[var(--error-600)]">Motivo: {approval.rejectedReason}</p>
                ) : null}
              </div>
              <Badge tone={status.tone} dot>
                {status.label}
              </Badge>
              <DocumentUploadButton
                label={approval ? "Reenviar" : "Enviar"}
                pending={uploading}
                onSelect={(file) => handleUpload(document.id, document.name, file)}
              />
            </Card>
          );
        })
      )}
    </div>
  );
}

function DocumentsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="flex items-center gap-4 p-4" aria-busy="true">
          <Skeleton className="h-11 w-11 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-8 w-24" />
        </Card>
      ))}
    </>
  );
}

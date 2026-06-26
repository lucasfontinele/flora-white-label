"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { formatCpf } from "@/lib/masks";
import { PrescriptionEditor, prescriptionToFormValues } from "@/components/domain/prescription-editor";
import { useProducts } from "../../products/queries/use-products";
import { PRODUCT_UNIT_LABELS } from "../../products/types";
import { RejectReasonDialog } from "./reject-reason-dialog";
import {
  usePatientApprovalDetails,
  usePatientApprovalMutations,
} from "../queries/use-patient-approval-details";
import {
  usePatientPrescription,
  useUpsertPatientPrescription,
} from "../queries/use-patient-prescription";
import type { PrescriptionWriteBody } from "../../prescriptions/types";
import { documentStatusMeta, genderLabel, patientStatusMeta } from "../status-meta";
import type { PatientDocumentApproval, RequiredDocument } from "../types";

type RejectTarget =
  | { kind: "registration" }
  | { kind: "document"; approvalId: string; documentName: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

type DetailsProps = {
  organizationId: string;
  patientId: string;
  organizationUserId: string;
};

export function PatientApprovalDetails({ organizationId, patientId, organizationUserId }: DetailsProps) {
  const { toast } = useToast();
  const query = usePatientApprovalDetails(organizationId, patientId);
  const prescriptionQuery = usePatientPrescription(organizationId, patientId);
  const productsQuery = useProducts(organizationId);
  const upsertPrescription = useUpsertPatientPrescription(organizationId, patientId);
  const { approveDocument, rejectDocument, approveRegistration, rejectRegistration } =
    usePatientApprovalMutations(organizationId, patientId);

  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);

  if (query.isLoading) {
    return <DetailsSkeleton />;
  }

  if (query.error || !query.data) {
    return (
      <div className="space-y-4">
        <BackLink />
        <Card className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-lg">Não foi possível carregar o cadastro</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {query.error instanceof Error ? query.error.message : "Tente novamente."}
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => void query.refetch()}>
            Tentar novamente
          </Button>
        </Card>
      </div>
    );
  }

  const { patient, requiredDocuments, approvals } = query.data;
  const approvalByDocument = new Map<string, PatientDocumentApproval>(
    approvals.map((approval) => [approval.documentId, approval]),
  );
  const items = requiredDocuments.map((document) => ({
    document,
    approval: approvalByDocument.get(document.id) ?? null,
  }));
  const allApproved =
    requiredDocuments.length > 0 && items.every((item) => item.approval?.status === "APPROVED");
  const status = patientStatusMeta[patient.patientStatus];
  const isPending =
    patient.patientStatus === "WAITING_DOCUMENTS" || patient.patientStatus === "WAITING_APPROVAL";
  const decisionPending = approveRegistration.isPending || rejectRegistration.isPending;

  const prescription = prescriptionQuery.data?.prescription ?? null;
  const prescriptionValid =
    prescription !== null && new Date(prescription.validUntil).getTime() > Date.now();
  const hasPosology = prescription !== null && prescription.items.length > 0;
  const prescriptionReady = prescriptionValid && hasPosology;

  const productOptions = (productsQuery.data?.data ?? [])
    .filter((product) => product.isActive)
    .map((product) => ({
      id: product.id,
      name: product.name,
      unitLabel: PRODUCT_UNIT_LABELS[product.unit],
    }));

  function handleSavePrescription(body: PrescriptionWriteBody) {
    upsertPrescription.mutate(body, {
      onSuccess: () =>
        toast({
          variant: "success",
          title: "Receita salva",
          description: `Posologia atualizada para ${patient.name}.`,
        }),
    });
  }

  function handleApproveDocument(approvalId: string, documentName: string) {
    approveDocument.mutate(
      { approvalId, organizationUserId },
      {
        onSuccess: () =>
          toast({ variant: "success", title: "Documento aprovado", description: documentName }),
      },
    );
  }

  function handleConfirmReject(reason: string) {
    if (!rejectTarget) return;

    if (rejectTarget.kind === "document") {
      rejectDocument.mutate(
        { approvalId: rejectTarget.approvalId, organizationUserId, reason },
        {
          onSuccess: () => {
            setRejectTarget(null);
            toast({ variant: "success", title: "Documento recusado", description: rejectTarget.documentName });
          },
        },
      );
      return;
    }

    rejectRegistration.mutate(
      { reason },
      {
        onSuccess: () => {
          setRejectTarget(null);
          toast({ variant: "success", title: "Cadastro recusado", description: patient.name });
        },
      },
    );
  }

  function handleApproveRegistration() {
    approveRegistration.mutate(undefined, {
      onSuccess: () =>
        toast({ variant: "success", title: "Cadastro aprovado", description: `${patient.name} agora é associado.` }),
    });
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="icon" variant="ghost" aria-label="Voltar">
          <Link href="/organization/operacional/approvals">
            <Icon name="arrow-left" size={20} />
          </Link>
        </Button>
        <h2 className="text-2xl font-extrabold">{patient.name}</h2>
        <Badge tone={status.tone} dot>
          {status.label}
        </Badge>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <Card className="p-5 md:p-6">
            <h3 className="font-heading">Dados do cadastro</h3>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Info label="Nome completo" value={patient.name} />
              <Info label="CPF" value={formatCpf(patient.document)} mono />
              <Info label="Nascimento" value={formatDate(patient.birthdate)} />
              <Info label="Gênero" value={genderLabel[patient.gender] ?? patient.gender} />
              <Info label="Hipossuficiente" value={patient.underPrivileged ? "Sim" : "Não"} />
              <Info label="Responsável" value={patient.guardianName ?? "Sem responsável"} />
              <Info label="Cadastrado em" value={formatDate(patient.createdAt)} />
            </dl>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-border p-5 md:p-6">
              <h3 className="font-heading">Documentos exigidos</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Baixe e aprove cada documento antes de aprovar o cadastro.
              </p>
            </div>
            {items.length === 0 ? (
              <p className="p-5 text-sm text-[var(--text-secondary)] md:p-6">
                A associação ainda não configurou documentos exigidos.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {items.map(({ document, approval }) => (
                  <DocumentRow
                    key={document.id}
                    document={document}
                    approval={approval}
                    approving={
                      approveDocument.isPending && approveDocument.variables?.approvalId === approval?.id
                    }
                    onApprove={() =>
                      approval && handleApproveDocument(approval.id, document.name)
                    }
                    onReject={() =>
                      approval &&
                      setRejectTarget({ kind: "document", approvalId: approval.id, documentName: document.name })
                    }
                  />
                ))}
              </div>
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-border p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-heading">Receita médica & Posologia</h3>
                {prescription ? (
                  <Badge tone={prescriptionValid ? "success" : "error"} size="sm" dot>
                    {prescriptionValid ? "Receita válida" : "Receita vencida"}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Transcreva a data de emissão (validade = +6 meses) e os limites de compra por produto.
              </p>
            </div>
            <div className="p-5 md:p-6">
              {prescriptionQuery.isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-11 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <PrescriptionEditor
                  key={prescription?.updatedAt ?? "new"}
                  products={productOptions}
                  productsLoading={productsQuery.isLoading}
                  defaultValues={prescription ? prescriptionToFormValues(prescription) : undefined}
                  pending={upsertPrescription.isPending}
                  onSubmit={handleSavePrescription}
                />
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 md:p-6">
            <h3 className="font-heading">Decisão</h3>
            {isPending ? (
              <>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Ao aprovar, o cadastro passa a fazer parte da associação como associado.
                </p>
                {!allApproved ? (
                  <p className="mt-3 flex items-start gap-2 rounded-md bg-warning-subtle p-3 text-xs text-[var(--warning-600)]">
                    <Icon name="alert-triangle" size={15} className="mt-0.5 shrink-0" />
                    Aprove todos os documentos exigidos antes de aprovar o cadastro.
                  </p>
                ) : null}
                {!prescriptionReady ? (
                  <p className="mt-3 flex items-start gap-2 rounded-md bg-warning-subtle p-3 text-xs text-[var(--warning-600)]">
                    <Icon name="alert-triangle" size={15} className="mt-0.5 shrink-0" />
                    {!prescription
                      ? "Transcreva a receita e a posologia antes de aprovar o cadastro."
                      : !prescriptionValid
                        ? "A receita está vencida. Transcreva uma receita vigente."
                        : "Adicione ao menos um produto na posologia antes de aprovar."}
                  </p>
                ) : null}
                <div className="mt-5 grid gap-3">
                  <Button
                    disabled={!allApproved || !prescriptionReady || decisionPending}
                    onClick={handleApproveRegistration}
                  >
                    <Icon name="check" size={18} />
                    {approveRegistration.isPending ? "Aprovando..." : "Aprovar cadastro"}
                  </Button>
                  <Button
                    variant="danger"
                    disabled={decisionPending}
                    onClick={() => setRejectTarget({ kind: "registration" })}
                  >
                    <Icon name="x" size={18} />
                    Recusar cadastro
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-4 flex items-start gap-3 rounded-md bg-muted p-4">
                <Icon
                  name={patient.patientStatus === "APPROVAL" ? "check-circle-2" : "alert-triangle"}
                  size={20}
                  className={
                    patient.patientStatus === "APPROVAL"
                      ? "text-[var(--success-600)]"
                      : "text-[var(--error-600)]"
                  }
                />
                <p className="text-sm text-[var(--text-secondary)]">
                  {patient.patientStatus === "APPROVAL"
                    ? "Cadastro aprovado · agora é associado."
                    : `Cadastro recusado${patient.rejectionReason ? ` · ${patient.rejectionReason}` : ""}`}
                </p>
              </div>
            )}
          </Card>

          <Card className="p-5 md:p-6">
            <h3 className="font-heading">Resumo</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Status" value={status.label} />
              <SummaryRow
                label="Documentos aprovados"
                value={`${items.filter((item) => item.approval?.status === "APPROVED").length}/${requiredDocuments.length}`}
              />
              <SummaryRow label="Cadastrado em" value={formatDate(patient.createdAt)} />
            </dl>
          </Card>
        </div>
      </section>

      <RejectReasonDialog
        open={rejectTarget !== null}
        title={rejectTarget?.kind === "document" ? "Recusar documento" : "Recusar cadastro"}
        description={
          rejectTarget?.kind === "document" ? (
            <>
              Recusar <strong>{rejectTarget.documentName}</strong>. O paciente poderá reenviar.
            </>
          ) : (
            "O paciente será notificado do motivo e o cadastro será recusado."
          )
        }
        pending={rejectTarget?.kind === "document" ? rejectDocument.isPending : rejectRegistration.isPending}
        onConfirm={handleConfirmReject}
        onCancel={() => {
          if (rejectDocument.isPending || rejectRegistration.isPending) return;
          setRejectTarget(null);
        }}
      />
    </div>
  );
}

function DocumentRow({
  document,
  approval,
  approving,
  onApprove,
  onReject,
}: {
  document: RequiredDocument;
  approval: PatientDocumentApproval | null;
  approving: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const meta = approval ? documentStatusMeta[approval.status] : documentStatusMeta.MISSING;

  return (
    <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:px-6">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-muted text-[var(--text-secondary)]">
        <Icon name="file-text" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{document.name}</p>
        {approval?.fileName ? (
          <p className="truncate text-xs text-[var(--text-secondary)]">{approval.fileName}</p>
        ) : document.observations ? (
          <p className="truncate text-xs text-[var(--text-secondary)]">{document.observations}</p>
        ) : null}
        {approval?.status === "REJECTED" && approval.rejectedReason ? (
          <p className="mt-0.5 text-xs text-[var(--error-600)]">Motivo: {approval.rejectedReason}</p>
        ) : null}
      </div>
      <Badge tone={meta.tone} size="sm">
        {meta.label}
      </Badge>
      <div className="flex flex-wrap gap-2">
        {approval?.fileUrl ? (
          <a
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            href={approval.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="download" size={16} />
            Baixar
          </a>
        ) : null}
        {approval && approval.status !== "APPROVED" ? (
          <Button size="sm" variant="secondary" disabled={approving} onClick={onApprove}>
            {approving ? "Aprovando..." : "Aprovar"}
          </Button>
        ) : null}
        {approval && approval.status !== "REJECTED" ? (
          <Button size="sm" variant="ghost" onClick={onReject}>
            Recusar
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-5">
      <BackLink />
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-3 p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
        <Card className="space-y-3 p-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </section>
    </div>
  );
}

function BackLink() {
  return (
    <Button asChild size="icon" variant="ghost" aria-label="Voltar">
      <Link href="/organization/operacional/approvals">
        <Icon name="arrow-left" size={20} />
      </Link>
    </Button>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-bold text-[var(--text-tertiary)]">{label}</dt>
      <dd className={mono ? "mt-1 font-mono font-bold" : "mt-1 font-bold"}>{value}</dd>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="font-semibold text-[var(--text-primary)]">{value}</dd>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  applicants,
  documentNames,
  getApplicantById,
  statusBadge,
  typeTone,
  type ApplicantDocument,
} from "../../data";

export function generateStaticParams() {
  return applicants.map((applicant) => ({ userId: applicant.id }));
}

export default async function ApprovalDetailsPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const applicant = getApplicantById(userId);

  if (!applicant) {
    notFound();
  }

  const status = statusBadge[applicant.status];
  const submittedDocs = applicant.documents.filter((document) => document.ok).length;

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="icon" variant="ghost" aria-label="Voltar">
          <Link href="/organization/operacional/approvals">
            <Icon name="arrow-left" size={20} />
          </Link>
        </Button>
        <h2 className="text-2xl font-extrabold">{applicant.name}</h2>
        <Badge tone={typeTone[applicant.type]}>{applicant.type}</Badge>
        <Badge tone={status.tone} dot>
          {status.label}
        </Badge>
        <Link className="ml-auto text-sm font-bold text-[var(--green-700)]" href="/organization/operacional/approvals">
          Voltar à fila
        </Link>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <Card className="p-5 md:p-6">
            <h3 className="font-heading">Dados do cadastro</h3>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Info label="Nome completo" value={applicant.name} />
              <Info label="Tipo de cadastro" value={applicant.type} />
              <Info label="E-mail" value={applicant.email} />
              <Info label="CPF" value={applicant.cpf} mono />
              <Info label="Telefone" value={applicant.phone} mono />
              <Info label="Vínculo" value={applicant.detail} />
              <Info label="Enviado em" value={applicant.submittedAt} />
              <Info label="Documentos" value={`${submittedDocs} de ${applicant.documents.length} recebidos`} />
            </dl>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-border p-5 md:p-6">
              <h3 className="font-heading">Documentos enviados</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Confira cada arquivo enviado para validação do cadastro.
              </p>
            </div>
            <div className="divide-y divide-border">
              {applicant.documents.map((document) => (
                <DocumentRow key={document.label} document={document} />
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 md:p-6">
            <h3 className="font-heading">Decisão</h3>
            {applicant.status === "pending" ? (
              <>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Ao aprovar, o cadastro passa a fazer parte da associação como associado.
                </p>
                <div className="mt-5 grid gap-3">
                  <Button>
                    <Icon name="check" size={18} />
                    Aprovar cadastro
                  </Button>
                  <Button variant="danger">
                    <Icon name="x" size={18} />
                    Recusar cadastro
                  </Button>
                </div>
              </>
            ) : (
              <div className="mt-4 flex items-start gap-3 rounded-md bg-muted p-4">
                <Icon
                  name={applicant.status === "approved" ? "check-circle-2" : "alert-triangle"}
                  size={20}
                  className={applicant.status === "approved" ? "text-[var(--success-600)]" : "text-[var(--error-600)]"}
                />
                <p className="text-sm text-[var(--text-secondary)]">{applicant.resolution}</p>
              </div>
            )}
          </Card>

          <Card className="p-5 md:p-6">
            <h3 className="font-heading">Resumo</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Status" value={status.label} />
              <SummaryRow label="Enviado em" value={applicant.submittedAt} />
              <SummaryRow label="Documentos" value={`${submittedDocs}/${applicant.documents.length}`} />
            </dl>
          </Card>
        </div>
      </section>
    </div>
  );
}

function DocumentRow({ document }: { document: ApplicantDocument }) {
  return (
    <div className="flex items-center gap-3 p-4 md:px-6">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-muted text-[var(--text-secondary)]">
        <Icon name="file-text" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{documentNames[document.label] ?? document.label}</p>
        <p className={document.ok ? "text-xs text-[var(--text-secondary)]" : "text-xs text-[var(--warning-600)]"}>
          {document.note ?? "Recebido"}
        </p>
      </div>
      <Badge tone={document.ok ? "success" : "warning"} size="sm">
        {document.ok ? "Recebido" : "Pendente"}
      </Badge>
      <Button variant="ghost" size="sm">
        Visualizar
      </Button>
    </div>
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

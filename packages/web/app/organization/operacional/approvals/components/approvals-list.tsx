"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  applicants,
  statusBadge,
  typeIcon,
  typeTone,
  type Applicant,
  type ApplicantDocument,
  type ApplicantStatus,
} from "../data";

const filters: Array<{ value: ApplicantStatus; label: string }> = [
  { value: "pending", label: "Aguardando" },
  { value: "approved", label: "Aprovados" },
  { value: "rejected", label: "Recusados" },
];

const counts = {
  pending: applicants.filter((item) => item.status === "pending").length,
  approved: applicants.filter((item) => item.status === "approved").length,
  rejected: applicants.filter((item) => item.status === "rejected").length,
};

export function ApprovalsList() {
  const [filter, setFilter] = useState<ApplicantStatus>("pending");
  const visible = applicants.filter((item) => item.status === filter);

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <section className="max-w-2xl">
        <p className="text-sm font-bold text-[var(--green-700)]">Validação</p>
        <h2 className="mt-2 text-2xl font-extrabold">Aprovações de cadastro</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Cadastros que enviaram a documentação e aguardam validação para fazer parte da associação.
        </p>
      </section>

      <Tabs
        value={filter}
        onChange={setFilter}
        tabs={filters.map((item) => ({ ...item, count: counts[item.value] }))}
      />

      {visible.length === 0 ? (
        <Card className="p-10 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-muted text-[var(--text-secondary)]">
            <Icon name="clipboard-check" size={24} />
          </span>
          <h3 className="mt-4 font-heading text-lg">Nada por aqui</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Não há cadastros {filter === "pending" ? "aguardando validação" : statusBadge[filter].label.toLowerCase()} no momento.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-border">
            {visible.map((applicant) => (
              <ApplicantRow key={applicant.id} applicant={applicant} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function ApplicantRow({ applicant }: { applicant: Applicant }) {
  const badge = statusBadge[applicant.status];
  const submittedDocs = applicant.documents.filter((document) => document.ok).length;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-[var(--green-700)]">
            <Icon name={typeIcon[applicant.type]} size={20} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-bold">{applicant.name}</p>
              <Badge tone={typeTone[applicant.type]} size="sm">
                {applicant.type}
              </Badge>
            </div>
            <p className="mt-0.5 truncate text-sm text-[var(--text-secondary)]">
              {applicant.detail} · Enviado em {applicant.submittedAt}
            </p>
          </div>
        </div>
        <Badge tone={badge.tone} dot>
          {badge.label}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-[var(--text-tertiary)]">
          {submittedDocs}/{applicant.documents.length} documentos
        </span>
        {applicant.documents.map((document) => (
          <DocChip key={document.label} document={document} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {applicant.status !== "pending" ? (
          <p className="text-sm text-[var(--text-secondary)]">{applicant.resolution}</p>
        ) : null}
        <Button asChild variant="secondary" size="sm" className="ml-auto">
          <Link href={`/organization/operacional/approvals/${applicant.id}/details`}>
            <Icon name="file-text" size={16} />
            Ver documentos
          </Link>
        </Button>
      </div>
    </div>
  );
}

function DocChip({ document }: { document: ApplicantDocument }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold",
        document.ok ? "bg-success-subtle text-[var(--success-600)]" : "bg-warning-subtle text-[var(--warning-600)]",
      )}
    >
      <Icon name={document.ok ? "check" : "alert-triangle"} size={13} />
      {document.label}
    </span>
  );
}

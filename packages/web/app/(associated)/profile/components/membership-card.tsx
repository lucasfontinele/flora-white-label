"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useMemberAccount } from "@/components/associated/member-account-context";
import { associatedUser, tenant } from "@/lib/data";
import { cn } from "@/lib/utils";

// Carteirinha digital do Responsável — comprovante de filiação à associação.
// Mantém os padrões visuais do app (superfície petrol, badges, ícones) em vez do
// layout do print de referência. Dados do responsável vêm do cenário ativo.
export function MembershipCard() {
  const { applicationStatus } = useMemberAccount();
  const responsible = associatedUser;
  const alsoPatient = applicationStatus === "approved";

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--petrol-800)] bg-gradient-to-br from-[var(--petrol-600)] via-[var(--petrol-700)] to-[var(--petrol-800)] text-white shadow-lg">
      {/* Cabeçalho da carteirinha — associação + selo de filiação */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/6 px-5 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--accent-500)] text-[var(--petrol-800)]">
            <Icon name="shield-check" size={19} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold leading-tight">{tenant.name}</p>
            <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-white/60">
              Carteirinha digital · Comprovante de filiação
            </p>
          </div>
        </div>
        <Badge tone="success" dot className="shrink-0">
          {responsible.membershipStatus}
        </Badge>
      </div>

      {/* Corpo — foto + identificação */}
      <div className="relative flex flex-col gap-5 p-5 sm:flex-row md:p-6">
        {/* Marca d'água decorativa para reforçar o aspecto de credencial */}
        <Icon
          name="id-card"
          size={150}
          className="pointer-events-none absolute -right-6 -top-6 text-white/5"
        />

        <div className="flex shrink-0 flex-col items-center gap-2">
          <div className="flex h-[176px] w-[132px] items-center justify-center overflow-hidden rounded-md border border-white/15 bg-white/8">
            <Avatar
              name={responsible.name}
              className="h-16 w-16 bg-white/15 text-xl text-white"
            />
          </div>
          <p className="text-[11px] text-white/55">Foto 3×4</p>
        </div>

        <div className="relative min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-white/60">
            {responsible.memberType}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold leading-tight">{responsible.name}</h2>

          {alsoPatient ? (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-pill bg-[var(--accent-500)]/20 px-2.5 py-1 text-xs font-semibold text-[var(--accent-300)]">
              <Icon name="check-circle-2" size={14} />
              Também é paciente
            </span>
          ) : null}

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3.5 sm:max-w-md">
            <Field label="Associado Nº" value={responsible.memberId} mono />
            <Field label="Membro desde" value={responsible.memberSince} />
            <Field label="CPF" value={responsible.document} mono />
            <Field label="Validade" value={responsible.validThrough} />
          </dl>
        </div>
      </div>

      {/* Rodapé — identificador + ação de impressão */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/4 px-5 py-3 md:px-6">
        <p className="font-mono text-xs text-white/50">
          {tenant.shortName} · ID {responsible.memberId}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.print()}
          className="border-white/20 bg-white/10 text-white shadow-none hover:border-white/30 hover:bg-white/16 hover:text-white"
        >
          <Icon name="download" size={16} />
          Imprimir carteirinha
        </Button>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-white/55">{label}</dt>
      <dd className={cn("mt-0.5 truncate text-sm font-bold text-white", mono && "font-mono")}>
        {value}
      </dd>
    </div>
  );
}

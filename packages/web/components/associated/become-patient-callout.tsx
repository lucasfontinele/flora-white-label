"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useMemberAccount } from "./member-account-context";

const BECOME_PATIENT_HREF = "/tornar-se-paciente";

// Entry point for a Responsável (Member) to apply to also become a Patient.
// `banner` is used on the dashboard; `inline` is a compact version for the profile.
export function BecomePatientCallout({ variant = "banner" }: { variant?: "banner" | "inline" }) {
  const { applicationStatus } = useMemberAccount();

  if (applicationStatus === "approved") return null;

  const pending = applicationStatus === "pending";

  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-md border p-4",
          pending ? "border-warning bg-warning-subtle" : "border-primary-border bg-primary-subtle",
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            name={pending ? "clock" : "id-card"}
            size={20}
            className={pending ? "text-[var(--warning-600)]" : "text-[var(--green-700)]"}
          />
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {pending ? "Solicitação para se tornar paciente em análise" : "Você ainda não é paciente"}
          </p>
        </div>
        {pending ? (
          <Badge tone="warning" size="sm">
            Em análise
          </Badge>
        ) : (
          <Button asChild size="sm">
            <Link href={BECOME_PATIENT_HREF}>Tornar-me paciente</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6",
        pending ? "border-warning bg-warning-subtle" : "border-primary-border bg-primary-subtle",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
            pending ? "bg-warning text-white" : "bg-primary text-primary-foreground",
          )}
        >
          <Icon name={pending ? "clock" : "id-card"} size={22} />
        </span>
        <div>
          <h2 className="font-heading text-[var(--text-primary)]">
            {pending ? "Solicitação em análise" : "Você é responsável, mas ainda não é paciente"}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {pending
              ? "Recebemos seu pedido para se tornar paciente. Avisaremos quando a associação concluir a análise."
              : "Quer receber tratamento em seu próprio nome? Faça uma solicitação para também se tornar paciente."}
          </p>
        </div>
      </div>
      {pending ? (
        <Badge tone="warning" dot>
          Em análise
        </Badge>
      ) : (
        <Button asChild className="shrink-0">
          <Link href={BECOME_PATIENT_HREF}>
            <Icon name="user-plus" size={18} />
            Tornar-me paciente
          </Link>
        </Button>
      )}
    </Card>
  );
}

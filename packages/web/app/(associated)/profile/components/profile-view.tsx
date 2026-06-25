"use client";

import { BecomePatientCallout } from "@/components/associated/become-patient-callout";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon";
import { associatedUser, tenant } from "@/lib/data";
import { MembershipCard } from "./membership-card";
import { TutelagePatients } from "./tutelage-patients";

export function ProfileView() {
  const responsible = associatedUser;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <MembershipCard />

        <Card className="flex flex-col p-5 md:p-6">
          <h2 className="font-heading">Dados do responsável</h2>
          <dl className="mt-4 space-y-3">
            <Contact icon="mail" label="E-mail" value={responsible.email} />
            <Contact icon="phone" label="Telefone" value={responsible.phone} />
            <Contact icon="store" label="Associação" value={tenant.name} />
            <Contact icon="calendar" label="Membro desde" value={responsible.memberSince} />
          </dl>
          <div className="mt-auto pt-5">
            <BecomePatientCallout variant="inline" />
          </div>
        </Card>
      </div>

      <TutelagePatients />
    </div>
  );
}

function Contact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-[var(--text-secondary)]">
        <Icon name={icon} size={17} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-bold text-[var(--text-tertiary)]">{label}</dt>
        <dd className="truncate font-bold">{value}</dd>
      </div>
    </div>
  );
}

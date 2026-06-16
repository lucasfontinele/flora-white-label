"use client";

import { usePatientSelection } from "@/components/associated/patient-context";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { associatedUser, tenant } from "@/lib/data";

export function ProfileView() {
  const { selectedPatient } = usePatientSelection();

  return (
    <div className="grid max-w-4xl gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="p-6">
        <Avatar name={associatedUser.name} size="lg" />
        <h2 className="mt-5 text-2xl font-extrabold">{associatedUser.name}</h2>
        <p className="mt-1 text-[var(--text-secondary)]">{associatedUser.email}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="success" dot>
            Cadastro ativo
          </Badge>
          <Badge tone="primary">{associatedUser.since}</Badge>
        </div>
      </Card>
      <Card className="p-6">
        <h2 className="font-heading">Paciente gerenciado</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <Info label="Paciente" value={selectedPatient.name} />
          <Info label="Vínculo" value={selectedPatient.relationship} />
          <Info label="Condição" value={selectedPatient.condition} />
          <Info label="Nascimento" value={selectedPatient.birthDate} />
          <Info label="Associação" value={tenant.name} />
          <Info label="Cadastro" value={selectedPatient.registrationStatus} />
          <Info label="Receita" value={selectedPatient.prescriptionDue} />
          <Info label="Autorização Anvisa" value={selectedPatient.anvisaDue} />
        </dl>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted p-4">
      <dt className="text-xs font-bold text-[var(--text-tertiary)]">{label}</dt>
      <dd className="mt-1 font-bold">{value}</dd>
    </div>
  );
}

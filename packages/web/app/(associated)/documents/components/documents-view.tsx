"use client";

import { usePatientSelection } from "@/components/associated/patient-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useDocumentsQuery } from "../queries/use-documents-query";

const toneMap = {
  Aprovado: "success",
  "Em análise": "warning",
  Recusado: "error",
} as const;

export function DocumentsView() {
  const { selectedPatient } = usePatientSelection();
  const { data = [] } = useDocumentsQuery(selectedPatient.id);

  return (
    <div className="max-w-3xl space-y-4 pb-20 lg:pb-0">
      <Card className="flex items-center gap-3 p-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-subtle text-[var(--green-700)]">
          <Icon name="user" size={18} />
        </span>
        <div>
          <p className="text-sm font-bold">Documentos de {selectedPatient.name}</p>
          <p className="text-sm text-[var(--text-secondary)]">
            Receita, laudo e autorizações vinculados ao paciente selecionado.
          </p>
        </div>
      </Card>
      {data.map((document) => (
        <Card key={document.name} className="flex items-center gap-4 p-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted text-[var(--text-secondary)]">
            <Icon name="file-text" size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{document.name}</p>
            <p className="truncate text-sm text-[var(--text-secondary)]">{document.due}</p>
          </div>
          <Badge tone={toneMap[document.status]} dot>
            {document.status}
          </Badge>
          <Button className="hidden sm:inline-flex" size="sm" variant="ghost">
            <Icon name="download" size={16} />
            Baixar
          </Button>
        </Card>
      ))}
      <Button variant="secondary">
        <Icon name="upload" size={18} />
        Enviar novo documento
      </Button>
    </div>
  );
}

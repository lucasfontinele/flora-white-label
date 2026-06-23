import type { BadgeProps } from "@/components/ui/badge";
import type { DocumentApprovalStatus, PatientStatus } from "./types";

type Tone = NonNullable<BadgeProps["tone"]>;

export const patientStatusMeta: Record<PatientStatus, { label: string; tone: Tone }> = {
  WAITING_DOCUMENTS: { label: "Aguardando documentos", tone: "neutral" },
  WAITING_APPROVAL: { label: "Aguardando validação", tone: "warning" },
  APPROVAL: { label: "Aprovado", tone: "success" },
  REJECTED: { label: "Recusado", tone: "error" },
};

export const documentStatusMeta: Record<DocumentApprovalStatus | "MISSING", { label: string; tone: Tone }> = {
  MISSING: { label: "Não enviado", tone: "neutral" },
  PENDING: { label: "Em análise", tone: "warning" },
  APPROVED: { label: "Aprovado", tone: "success" },
  REJECTED: { label: "Recusado", tone: "error" },
};

export const genderLabel: Record<string, string> = {
  M: "Masculino",
  F: "Feminino",
  O: "Outro",
  "N/A": "Não informado",
};

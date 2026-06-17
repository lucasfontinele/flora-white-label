import type { BadgeProps } from "@/components/ui/badge";
import type { IconName } from "@/components/ui/icon";

export type ApplicantStatus = "pending" | "approved" | "rejected";
export type ApplicantType = "Responsável" | "Paciente" | "Tutor de PET";

export type ApplicantDocument = { label: string; ok: boolean; note?: string };

export type Applicant = {
  id: string;
  name: string;
  type: ApplicantType;
  detail: string;
  email: string;
  cpf: string;
  phone: string;
  submittedAt: string;
  documents: ApplicantDocument[];
  status: ApplicantStatus;
  resolution?: string;
};

// Front-end prototype — static mock data shared by the list and the details screen.
// Replace with the real validation queue/API later.
export const applicants: Applicant[] = [
  {
    id: "app_camila",
    name: "Camila Duarte",
    type: "Responsável",
    detail: "Responsável por João Silva",
    email: "camila.duarte@email.com",
    cpf: "324.118.905-12",
    phone: "(63) 99114-2200",
    submittedAt: "16 jun 2026",
    documents: [
      { label: "Identidade", ok: true },
      { label: "Comprovante", ok: true },
      { label: "Receita", ok: true },
      { label: "CPF", ok: true },
    ],
    status: "pending",
  },
  {
    id: "app_rafael",
    name: "Rafael Moreira",
    type: "Paciente",
    detail: "Tratamento próprio · dor crônica",
    email: "rafael.moreira@email.com",
    cpf: "118.402.337-90",
    phone: "(11) 98822-7710",
    submittedAt: "16 jun 2026",
    documents: [
      { label: "Identidade", ok: true },
      { label: "Comprovante", ok: true },
      { label: "Receita", ok: true },
      { label: "CPF", ok: true },
    ],
    status: "pending",
  },
  {
    id: "app_helena",
    name: "Helena Castro",
    type: "Tutor de PET",
    detail: "PET Thor · Canina",
    email: "helena.castro@email.com",
    cpf: "905.221.448-03",
    phone: "(62) 99650-1180",
    submittedAt: "15 jun 2026",
    documents: [
      { label: "Identidade", ok: true },
      { label: "Comprovante", ok: true },
      { label: "Receita", ok: false, note: "Aguardando reenvio — receita ilegível" },
      { label: "CPF", ok: true },
    ],
    status: "pending",
  },
  {
    id: "app_bruno",
    name: "Bruno Tavares",
    type: "Paciente",
    detail: "Tratamento próprio · ansiedade",
    email: "bruno.tavares@email.com",
    cpf: "447.880.112-55",
    phone: "(81) 99771-3322",
    submittedAt: "15 jun 2026",
    documents: [
      { label: "Identidade", ok: true },
      { label: "Comprovante", ok: true },
      { label: "Receita", ok: true },
      { label: "CPF", ok: true },
    ],
    status: "pending",
  },
  {
    id: "app_marina",
    name: "Marina Lopes",
    type: "Responsável",
    detail: "Responsável por Antônio Lopes",
    email: "marina.lopes@email.com",
    cpf: "210.559.874-41",
    phone: "(85) 98410-9001",
    submittedAt: "14 jun 2026",
    documents: [
      { label: "Identidade", ok: true },
      { label: "Comprovante", ok: true },
      { label: "Receita", ok: true },
      { label: "CPF", ok: true },
    ],
    status: "pending",
  },
  {
    id: "app_diego",
    name: "Diego Ramos",
    type: "Paciente",
    detail: "Tratamento próprio · epilepsia",
    email: "diego.ramos@email.com",
    cpf: "667.013.229-08",
    phone: "(47) 99230-5567",
    submittedAt: "12 jun 2026",
    documents: [
      { label: "Identidade", ok: true },
      { label: "Comprovante", ok: true },
      { label: "Receita", ok: true },
      { label: "CPF", ok: true },
    ],
    status: "approved",
    resolution: "Aprovado em 13 jun 2026 · agora é associado",
  },
  {
    id: "app_patricia",
    name: "Patrícia Nunes",
    type: "Responsável",
    detail: "Responsável por Sofia Nunes",
    email: "patricia.nunes@email.com",
    cpf: "532.770.106-74",
    phone: "(31) 98155-6643",
    submittedAt: "10 jun 2026",
    documents: [
      { label: "Identidade", ok: true },
      { label: "Comprovante", ok: true },
      { label: "Receita", ok: true },
      { label: "CPF", ok: true },
    ],
    status: "approved",
    resolution: "Aprovado em 11 jun 2026 · agora é associado",
  },
  {
    id: "app_gustavo",
    name: "Gustavo Pires",
    type: "Paciente",
    detail: "Tratamento próprio · insônia",
    email: "gustavo.pires@email.com",
    cpf: "098.334.521-60",
    phone: "(51) 99012-8845",
    submittedAt: "09 jun 2026",
    documents: [
      { label: "Identidade", ok: true },
      { label: "Comprovante", ok: false, note: "Comprovante de residência ilegível" },
      { label: "Receita", ok: true },
      { label: "CPF", ok: true },
    ],
    status: "rejected",
    resolution: "Recusado em 10 jun 2026 · comprovante de residência ilegível",
  },
];

export function getApplicantById(id: string) {
  return applicants.find((applicant) => applicant.id === id);
}

export const documentNames: Record<string, string> = {
  Identidade: "Documento de identidade",
  Comprovante: "Comprovante de residência",
  Receita: "Receita médica",
  CPF: "CPF",
};

export const typeTone: Record<ApplicantType, BadgeProps["tone"]> = {
  Responsável: "primary",
  Paciente: "info",
  "Tutor de PET": "accent",
};

export const typeIcon: Record<ApplicantType, IconName> = {
  Responsável: "users",
  Paciente: "user",
  "Tutor de PET": "shield-check",
};

export const statusBadge: Record<ApplicantStatus, { label: string; tone: BadgeProps["tone"] }> = {
  pending: { label: "Aguardando validação", tone: "warning" },
  approved: { label: "Aprovado", tone: "success" },
  rejected: { label: "Recusado", tone: "error" },
};

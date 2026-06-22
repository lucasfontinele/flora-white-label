import { ManagementList } from "@/components/domain/management-list";

const records = [
  { title: "João Silva", description: "Paciente · tutor Camila Duarte", meta: "Cadastro ativo", status: "Documentos OK", tone: "success" as const },
  { title: "Ana Reis", description: "Titular · unidade Centro", meta: "Atualizado hoje", status: "Em análise", tone: "warning" as const },
  { title: "Carlos Nunes", description: "Titular · retirada na sede", meta: "Desde 2025", status: "Ativo", tone: "success" as const },
  { title: "Beatriz Alves", description: "Titular · envio por correio", meta: "Desde 2024", status: "Ativo", tone: "success" as const },
];

export default function MembersPage() {
  return (
    <ManagementList
      eyebrow="Cadastro"
      heading="Associados e pacientes"
      description="Consulte titulares, tutores, pacientes vinculados e situação documental."
      action="Novo associado"
      icon="users"
      records={records}
    />
  );
}

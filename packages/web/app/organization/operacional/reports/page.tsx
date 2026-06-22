import { ManagementList } from "@/components/domain/management-list";

const records = [
  { title: "Pedidos por status", description: "Volume mensal e gargalos operacionais", meta: "Jun 2026", status: "Atualizado", tone: "success" as const },
  { title: "Associados ativos", description: "Crescimento e cadastros em análise", meta: "1.284", status: "Atualizado", tone: "success" as const },
  { title: "Estoque baixo", description: "Itens abaixo do mínimo definido", meta: "3 itens", status: "Ação", tone: "warning" as const },
  { title: "Documentos pendentes", description: "Receitas, laudos e autorizações", meta: "7 docs", status: "Fila", tone: "info" as const },
];

export default function ReportsPage() {
  return (
    <ManagementList
      eyebrow="Diretoria"
      heading="Relatórios"
      description="Indicadores executivos para acompanhamento de operação e governança."
      action="Exportar relatório"
      icon="bar-chart-3"
      records={records}
    />
  );
}

import { ManagementList } from "@/components/domain/management-list";

const records = [
  { title: "Unidade Centro", description: "Óleo CBD 17% - 30ml", meta: "4 un.", status: "Crítico", tone: "error" as const },
  { title: "Unidade Centro", description: "Pomada CBD 500mg", meta: "9 un.", status: "Baixo", tone: "warning" as const },
  { title: "Estoque principal", description: "Harlequin - flor 5g", meta: "46 g", status: "Disponível", tone: "success" as const },
  { title: "Estoque principal", description: "Cannatonic - óleo 30ml", meta: "38 un.", status: "Disponível", tone: "success" as const },
];

export default function InventoryPage() {
  return (
    <ManagementList
      eyebrow="Rastreabilidade"
      heading="Estoque"
      description="Acompanhe saldo por unidade, lote e alertas de reposição."
      action="Registrar entrada"
      icon="boxes"
      records={records}
    />
  );
}

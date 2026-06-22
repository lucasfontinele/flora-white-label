import { ManagementList } from "@/components/domain/management-list";

const records = [
  { title: "Óleo CBD 17% - 30ml", description: "Produto dispensado · lote CBD-2406", meta: "4 un.", status: "Estoque baixo", tone: "error" as const },
  { title: "Pomada CBD 500mg", description: "Produto tópico · lote POM-2405", meta: "9 un.", status: "Repor", tone: "warning" as const },
  { title: "Charlotte's Web - flor 5g", description: "Flor seca · lote CW-2406", meta: "12 g", status: "Repor", tone: "warning" as const },
  { title: "Cannatonic - óleo 30ml", description: "Produto educativo no catálogo", meta: "38 un.", status: "Disponível", tone: "success" as const },
];

export default function ProductsPage() {
  return (
    <ManagementList
      eyebrow="Catálogo operacional"
      heading="Produtos"
      description="Controle produtos, lotes, saldos e disponibilidade para pedidos."
      action="Novo produto"
      icon="package"
      records={records}
    />
  );
}

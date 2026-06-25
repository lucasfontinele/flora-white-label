import type { OperationalDashboardDto } from "@flora/shared/operational-dashboard";
import type { OperationalDashboardRepository } from "../../application/operational-dashboard/operational-dashboard-repository.js";

/**
 * Serves representative operational metrics while orders, products and inventory
 * are not yet modeled in the database. When those domains are persisted, replace
 * this with a Prisma-backed repository that satisfies the same contract.
 */
const summary: OperationalDashboardDto = {
  lowStock: [
    { amount: "4 un.", name: "Óleo CBD 17% - 30ml", tone: "error" },
    { amount: "9 un.", name: "Pomada CBD 500mg", tone: "warning" },
    { amount: "12 g", name: "Charlotte's Web - flor", tone: "warning" },
  ],
  metrics: [
    { delta: "+4", hint: "aguardando ação", icon: "inbox", label: "Pedidos pendentes", value: "12" },
    { delta: "0", hint: "hoje", icon: "package-open", label: "Em separação", value: "9" },
    { delta: "+6", hint: "esta semana", icon: "truck", label: "Enviados", tone: "success", value: "14" },
    { delta: "+38", hint: "no mês", icon: "users", label: "Associados ativos", tone: "success", value: "1.284" },
    { delta: "+1", hint: "repor", icon: "alert-triangle", label: "Estoque baixo", tone: "error", value: "3" },
    { delta: "-2", hint: "fila", icon: "file-check", label: "Documentos p/ análise", value: "7" },
  ],
  ordersByStatus: [
    { count: 12, status: "Solicitado" },
    { count: 8, status: "Em análise" },
    { count: 6, status: "Aprovado" },
    { count: 9, status: "Em separação" },
    { count: 5, status: "Pronto para retirada" },
    { count: 14, status: "Enviado" },
    { count: 75, status: "Entregue" },
  ],
  referenceLabel: "Junho 2026",
};

export class InMemoryOperationalDashboardRepository implements OperationalDashboardRepository {
  async getSummary(): Promise<OperationalDashboardDto> {
    return summary;
  }
}

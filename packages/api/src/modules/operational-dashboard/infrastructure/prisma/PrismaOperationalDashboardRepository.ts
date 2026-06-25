import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  OperationalDashboardRepository,
  OperationalDashboardSummary,
  OperationalLowStockItem,
  OperationalMetric,
  OperationalOrderStatus,
  OperationalOrdersByStatus,
} from "../../application/repositories/OperationalDashboardRepository.js";

// Order the status bars and map each Prisma OrderStatus to the label the screen
// renders. CANCELLED is intentionally omitted (not shown on the dashboard).
const ORDER_STATUS_SEQUENCE: ReadonlyArray<{ key: string; label: OperationalOrderStatus }> = [
  { key: "REQUESTED", label: "Solicitado" },
  { key: "UNDER_REVIEW", label: "Em análise" },
  { key: "APPROVED", label: "Aprovado" },
  { key: "IN_SEPARATION", label: "Em separação" },
  { key: "READY_FOR_PICKUP", label: "Pronto para retirada" },
  { key: "SHIPPED", label: "Enviado" },
  { key: "DELIVERED", label: "Entregue" },
];

const UNIT_LABEL: Record<string, string> = { GRAM: "g", MILLILITER: "ml", UNIT: "un." };

const MAX_LOW_STOCK_ITEMS = 6;

function ptNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

function referenceLabelFor(date: Date): string {
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}

/**
 * Computes the operational overview from live data: orders by status, patient
 * counts and inventory below the minimum. Replaces the previous static payload.
 */
export class PrismaOperationalDashboardRepository implements OperationalDashboardRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async getSummary(organizationId: string): Promise<OperationalDashboardSummary> {
    const client = this.prisma.getClient();

    const [ordersGrouped, inventory, activePatients, pendingDocPatients] = await Promise.all([
      client.order.groupBy({
        by: ["status"],
        where: { organizationId },
        _count: { _all: true },
      }),
      client.inventoryItem.findMany({
        where: { organizationId },
        select: {
          availableQuantity: true,
          minimumQuantity: true,
          product: { select: { name: true, unit: true } },
        },
        orderBy: { availableQuantity: "asc" },
      }),
      // Approved associates and the documents-review queue, by patient status.
      client.patient.count({ where: { organizationId, patientStatus: "APPROVAL" } }),
      client.patient.count({ where: { organizationId, patientStatus: "WAITING_APPROVAL" } }),
    ]);

    const ordersByStatusCount = new Map<string, number>();
    for (const row of ordersGrouped) {
      ordersByStatusCount.set(row.status, row._count._all);
    }
    const orderCount = (key: string): number => ordersByStatusCount.get(key) ?? 0;

    const lowStock = inventory.filter((item) => item.availableQuantity <= item.minimumQuantity);

    const ordersByStatus: OperationalOrdersByStatus[] = ORDER_STATUS_SEQUENCE.map(
      ({ key, label }) => ({ status: label, count: orderCount(key) }),
    );

    const pendingOrders = orderCount("REQUESTED") + orderCount("UNDER_REVIEW");

    const metrics: OperationalMetric[] = [
      { label: "Pedidos pendentes", value: ptNumber(pendingOrders), icon: "inbox", delta: "", hint: "aguardando ação" },
      { label: "Em separação", value: ptNumber(orderCount("IN_SEPARATION")), icon: "package-open", delta: "", hint: "em preparo" },
      { label: "Enviados", value: ptNumber(orderCount("SHIPPED")), icon: "truck", delta: "", hint: "no total", tone: "success" },
      { label: "Associados ativos", value: ptNumber(activePatients), icon: "users", delta: "", hint: "aprovados", tone: "success" },
      {
        label: "Estoque baixo",
        value: ptNumber(lowStock.length),
        icon: "alert-triangle",
        delta: "",
        hint: "abaixo do mínimo",
        ...(lowStock.length > 0 ? { tone: "error" as const } : {}),
      },
      { label: "Documentos p/ análise", value: ptNumber(pendingDocPatients), icon: "file-check", delta: "", hint: "para validar" },
    ];

    const lowStockItems: OperationalLowStockItem[] = lowStock.slice(0, MAX_LOW_STOCK_ITEMS).map((item) => ({
      name: item.product.name,
      amount: `${ptNumber(item.availableQuantity)} ${UNIT_LABEL[item.product.unit] ?? "un."}`,
      tone: item.availableQuantity === 0 ? "error" : "warning",
    }));

    return {
      lowStock: lowStockItems,
      metrics,
      ordersByStatus,
      referenceLabel: referenceLabelFor(new Date()),
    };
  }
}

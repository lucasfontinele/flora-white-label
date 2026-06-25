import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  MasterMetric,
  MasterNetworkHealthItem,
  MasterPlanDistributionItem,
  MasterRecentOrganization,
  MasterReports,
  MasterReportsFilter,
  MasterReportsRepository,
} from "../../application/repositories/MasterReportsRepository.js";

const PT_MONTH_SHORT = [
  "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez",
];

const RECENT_ORGANIZATIONS_LIMIT = 5;

// Payment states that represent money actually collected — used for the
// average-ticket health indicator.
const SETTLED_PAYMENT_STATUSES = ["PAID", "APPROVED", "REDEEMED"] as const;

function ptNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

/** Compact BRL for large headline figures, e.g. 28460000 → "R$ 284,6 mil". */
function brlCompact(cents: number): string {
  const reais = cents / 100;

  if (reais >= 1000) {
    const thousands = reais / 1000;
    return `R$ ${thousands.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} mil`;
  }

  return `R$ ${reais.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
}

/** Rounded BRL for per-unit figures, e.g. 31234 → "R$ 312". */
function brl(cents: number): string {
  return `R$ ${Math.round(cents / 100).toLocaleString("pt-BR")}`;
}

function shortDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${PT_MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

function referenceLabelFor(date: Date): string {
  const month = date.toLocaleDateString("pt-BR", { month: "long" });
  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}

function monthLabel(date: Date): string {
  const label = PT_MONTH_SHORT[date.getMonth()] ?? "";
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

function positiveDelta(count: number): string {
  return count > 0 ? `+${ptNumber(count)}` : "";
}

/**
 * Computes the consolidated network reports from live data. Every query is
 * scoped by the optional organization filter — `undefined` filter values are
 * ignored by Prisma, so an empty filter naturally spans the whole network.
 */
export class PrismaMasterReportsRepository implements MasterReportsRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async getReports(filter: MasterReportsFilter): Promise<MasterReports> {
    const client = this.prisma.getClient();
    const ids = filter.organizationIds;
    const inIds = ids.length > 0 ? { in: ids } : undefined;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Six-month window: cumulative organization totals by the end of each month,
    // oldest first. Each month's count is "created before the first day of the
    // following month"; for the current month that upper bound is in the future,
    // so it naturally resolves to the live total.
    const monthBoundaries = Array.from({ length: 6 }, (_, index) => {
      const offset = 5 - index;
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const upperBoundExclusive = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
      return { label: monthLabel(monthDate), upperBoundExclusive };
    });

    const [
      organizationsThisMonth,
      patientsCount,
      patientsThisMonth,
      operatorsCount,
      operatorsThisMonth,
      pendingActivations,
      approvedPatients,
      ordersCount,
      ordersThisMonth,
      deliveredOrders,
      ticketAggregate,
      organizationsWithPlan,
      recentOrganizations,
      monthlyCounts,
    ] = await Promise.all([
      client.organization.count({ where: { id: inIds, createdAt: { gte: monthStart } } }),
      client.patient.count({ where: { organizationId: inIds } }),
      client.patient.count({ where: { organizationId: inIds, createdAt: { gte: monthStart } } }),
      client.organizationEmployee.count({ where: { organizationId: inIds, isActive: true } }),
      client.organizationEmployee.count({
        where: { organizationId: inIds, isActive: true, createdAt: { gte: monthStart } },
      }),
      client.patient.count({ where: { organizationId: inIds, patientStatus: "WAITING_APPROVAL" } }),
      client.patient.count({ where: { organizationId: inIds, patientStatus: "APPROVAL" } }),
      client.order.count({ where: { organizationId: inIds } }),
      client.order.count({ where: { organizationId: inIds, createdAt: { gte: monthStart } } }),
      client.order.count({ where: { organizationId: inIds, status: "DELIVERED" } }),
      client.orderPayment.aggregate({
        where: { organizationId: inIds, status: { in: [...SETTLED_PAYMENT_STATUSES] } },
        _avg: { totalPaidInCents: true },
      }),
      client.organization.findMany({
        where: { id: inIds },
        select: { currentPlan: { select: { title: true, priceInCents: true } } },
      }),
      client.organization.findMany({
        where: { id: inIds },
        orderBy: { createdAt: "desc" },
        take: RECENT_ORGANIZATIONS_LIMIT,
        select: {
          tradeName: true,
          createdAt: true,
          currentPlan: { select: { title: true } },
          address: { select: { city: true, state: true } },
        },
      }),
      Promise.all(
        monthBoundaries.map((boundary) =>
          client.organization.count({
            where: { id: inIds, createdAt: { lt: boundary.upperBoundExclusive } },
          }),
        ),
      ),
    ]);

    const organizationsCount = organizationsWithPlan.length;
    const mrrInCents = organizationsWithPlan.reduce(
      (total, organization) => total + organization.currentPlan.priceInCents,
      0,
    );

    const metrics = this.buildMetrics({
      organizationsCount,
      organizationsThisMonth,
      patientsCount,
      patientsThisMonth,
      operatorsCount,
      operatorsThisMonth,
      ordersCount,
      ordersThisMonth,
      pendingActivations,
      mrrInCents,
    });

    return {
      metrics,
      monthlyOrganizations: {
        points: monthBoundaries.map((boundary, index) => ({
          month: boundary.label,
          value: monthlyCounts[index] ?? 0,
        })),
        growthLabel: this.semesterGrowthLabel(monthlyCounts),
      },
      planDistribution: this.buildPlanDistribution(organizationsWithPlan, organizationsCount),
      recentOrganizations: recentOrganizations.map(
        (organization): MasterRecentOrganization => ({
          tradeName: organization.tradeName,
          city: organization.address.city,
          state: organization.address.state,
          plan: organization.currentPlan.title,
          createdAt: shortDate(organization.createdAt),
        }),
      ),
      networkHealth: this.buildNetworkHealth({
        averageTicketInCents: ticketAggregate._avg.totalPaidInCents ?? 0,
        approvedPatients,
        patientsCount,
        deliveredOrders,
        ordersCount,
      }),
      referenceLabel: referenceLabelFor(now),
    };
  }

  private buildMetrics(input: {
    organizationsCount: number;
    organizationsThisMonth: number;
    patientsCount: number;
    patientsThisMonth: number;
    operatorsCount: number;
    operatorsThisMonth: number;
    ordersCount: number;
    ordersThisMonth: number;
    pendingActivations: number;
    mrrInCents: number;
  }): MasterMetric[] {
    return [
      {
        label: "Organizações ativas",
        value: ptNumber(input.organizationsCount),
        icon: "store",
        delta: positiveDelta(input.organizationsThisMonth),
        hint: "novas no mês",
        ...(input.organizationsThisMonth > 0 ? { tone: "success" as const } : {}),
      },
      {
        label: "Associados na rede",
        value: ptNumber(input.patientsCount),
        icon: "users",
        delta: positiveDelta(input.patientsThisMonth),
        hint: "no mês",
        ...(input.patientsThisMonth > 0 ? { tone: "success" as const } : {}),
      },
      {
        label: "Operadores ativos",
        value: ptNumber(input.operatorsCount),
        icon: "shield-check",
        delta: positiveDelta(input.operatorsThisMonth),
        hint: "no mês",
        ...(input.operatorsThisMonth > 0 ? { tone: "success" as const } : {}),
      },
      {
        label: "Receita recorrente (MRR)",
        value: brlCompact(input.mrrInCents),
        icon: "bar-chart-3",
        delta: "",
        hint: "assinaturas ativas",
      },
      {
        label: "Pedidos processados",
        value: ptNumber(input.ordersCount),
        icon: "package",
        delta: positiveDelta(input.ordersThisMonth),
        hint: "no mês",
        ...(input.ordersThisMonth > 0 ? { tone: "success" as const } : {}),
      },
      {
        label: "Ativações pendentes",
        value: ptNumber(input.pendingActivations),
        icon: "clock",
        delta: "",
        hint: "aguardando liberação",
        ...(input.pendingActivations > 0 ? { tone: "error" as const } : {}),
      },
    ];
  }

  private buildPlanDistribution(
    organizations: ReadonlyArray<{ currentPlan: { title: string } }>,
    total: number,
  ): MasterPlanDistributionItem[] {
    const counts = new Map<string, number>();
    for (const organization of organizations) {
      const title = organization.currentPlan.title;
      counts.set(title, (counts.get(title) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([name, organizationsCount]) => ({
        name,
        organizations: organizationsCount,
        percentage: total > 0 ? Math.round((organizationsCount / total) * 100) : 0,
      }))
      .sort((a, b) => b.organizations - a.organizations);
  }

  private buildNetworkHealth(input: {
    averageTicketInCents: number;
    approvedPatients: number;
    patientsCount: number;
    deliveredOrders: number;
    ordersCount: number;
  }): MasterNetworkHealthItem[] {
    const approvalRate =
      input.patientsCount > 0
        ? Math.round((input.approvedPatients / input.patientsCount) * 100)
        : 0;
    const deliveredRate =
      input.ordersCount > 0 ? Math.round((input.deliveredOrders / input.ordersCount) * 100) : 0;

    return [
      {
        label: "Ticket médio por pedido",
        value: brl(input.averageTicketInCents),
        icon: "bar-chart-3",
      },
      {
        label: "Aprovação de cadastros",
        value: `${approvalRate}%`,
        icon: "check-circle-2",
      },
      {
        label: "Pedidos entregues",
        value: `${deliveredRate}%`,
        icon: "package-check",
      },
    ];
  }

  private semesterGrowthLabel(monthlyCounts: number[]): string {
    const first = monthlyCounts[0] ?? 0;
    const last = monthlyCounts[monthlyCounts.length - 1] ?? 0;

    if (first > 0) {
      const percentage = Math.round(((last - first) / first) * 100);
      return `${percentage >= 0 ? "+" : ""}${percentage}% no semestre`;
    }

    if (last > 0) {
      return `+${ptNumber(last)} no semestre`;
    }

    return "";
  }
}

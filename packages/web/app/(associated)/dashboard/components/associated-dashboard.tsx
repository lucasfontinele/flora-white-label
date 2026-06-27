"use client";

import Link from "next/link";
import { BecomePatientCallout } from "@/components/associated/become-patient-callout";
import { PatientSelector } from "@/components/associated/patient-selector";
import { SessionSync } from "@/components/associated/session-sync";
import { usePatientSelection } from "@/components/associated/patient-context";
import { OrderCard } from "@/components/domain/order-card";
import { OrderTimeline } from "@/components/domain/order-timeline";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import type { AssociatedOrder, OrderStatus } from "@/lib/data";
import { useDashboardQuery } from "../queries/use-dashboard-query";
import {
  DASHBOARD_ORDER_STATUS_LABELS,
  TERMINAL_ORDER_STATUSES,
  type DashboardOrder,
  type DashboardOrderStatus,
} from "../types";

const ORDER_STATUS_TONE: Record<DashboardOrderStatus, BadgeProps["tone"]> = {
  REQUESTED: "neutral",
  UNDER_REVIEW: "warning",
  IN_SEPARATION: "info",
  APPROVED: "primary",
  READY_FOR_PICKUP: "accent",
  SHIPPED: "petrol",
  DELIVERED: "success",
  CANCELLED: "error",
};

// Date-only values (prescription validity, order date) are formatted in UTC so
// the day never shifts with the viewer's timezone.
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Adapts a real order to the mock-shaped `AssociatedOrder` consumed by the
// shared OrderCard. The status label maps cleanly onto the card's stages.
function toAssociatedOrder(order: DashboardOrder): AssociatedOrder {
  return {
    id: order.id,
    patientId: order.patientId,
    number: order.token,
    status: DASHBOARD_ORDER_STATUS_LABELS[order.status] as OrderStatus,
    createdAt: formatDate(order.createdAt),
    items: order.itemsAmount,
    deliveryType: order.deliveryType === "PICKUP" ? "Retirada na sede" : "Envio por correio",
  };
}

export function AssociatedDashboard({ organizationId }: { organizationId: string }) {
  const { selectedPatient } = usePatientSelection();
  const { data } = useDashboardQuery(organizationId, selectedPatient.id);

  const orders = data?.orders ?? [];
  const requiredDocuments = data?.requiredDocuments ?? [];
  const approvals = data?.approvals ?? [];
  const prescription = data?.prescription ?? null;

  // Orders come back newest-first; the first non-terminal one is "in progress".
  const activeOrder = orders.find((order) => !TERMINAL_ORDER_STATUSES.includes(order.status));
  const recentOrders = orders.slice(0, 3);
  const lastOrderToken = orders[0]?.token ?? "Sem pedidos";

  const documentsReady =
    requiredDocuments.length > 0 &&
    requiredDocuments.every(
      (document) =>
        approvals.find((approval) => approval.documentId === document.id)?.status === "APPROVED",
    );

  const prescriptionDue = prescription ? formatDate(prescription.validUntil) : "Não definida";

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <SessionSync />
      <PatientSelector />

      <BecomePatientCallout variant="banner" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MiniStatus
          icon="file-check"
          label="Receita válida até"
          value={prescriptionDue}
          tone={prescription ? "success" : "warning"}
        />
        <MiniStatus
          icon="shield-check"
          label="Cadastro"
          value={documentsReady ? "Em dia" : "Em atenção"}
          tone={documentsReady ? "success" : "warning"}
        />
        <MiniStatus icon="package" label="Último pedido" value={lastOrderToken} mono />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="p-5 md:p-6">
          {activeOrder ? (
            <>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[var(--text-secondary)]">Pedido em andamento</p>
                  <p className="mt-1 font-mono text-xl font-extrabold">{activeOrder.token}</p>
                </div>
                <Badge tone={ORDER_STATUS_TONE[activeOrder.status]} dot>
                  {DASHBOARD_ORDER_STATUS_LABELS[activeOrder.status]}
                </Badge>
              </div>
              <OrderTimeline
                current={DASHBOARD_ORDER_STATUS_LABELS[activeOrder.status] as OrderStatus}
                compact
              />
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/orders">
                    <Icon name="truck" size={18} />
                    Acompanhar pedido
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/documents">Ver documentos</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
              <Icon name="package" size={34} className="text-[var(--text-tertiary)]" />
              <h2 className="mt-4 font-heading">Nenhum pedido em andamento</h2>
              <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
                Quando {selectedPatient.name} fizer um pedido, o acompanhamento aparece aqui.
              </p>
              <Button asChild className="mt-5">
                <Link href="/catalog">Consultar catálogo</Link>
              </Button>
            </div>
          )}
        </Card>

        <Card className="p-5 md:p-6">
          <div
            className={`mb-4 flex items-start gap-3 rounded-md p-4 ${
              documentsReady ? "bg-success-subtle text-[var(--success-600)]" : "bg-warning-subtle text-[var(--warning-600)]"
            }`}
          >
            <Icon name={documentsReady ? "shield-check" : "alert-triangle"} size={20} />
            <div>
              <p className="font-bold">{documentsReady ? "Documentos em dia" : "Documentos em atenção"}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {documentsReady
                  ? `Cadastro de ${selectedPatient.name} com todos os documentos aprovados.`
                  : `Revise os documentos de ${selectedPatient.name} antes de avançar pedidos.`}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink href="/orders" icon="plus" label="Fazer pedido" />
            <QuickLink href="/catalog" icon="book-open" label="Catálogo" />
            <QuickLink href="/documents" icon="file-text" label="Documentos" />
            <QuickLink href="/profile" icon="user" label="Perfil" />
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-heading">Pedidos recentes</h2>
          <Link href="/orders" className="text-sm font-bold text-[var(--green-700)]">
            Ver todos
          </Link>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {recentOrders.map((order) => (
            <OrderCard key={order.id} order={toAssociatedOrder(order)} />
          ))}
          {recentOrders.length === 0 ? (
            <Card className="p-5 text-sm text-[var(--text-secondary)]">
              {selectedPatient.name} ainda não tem pedidos registrados.
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function MiniStatus({
  icon,
  label,
  value,
  tone,
  mono,
}: {
  icon: "file-check" | "shield-check" | "package";
  label: string;
  value: string;
  tone?: "success" | "warning";
  mono?: boolean;
}) {
  return (
    <Card className="p-4">
      <Icon
        name={icon}
        size={21}
        className={tone === "warning" ? "text-warning" : "text-[var(--green-700)]"}
      />
      <p className="mt-5 text-sm text-[var(--text-secondary)]">{label}</p>
      <p className={mono ? "mt-1 font-mono font-bold" : "mt-1 font-bold"}>{value}</p>
    </Card>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: "plus" | "book-open" | "file-text" | "user";
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border border-border bg-card p-4 transition hover:border-primary-border hover:bg-primary-subtle"
    >
      <Icon name={icon} size={20} className="text-primary" />
      <p className="mt-3 text-sm font-bold">{label}</p>
    </Link>
  );
}

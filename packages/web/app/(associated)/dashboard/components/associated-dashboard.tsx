"use client";

import Link from "next/link";
import { PatientSelector } from "@/components/associated/patient-selector";
import { usePatientSelection } from "@/components/associated/patient-context";
import { OrderCard } from "@/components/domain/order-card";
import { OrderTimeline } from "@/components/domain/order-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useDashboardQuery } from "../queries/use-dashboard-query";

export function AssociatedDashboard() {
  const { selectedPatient } = usePatientSelection();
  const { data } = useDashboardQuery(selectedPatient.id);
  const activeOrder = data?.activeOrder;
  const recentOrders = data?.recentOrders ?? [];
  const documents = data?.documents ?? [];
  const documentsReady = documents.length > 0 && documents.every((document) => document.status === "Aprovado");
  const lastOrderNumber = recentOrders[0]?.number ?? "Sem pedidos";

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <PatientSelector />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniStatus icon="file-check" label="Receita válida até" value={selectedPatient.prescriptionDue} />
        <MiniStatus
          icon="shield-check"
          label="Cadastro"
          value={selectedPatient.registrationStatus}
          tone={selectedPatient.registrationStatus === "Ativo" ? "success" : "warning"}
        />
        <MiniStatus icon="package" label="Último pedido" value={lastOrderNumber} mono />
        <MiniStatus icon="clock" label="Próxima ação" value={selectedPatient.nextReview} tone="warning" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="p-5 md:p-6">
          {activeOrder ? (
            <>
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[var(--text-secondary)]">Pedido em andamento</p>
                  <p className="mt-1 font-mono text-xl font-extrabold">{activeOrder.number}</p>
                </div>
                <Badge tone="info" dot>
                  {activeOrder.status}
                </Badge>
              </div>
              <OrderTimeline current={activeOrder.status} timestamps={activeOrder.timestamps} compact />
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
                  ? `Receita de ${selectedPatient.name} válida até ${selectedPatient.prescriptionDue}.`
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
            <OrderCard key={order.id} order={order} />
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
  icon: "file-check" | "shield-check" | "package" | "clock";
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

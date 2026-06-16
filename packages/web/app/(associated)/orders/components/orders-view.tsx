"use client";

import { useMemo, useState } from "react";
import { usePatientSelection } from "@/components/associated/patient-context";
import { OrderCard } from "@/components/domain/order-card";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { useOrdersQuery } from "../queries/use-orders-query";

type OrderFilter = "todos" | "andamento" | "entregue";

const tabs: Array<TabItem<OrderFilter>> = [
  { value: "todos", label: "Todos" },
  { value: "andamento", label: "Em andamento" },
  { value: "entregue", label: "Entregues" },
];

export function OrdersView() {
  const [filter, setFilter] = useState<OrderFilter>("todos");
  const { selectedPatient } = usePatientSelection();
  const { data = [] } = useOrdersQuery(selectedPatient.id);

  const orders = useMemo(() => {
    return data.filter((order) => {
      if (filter === "entregue") return order.status === "Entregue";
      if (filter === "andamento") return order.status !== "Entregue";
      return true;
    });
  }, [data, filter]);

  const tabsWithCounts = tabs.map((tab) => ({
    ...tab,
    count:
      tab.value === "todos"
        ? data.length
        : tab.value === "entregue"
          ? data.filter((order) => order.status === "Entregue").length
          : data.filter((order) => order.status !== "Entregue").length,
  }));

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-subtle text-[var(--green-700)]">
          <Icon name="user" size={18} />
        </span>
        <div>
          <p className="text-sm font-bold">Pedidos de {selectedPatient.name}</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {selectedPatient.relationship} · {selectedPatient.condition}
          </p>
        </div>
      </Card>
      <Tabs tabs={tabsWithCounts} value={filter} onChange={setFilter} />
      <div className="grid gap-4 xl:grid-cols-2">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {orders.length === 0 ? (
          <Card className="p-6 text-sm text-[var(--text-secondary)]">
            Nenhum pedido encontrado para {selectedPatient.name} neste filtro.
          </Card>
        ) : null}
      </div>
    </div>
  );
}

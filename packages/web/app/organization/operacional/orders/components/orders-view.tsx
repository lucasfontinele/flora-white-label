"use client";

import { useState } from "react";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { OrdersTable } from "./orders-table";
import { useOrders } from "../queries/use-orders";
import { ORDER_TABS, ORDER_TAB_LABELS, ORDER_TAB_STATUSES, type OrderTab } from "../types";

const tabs: Array<TabItem<OrderTab>> = ORDER_TABS.map((value) => ({
  value,
  label: ORDER_TAB_LABELS[value],
}));

export function OrdersView({ organizationId }: { organizationId: string }) {
  const [tab, setTab] = useState<OrderTab>("todos");

  const statuses = ORDER_TAB_STATUSES[tab];
  const query = useOrders(organizationId, statuses);
  const orders = query.data?.data ?? [];

  return (
    <div className="flex flex-col gap-4 pb-20 lg:pb-0">
      <section>
        <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">Operacional</p>
        <h2 className="mt-1 font-heading text-2xl text-[var(--text-primary)]">Pedidos</h2>
        <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
          Acompanhe os pedidos da organização e filtre por etapa do fluxo.
        </p>
      </section>

      <Tabs tabs={tabs} value={tab} onChange={setTab} />

      <OrdersTable
        orders={orders}
        isLoading={query.isLoading}
        error={query.error instanceof Error ? query.error : null}
        onRetry={() => void query.refetch()}
      />
    </div>
  );
}

"use client";

import Link from "next/link";
import type React from "react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { statusTone } from "@/lib/data";
import { useOperatorOrdersQuery } from "../queries/use-operator-orders-query";

type OrderTab = "todos" | "analise" | "separacao" | "entregue";

const tabs: Array<TabItem<OrderTab>> = [
  { value: "todos", label: "Todos" },
  { value: "analise", label: "Aguardando análise" },
  { value: "separacao", label: "Em separação" },
  { value: "entregue", label: "Entregues" },
];

export function OrdersTable() {
  const [tab, setTab] = useState<OrderTab>("todos");
  const { data = [] } = useOperatorOrdersQuery();

  const rows = useMemo(() => {
    return data.filter((order) => {
      if (tab === "analise") return order.status === "Solicitado" || order.status === "Em análise";
      if (tab === "separacao") return order.status === "Em separação";
      if (tab === "entregue") return order.status === "Entregue";
      return true;
    });
  }, [data, tab]);

  const tabsWithCounts = tabs.map((item) => ({
    ...item,
    count:
      item.value === "todos"
        ? data.length
        : item.value === "analise"
          ? data.filter((order) => order.status === "Solicitado" || order.status === "Em análise").length
          : item.value === "separacao"
            ? data.filter((order) => order.status === "Em separação").length
            : data.filter((order) => order.status === "Entregue").length,
  }));

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={tabsWithCounts} value={tab} onChange={setTab} />
        <Button size="sm">
          <Icon name="plus" size={16} />
          Novo pedido
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead className="bg-muted text-left text-xs font-bold text-[var(--text-secondary)]">
              <tr>
                <Th>Pedido</Th>
                <Th>Paciente</Th>
                <Th>Responsável</Th>
                <Th>Status</Th>
                <Th className="text-center">Itens</Th>
                <Th>Entrega</Th>
                <Th>Documento</Th>
                <Th>Data</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((order) => (
                <tr key={order.id} className="transition hover:bg-primary-subtle/70">
                  <Td className="font-mono font-bold">{order.number}</Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={order.patient} size="sm" />
                      <span className="font-bold">{order.patient}</span>
                    </div>
                  </Td>
                  <Td className="text-[var(--text-secondary)]">{order.responsible}</Td>
                  <Td>
                    <Badge tone={statusTone[order.status]} dot>
                      {order.status}
                    </Badge>
                  </Td>
                  <Td className="text-center">{order.items}</Td>
                  <Td className="text-[var(--text-secondary)]">{order.deliveryType}</Td>
                  <Td>
                    <Badge tone={order.documentStatus === "OK" ? "success" : "warning"} size="sm">
                      {order.documentStatus === "OK" ? "Verificado" : "Pendente"}
                    </Badge>
                  </Td>
                  <Td className="text-[var(--text-secondary)]">{order.createdAt}</Td>
                  <Td className="text-right">
                    <Button asChild size="icon" variant="ghost" aria-label={`Abrir ${order.number}`}>
                      <Link href={`/operacional/orders/${order.id}`}>
                        <Icon name="chevron-right" size={18} />
                      </Link>
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`px-4 py-3 ${className ?? ""}`} {...props} />;
}

function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`whitespace-nowrap px-4 py-3.5 ${className ?? ""}`} {...props} />;
}

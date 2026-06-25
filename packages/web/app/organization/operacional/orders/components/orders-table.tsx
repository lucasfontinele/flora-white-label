"use client";

import Link from "next/link";
import type React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ORDER_DELIVERY_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  type Order,
} from "../types";

type OrdersTableProps = {
  orders: Order[];
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string) {
  const date = new Date(iso);

  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function OrdersTable({ orders, isLoading = false, error, onRetry }: OrdersTableProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <OrdersTableShell>
          {Array.from({ length: 5 }).map((_, index) => (
            <OrderRowSkeleton key={index} />
          ))}
        </OrdersTableShell>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-heading text-lg text-[var(--text-primary)]">
            Não foi possível carregar os pedidos
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{error.message}</p>
        </div>
        {onRetry ? (
          <Button onClick={onRetry} type="button" variant="secondary">
            Tentar novamente
          </Button>
        ) : null}
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="font-heading text-lg text-[var(--text-primary)]">Nenhum pedido encontrado</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Não há pedidos para o filtro selecionado.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <OrdersTableShell>
        {orders.map((order) => (
          <tr key={order.id} className="transition hover:bg-primary-subtle/70">
            <Td className="font-mono font-bold">{order.token}</Td>
            <Td>
              <div className="flex items-center gap-3">
                <Avatar name={order.patientName} size="sm" />
                <span className="font-bold">{order.patientName}</span>
              </div>
            </Td>
            <Td className="text-[var(--text-secondary)]">{order.guardianName ?? "—"}</Td>
            <Td>
              <Badge tone={ORDER_STATUS_TONE[order.status]} dot>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </Td>
            <Td className="text-center">{order.itemsAmount}</Td>
            <Td className="text-[var(--text-secondary)]">
              {ORDER_DELIVERY_LABELS[order.deliveryType]}
            </Td>
            <Td className="text-[var(--text-secondary)]">{formatDate(order.createdAt)}</Td>
            <Td className="text-right">
              <Button asChild size="icon" variant="ghost" aria-label={`Abrir ${order.token}`}>
                <Link href={`/organization/operacional/orders/${order.id}`}>
                  <Icon name="chevron-right" size={18} />
                </Link>
              </Button>
            </Td>
          </tr>
        ))}
      </OrdersTableShell>
    </Card>
  );
}

function OrdersTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead className="bg-muted text-left text-xs font-bold text-[var(--text-secondary)]">
          <tr>
            <Th>Pedido</Th>
            <Th>Paciente</Th>
            <Th>Responsável</Th>
            <Th>Status</Th>
            <Th className="text-center">Itens</Th>
            <Th>Entrega</Th>
            <Th>Data</Th>
            <Th />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

function OrderRowSkeleton() {
  return (
    <tr aria-busy="true">
      <Td>
        <Skeleton className="h-4 w-20" />
      </Td>
      <Td>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </Td>
      <Td>
        <Skeleton className="h-4 w-28" />
      </Td>
      <Td>
        <Skeleton className="h-5 w-24" />
      </Td>
      <Td className="text-center">
        <Skeleton className="mx-auto h-4 w-6" />
      </Td>
      <Td>
        <Skeleton className="h-4 w-16" />
      </Td>
      <Td>
        <Skeleton className="h-4 w-20" />
      </Td>
      <Td className="text-right">
        <Skeleton className="ml-auto h-8 w-8" />
      </Td>
    </tr>
  );
}

function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`px-4 py-3 ${className ?? ""}`} {...props} />;
}

function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`whitespace-nowrap px-4 py-3.5 ${className ?? ""}`} {...props} />;
}

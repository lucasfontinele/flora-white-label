"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { ApiRequestError, getApiErrorMessage } from "@/lib/http";
import { formatCentsAsCurrency } from "@/lib/money";
import { Can } from "../../../permissions/can";
import {
  useOrder,
  useOrderPayments,
  useUpdateOrderStatus,
} from "../queries/use-order";
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_TONE,
  ORDER_DELIVERY_LABELS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
  type Order,
  type OrderPayment,
  type PatientDocumentApproval,
} from "../types";

const ORDERS_LIST_HREF = "/organization/operacional/orders";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);

  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormatter.format(date);
}

export function OrderDetailView({
  organizationId,
  orderId,
}: {
  organizationId: string;
  orderId: string;
}) {
  const orderQuery = useOrder(organizationId, orderId);
  const order = orderQuery.data;

  const paymentsQuery = useOrderPayments(organizationId, orderId);

  if (orderQuery.isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (orderQuery.error || !order) {
    const notFound =
      orderQuery.error instanceof ApiRequestError && orderQuery.error.status === 404;

    return (
      <div className="space-y-5">
        <BackLink />
        <Card className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-lg text-[var(--text-primary)]">
              {notFound ? "Pedido não encontrado" : "Não foi possível carregar o pedido"}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {notFound
                ? "Esse pedido não existe ou pertence a outra organização."
                : getApiErrorMessage(orderQuery.error)}
            </p>
          </div>
          {!notFound ? (
            <Button onClick={() => void orderQuery.refetch()} type="button" variant="secondary">
              Tentar novamente
            </Button>
          ) : null}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div className="flex flex-wrap items-center gap-3">
        <BackLink />
        <h2 className="font-mono text-2xl font-extrabold">{order.token}</h2>
        <Badge tone={ORDER_STATUS_TONE[order.status]} dot>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
        <Badge tone="neutral">{ORDER_DELIVERY_LABELS[order.deliveryType]}</Badge>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <PatientCard order={order} />
          <ItemsCard order={order} />
        </div>

        <div className="space-y-5">
          <StatusCard organizationId={organizationId} order={order} />
          <PaymentCard
            isLoading={paymentsQuery.isLoading}
            error={paymentsQuery.error instanceof Error ? paymentsQuery.error : null}
            payments={paymentsQuery.data?.data ?? []}
            onRetry={() => void paymentsQuery.refetch()}
          />
        </div>
      </section>
    </div>
  );
}

function BackLink() {
  return (
    <Button asChild size="icon" variant="ghost" aria-label="Voltar">
      <Link href={ORDERS_LIST_HREF}>
        <Icon name="arrow-left" size={20} />
      </Link>
    </Button>
  );
}

function PatientCard({ order }: { order: Order }) {
  return (
    <Card className="p-5 md:p-6">
      <h3 className="font-heading">Paciente e responsável</h3>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Avatar name={order.patientName} size="md" />
        <div>
          <p className="text-xs font-bold text-[var(--text-tertiary)]">Paciente</p>
          <p className="font-bold">{order.patientName}</p>
        </div>
      </div>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <Info label="Responsável" value={order.guardianName ?? "Sem responsável"} />
        <Info label="Tipo de entrega" value={ORDER_DELIVERY_LABELS[order.deliveryType]} />
        <Info label="Criado em" value={formatDateTime(order.createdAt)} />
        <Info label="Atualizado em" value={formatDateTime(order.updatedAt)} />
      </dl>
    </Card>
  );
}

function ItemsCard({ order }: { order: Order }) {
  const total = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-5 md:p-6">
        <h3 className="font-heading">Itens do pedido</h3>
      </div>
      <div className="divide-y divide-border">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_auto] items-center gap-3 p-4 md:px-6"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-muted text-[var(--text-secondary)]">
                <Icon name="pill" size={18} />
              </span>
              <div>
                <p className="font-bold">{item.productName}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {item.quantity} × {formatCentsAsCurrency(item.unitPrice)}
                </p>
              </div>
            </div>
            <p className="font-mono text-sm font-bold">
              {formatCentsAsCurrency(item.unitPrice * item.quantity)}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border bg-muted/40 p-4 md:px-6">
        <span className="text-sm font-bold text-[var(--text-secondary)]">Total dos itens</span>
        <span className="font-mono text-base font-extrabold">{formatCentsAsCurrency(total)}</span>
      </div>
    </Card>
  );
}

function PaymentCard({
  payments,
  isLoading,
  error,
  onRetry,
}: {
  payments: OrderPayment[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  // Most recent payment first, so the operator sees the current charge on top.
  const ordered = useMemo(
    () =>
      [...payments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [payments],
  );

  return (
    <Card className="p-5 md:p-6">
      <h3 className="font-heading">Pagamento</h3>

      {isLoading ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : error ? (
        <div className="mt-5 flex flex-col gap-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Não foi possível carregar o pagamento.
          </p>
          <Button onClick={onRetry} size="sm" type="button" variant="secondary">
            Tentar novamente
          </Button>
        </div>
      ) : ordered.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Nenhum pagamento registrado para este pedido.
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          {ordered.map((payment, index) => (
            <div
              key={payment.id}
              className={index > 0 ? "border-t border-border pt-5" : undefined}
            >
              <div className="flex items-center justify-between gap-3">
                <Badge tone={PAYMENT_STATUS_TONE[payment.status]} dot>
                  {PAYMENT_STATUS_LABELS[payment.status]}
                </Badge>
                <span className="font-mono text-base font-extrabold">
                  {formatCentsAsCurrency(payment.totalPaid)}
                </span>
              </div>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <Info label="Forma de pagamento" value={PAYMENT_METHOD_LABELS[payment.paymentMethod]} />
                <Info
                  label="Desconto"
                  value={payment.discount ? `${Math.round(payment.discount * 100)}%` : "—"}
                />
                <Info label="Criado em" value={formatDateTime(payment.createdAt)} />
                <Info label="Expira em" value={formatDateTime(payment.expiresAt)} />
              </dl>
              {payment.checkoutUrl ? (
                <Button asChild className="mt-4" size="sm" variant="secondary">
                  <a href={payment.checkoutUrl} target="_blank" rel="noreferrer">
                    <Icon name="credit-card" size={16} />
                    Abrir cobrança
                  </a>
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function StatusCard({ organizationId, order }: { organizationId: string; order: Order }) {
  const mutation = useUpdateOrderStatus(organizationId, order.id);
  const { toast } = useToast();

  const isTerminal = order.status === "CANCELLED" || order.status === "DELIVERED";
  const pendingAction = mutation.isPending ? mutation.variables : null;

  function advance(action: "ready-for-pickup" | "ship", label: string) {
    mutation.mutate(action, {
      onSuccess: () =>
        toast({
          variant: "success",
          title: "Status atualizado",
          description: `Pedido marcado como ${label}.`,
        }),
      onError: (mutationError) =>
        toast({
          variant: "error",
          title: "Não foi possível atualizar o status",
          description: getApiErrorMessage(mutationError),
        }),
    });
  }

  return (
    <Card className="p-5 md:p-6">
      <h3 className="font-heading">Status do pedido</h3>
      <div className="mt-4 flex items-center gap-2">
        <Badge tone={ORDER_STATUS_TONE[order.status]} dot>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <Can module="ORDERS" action="EDIT">
        <div className="mt-5 grid gap-3">
          <Button
            type="button"
            variant={order.deliveryType === "PICKUP" ? "primary" : "secondary"}
            disabled={isTerminal || order.status === "READY_FOR_PICKUP" || mutation.isPending}
            onClick={() => advance("ready-for-pickup", "pronto para retirada")}
          >
            <Icon name="store" size={18} />
            {pendingAction === "ready-for-pickup"
              ? "Atualizando..."
              : "Marcar como pronto para retirada"}
          </Button>
          <Button
            type="button"
            variant={order.deliveryType === "CORREIOS" ? "primary" : "secondary"}
            disabled={isTerminal || order.status === "SHIPPED" || mutation.isPending}
            onClick={() => advance("ship", "aguardando correios")}
          >
            <Icon name="truck" size={18} />
            {pendingAction === "ship" ? "Atualizando..." : "Marcar como aguardando correios"}
          </Button>
        </div>
        {isTerminal ? (
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Este pedido está {ORDER_STATUS_LABELS[order.status].toLowerCase()} e não pode mais mudar
            de status.
          </p>
        ) : null}
      </Can>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold text-[var(--text-tertiary)]">{label}</dt>
      <dd className="mt-1 font-bold">{value}</dd>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-sm" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}

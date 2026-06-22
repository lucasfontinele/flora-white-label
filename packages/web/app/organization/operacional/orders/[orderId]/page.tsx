import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderTimeline } from "@/components/domain/order-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { getOperatorOrder, operatorOrders, statusTone } from "@/lib/data";

export function generateStaticParams() {
  return operatorOrders.map((order) => ({ orderId: order.id }));
}

export default async function OperationalOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = getOperatorOrder(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="icon" variant="ghost" aria-label="Voltar">
          <Link href="/organization/operacional/orders">
            <Icon name="arrow-left" size={20} />
          </Link>
        </Button>
        <h2 className="font-mono text-2xl font-extrabold">{order.number}</h2>
        <Badge tone={statusTone[order.status]} dot>
          {order.status}
        </Badge>
        <Badge tone={order.documentStatus === "OK" ? "success" : "warning"}>
          {order.documentStatus === "OK" ? "Documento verificado" : "Documento pendente"}
        </Badge>
        <Link className="ml-auto text-sm font-bold text-[var(--green-700)]" href="/organization/operacional/orders">
          Histórico interno
        </Link>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <Card className="p-5 md:p-6">
            <h3 className="font-heading">Dados do pedido</h3>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Info label="Código" value={order.number} mono />
              <Info label="Criado em" value="12 jun 2026 · 09:14" />
              <Info label="Tipo de entrega" value={order.deliveryType === "Retirada" ? "Retirada na sede" : "Correio"} />
              <Info label="Paciente" value={order.patient} />
              <Info label="Responsável" value={order.responsible} />
              <Info label="Documentos" value="Receita · Laudo" />
            </dl>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-border p-5 md:p-6">
              <h3 className="font-heading">Itens do pedido</h3>
            </div>
            <div className="divide-y divide-border">
              {order.products.map((product) => (
                <div key={product.name} className="grid grid-cols-[1fr_64px_80px] items-center gap-3 p-4 md:px-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-muted text-[var(--text-secondary)]">
                      <Icon name="pill" size={18} />
                    </span>
                    <p className="font-bold">{product.name}</p>
                  </div>
                  <p className="font-mono text-sm font-bold">x{product.quantity}</p>
                  <Badge tone={product.stockTone ?? "success"} size="sm">
                    {product.stockTone === "error" ? "4 un." : product.stockTone === "warning" ? "12 g" : "OK"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5 md:p-6">
            <h3 className="font-heading">Gestão de status</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Status atual: <strong>{order.status}</strong>
            </p>
            <div className="mt-5 grid gap-3">
              <Button>Marcar como pronto p/ retirada</Button>
              <Button variant="secondary">Marcar como enviado</Button>
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <h3 className="mb-5 font-heading">Linha do tempo</h3>
            <OrderTimeline current={order.status} compact />
          </Card>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-bold text-[var(--text-tertiary)]">{label}</dt>
      <dd className={mono ? "mt-1 font-mono font-bold" : "mt-1 font-bold"}>{value}</dd>
    </div>
  );
}

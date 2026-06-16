import * as React from 'react';

/**
 * Order summary card (Pedido) — number, status, date, item count, delivery type.
 *
 * @startingPoint section="Domain" subtitle="Patient-facing order summary card" viewport="380x200"
 */
export interface PedidoCardProps {
  /** Order number, monospace e.g. "#PED-20482". */
  numero: string;
  /** Lifecycle status — use the fixed vocabulary (Solicitado … Entregue). */
  status: string;
  /** Display date, e.g. "15 jun 2026". */
  data: string;
  /** Item count. */
  itens: number;
  /** Delivery type, e.g. "Retirada na sede" or "Envio por correio". */
  tipoEntrega: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function PedidoCard(props: PedidoCardProps): React.ReactElement;

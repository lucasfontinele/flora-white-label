"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "../../products/types";
import { useInventoryMovements } from "../queries/use-inventory";
import { INVENTORY_MOVEMENT_TYPE_LABELS, type InventoryMovementType } from "../types";

type InventoryMovementsDialogProps = {
  open: boolean;
  organizationId: string;
  product: Product | null;
  onClose: () => void;
};

const movementTone: Record<InventoryMovementType, React.ComponentProps<typeof Badge>["tone"]> = {
  IN: "success",
  OUT: "error",
  RESERVE: "info",
  RELEASE: "petrol",
  ADJUSTMENT: "warning",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

export function InventoryMovementsDialog({
  open,
  organizationId,
  product,
  onClose,
}: InventoryMovementsDialogProps) {
  const titleId = React.useId();
  const [mounted, setMounted] = React.useState(false);
  const query = useInventoryMovements(organizationId, product?.id ?? "", open && product !== null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const movements = query.data?.data ?? [];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-6">
          <div>
            <h2 id={titleId} className="font-heading text-lg text-[var(--text-primary)]">
              Histórico de movimentações
            </h2>
            {product ? (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{product.name}</p>
            ) : null}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>

        <div className="overflow-y-auto">
          {query.isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : query.error ? (
            <div className="p-6">
              <p className="text-sm text-error">
                {query.error instanceof Error
                  ? query.error.message
                  : "Não foi possível carregar o histórico."}
              </p>
            </div>
          ) : movements.length === 0 ? (
            <div className="p-6">
              <p className="text-sm text-[var(--text-secondary)]">
                Nenhuma movimentação registrada para este produto.
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[520px] border-collapse text-left text-sm">
              <thead className="border-b border-border bg-muted text-xs uppercase text-[var(--text-secondary)]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tipo</th>
                  <th className="px-5 py-3 font-semibold">Qtd.</th>
                  <th className="px-5 py-3 font-semibold">Motivo</th>
                  <th className="px-5 py-3 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {movements.map((movement) => (
                  <tr key={movement.id} className="align-top">
                    <td className="px-5 py-3">
                      <Badge tone={movementTone[movement.type]} size="sm">
                        {INVENTORY_MOVEMENT_TYPE_LABELS[movement.type]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 font-medium text-[var(--text-primary)]">
                      {movement.quantity}
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">
                      {movement.reason ? (
                        <span className="line-clamp-2">{movement.reason}</span>
                      ) : (
                        <span className="text-[var(--text-tertiary)]">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-[var(--text-secondary)]">
                      {dateFormatter.format(new Date(movement.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

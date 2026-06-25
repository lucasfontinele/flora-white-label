"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PRODUCT_CATEGORY_LABELS, type Product } from "../../products/types";
import type { InventoryItem } from "../types";

export type InventoryRow = {
  product: Product;
  inventory: InventoryItem | null;
};

type InventoryTableProps = {
  rows: InventoryRow[];
  isLoading?: boolean;
  error?: Error | null;
  onCreatePosition?: (product: Product) => void;
  onMovement?: (product: Product, inventory: InventoryItem) => void;
  onHistory?: (product: Product, inventory: InventoryItem) => void;
  onRetry?: () => void;
};

const columnCount = 5;

export function InventoryTable({
  rows,
  isLoading = false,
  error,
  onCreatePosition,
  onMovement,
  onHistory,
  onRetry,
}: InventoryTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <InventoryTableShell>
            {Array.from({ length: 5 }).map((_, index) => (
              <InventoryRowSkeleton key={index} />
            ))}
          </InventoryTableShell>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-4 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-lg text-[var(--text-primary)]">
              Não foi possível carregar o estoque
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{error.message}</p>
          </div>
          {onRetry ? (
            <Button onClick={onRetry} type="button" variant="secondary">
              Tentar novamente
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <h2 className="font-heading text-lg text-[var(--text-primary)]">
            Nenhum produto no catálogo
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Cadastre produtos no catálogo para controlar o estoque.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <InventoryTableShell>
          {rows.map(({ product, inventory }) => (
            <tr key={product.id} className="bg-card align-top">
              <td className="px-5 py-4">
                <div className="font-semibold text-[var(--text-primary)]">{product.name}</div>
                <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                  {PRODUCT_CATEGORY_LABELS[product.category]}
                </p>
              </td>
              <td className="px-5 py-4 font-medium text-[var(--text-primary)]">
                {inventory ? inventory.availableQuantity : "—"}
              </td>
              <td className="px-5 py-4 text-[var(--text-secondary)]">
                {inventory ? inventory.reservedQuantity : "—"}
              </td>
              <td className="px-5 py-4 text-[var(--text-secondary)]">
                {inventory ? inventory.minimumQuantity : "—"}
              </td>
              <td className="px-5 py-4">
                <InventoryStatusBadge inventory={inventory} />
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  {inventory ? (
                    <>
                      <Button
                        aria-label={`Movimentar estoque de ${product.name}`}
                        onClick={() => onMovement?.(product, inventory)}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        Movimentar
                      </Button>
                      <Button
                        aria-label={`Histórico de ${product.name}`}
                        onClick={() => onHistory?.(product, inventory)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        Histórico
                      </Button>
                    </>
                  ) : (
                    <Button
                      aria-label={`Criar posição de estoque para ${product.name}`}
                      onClick={() => onCreatePosition?.(product)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      Criar posição
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </InventoryTableShell>
        <div className="border-t border-border px-5 py-3 text-xs text-[var(--text-secondary)]">
          {rows.length} {rows.length === 1 ? "produto" : "produtos"}
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryStatusBadge({ inventory }: { inventory: InventoryItem | null }) {
  if (!inventory) {
    return (
      <Badge tone="neutral" size="sm">
        Sem posição
      </Badge>
    );
  }

  if (inventory.belowMinimum) {
    return (
      <Badge dot tone="warning" size="sm">
        Abaixo do mínimo
      </Badge>
    );
  }

  return (
    <Badge dot tone="success" size="sm">
      Em dia
    </Badge>
  );
}

function InventoryTableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="border-b border-border bg-muted text-xs uppercase text-[var(--text-secondary)]">
          <tr>
            <th className="px-5 py-3 font-semibold">Produto</th>
            <th className="px-5 py-3 font-semibold">Disponível</th>
            <th className="px-5 py-3 font-semibold">Reservado</th>
            <th className="px-5 py-3 font-semibold">Mínimo</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 text-right font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

function InventoryRowSkeleton() {
  return (
    <tr aria-busy="true" className="bg-card">
      {Array.from({ length: columnCount }).map((_, index) => (
        <td key={index} className="px-5 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-24" />
        </div>
      </td>
    </tr>
  );
}

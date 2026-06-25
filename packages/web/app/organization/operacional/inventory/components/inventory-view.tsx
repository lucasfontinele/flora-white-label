"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/http";
import { useProducts } from "../../products/queries/use-products";
import type { Product } from "../../products/types";
import { CreateInventoryDialog } from "./create-inventory-dialog";
import { InventoryMovementsDialog } from "./inventory-movements-dialog";
import { InventoryTable, type InventoryRow } from "./inventory-table";
import { StockMovementDialog } from "./stock-movement-dialog";
import {
  useCreateInventoryItem,
  useProductInventories,
  useStockOperation,
} from "../queries/use-inventory";
import type { CreateInventoryFormValues, StockMovementFormValues } from "../schemas/inventory-schema";
import { STOCK_OPERATION_LABELS, type InventoryItem } from "../types";

type CreateState = { open: boolean; preselectedProductId?: string };
type MovementState = { product: Product; inventory: InventoryItem };

type InventoryViewProps = {
  organizationId: string;
  currentUserId: string;
};

export function InventoryView({ organizationId, currentUserId }: InventoryViewProps) {
  const productsQuery = useProducts(organizationId);
  const products = useMemo(() => productsQuery.data?.data ?? [], [productsQuery.data]);
  const productIds = useMemo(() => products.map((product) => product.id), [products]);
  const inventories = useProductInventories(organizationId, productIds);

  const createMutation = useCreateInventoryItem(organizationId);
  const operationMutation = useStockOperation(organizationId);
  const { toast } = useToast();

  const [createState, setCreateState] = useState<CreateState | null>(null);
  const [movementState, setMovementState] = useState<MovementState | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);

  const rows = useMemo<InventoryRow[]>(
    () =>
      products.map((product) => ({
        product,
        inventory: inventories.byProductId.get(product.id)?.data ?? null,
      })),
    [products, inventories],
  );

  const productsWithoutPosition = useMemo(
    () => rows.filter((row) => row.inventory === null).map((row) => row.product),
    [rows],
  );

  const isTableLoading = productsQuery.isLoading || (products.length > 0 && inventories.isLoading);

  function notifyError(error: unknown) {
    toast({
      variant: "error",
      title: "Algo deu errado",
      description: getApiErrorMessage(error),
    });
  }

  function openCreate() {
    createMutation.reset();
    setCreateState({ open: true });
  }

  function openCreateForProduct(product: Product) {
    createMutation.reset();
    setCreateState({ open: true, preselectedProductId: product.id });
  }

  function closeCreate() {
    if (createMutation.isPending) return;
    setCreateState(null);
  }

  function submitCreate(values: CreateInventoryFormValues) {
    const reason = values.reason.trim();

    createMutation.mutate(
      {
        productId: values.productId,
        body: {
          availableQuantity:
            values.availableQuantity === "" ? undefined : Number(values.availableQuantity),
          minimumQuantity:
            values.minimumQuantity === "" ? undefined : Number(values.minimumQuantity),
          reason: reason.length > 0 ? reason : null,
          createdByUserId: currentUserId,
        },
      },
      {
        onSuccess: () => {
          setCreateState(null);
          toast({
            variant: "success",
            title: "Posição criada",
            description: "A posição de estoque foi criada com sucesso.",
          });
        },
        onError: notifyError,
      },
    );
  }

  function openMovement(product: Product, inventory: InventoryItem) {
    operationMutation.reset();
    setMovementState({ product, inventory });
  }

  function closeMovement() {
    if (operationMutation.isPending) return;
    setMovementState(null);
  }

  function submitMovement(values: StockMovementFormValues) {
    if (!movementState) return;
    const reason = values.reason.trim();

    operationMutation.mutate(
      {
        productId: movementState.product.id,
        operation: values.operation,
        body: {
          quantity: Number(values.quantity),
          reason: reason.length > 0 ? reason : null,
          createdByUserId: currentUserId,
        },
      },
      {
        onSuccess: () => {
          setMovementState(null);
          toast({
            variant: "success",
            title: "Movimentação registrada",
            description: `${STOCK_OPERATION_LABELS[values.operation]} concluída com sucesso.`,
          });
        },
        onError: notifyError,
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--text-secondary)]">
            Rastreabilidade
          </p>
          <h2 className="mt-1 font-heading text-2xl text-[var(--text-primary)]">Estoque</h2>
          <p className="mt-2 max-w-2xl text-[var(--text-secondary)]">
            Controle a posição de estoque de cada produto: disponível, reservado, mínimo e o
            histórico de movimentações.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          disabled={!productsQuery.isLoading && productsWithoutPosition.length === 0}
        >
          <Icon name="plus" size={18} />
          Nova posição de estoque
        </Button>
      </section>

      <InventoryTable
        rows={rows}
        isLoading={isTableLoading}
        error={productsQuery.error instanceof Error ? productsQuery.error : null}
        onCreatePosition={openCreateForProduct}
        onMovement={openMovement}
        onHistory={(product) => setHistoryProduct(product)}
        onRetry={() => void productsQuery.refetch()}
      />

      <CreateInventoryDialog
        open={createState?.open ?? false}
        products={productsWithoutPosition}
        preselectedProductId={createState?.preselectedProductId}
        pending={createMutation.isPending}
        onSubmit={submitCreate}
        onCancel={closeCreate}
      />

      <StockMovementDialog
        open={movementState !== null}
        product={movementState?.product ?? null}
        inventory={movementState?.inventory ?? null}
        pending={operationMutation.isPending}
        onSubmit={submitMovement}
        onCancel={closeMovement}
      />

      <InventoryMovementsDialog
        open={historyProduct !== null}
        organizationId={organizationId}
        product={historyProduct}
        onClose={() => setHistoryProduct(null)}
      />
    </div>
  );
}

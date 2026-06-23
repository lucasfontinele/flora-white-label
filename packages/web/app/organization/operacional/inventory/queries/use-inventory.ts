"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInventoryItem } from "../requests/create-inventory-item";
import { getInventory } from "../requests/get-inventory";
import { listInventoryMovements } from "../requests/list-movements";
import { runStockOperation } from "../requests/run-stock-operation";
import type {
  CreateInventoryItemBody,
  InventoryItem,
  StockOperation,
  StockOperationBody,
} from "../types";

export const inventoryItemKey = (organizationId: string, productId: string) =>
  ["organization", "inventory", "item", organizationId, productId] as const;

export const inventoryMovementsKey = (organizationId: string, productId: string) =>
  ["organization", "inventory", "movements", organizationId, productId] as const;

/**
 * Fetches every product's stock position in parallel and exposes the results as
 * a productId -> position map. The backend only offers per-product inventory,
 * so the screen joins it with the product list client-side.
 */
export function useProductInventories(organizationId: string, productIds: string[]) {
  return useQueries({
    queries: productIds.map((productId) => ({
      queryKey: inventoryItemKey(organizationId, productId),
      queryFn: () => getInventory(organizationId, productId),
      enabled: organizationId.length > 0,
    })),
    combine: (results) => ({
      byProductId: new Map(productIds.map((id, index) => [id, results[index]] as const)),
      isLoading: results.some((result) => result?.isLoading),
      isError: results.some((result) => result?.isError),
    }),
  });
}

export function useInventoryMovements(organizationId: string, productId: string, enabled: boolean) {
  return useQuery({
    queryKey: inventoryMovementsKey(organizationId, productId),
    queryFn: () => listInventoryMovements(organizationId, productId),
    enabled: enabled && organizationId.length > 0 && productId.length > 0,
  });
}

export function useCreateInventoryItem(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, body }: { productId: string; body: CreateInventoryItemBody }) =>
      createInventoryItem(organizationId, productId, body),
    onSuccess: (_data, { productId }) =>
      queryClient.invalidateQueries({ queryKey: inventoryItemKey(organizationId, productId) }),
  });
}

export function useStockOperation(organizationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      operation,
      body,
    }: {
      productId: string;
      operation: StockOperation;
      body: StockOperationBody;
    }) => runStockOperation(organizationId, productId, operation, body),
    onSuccess: (_data: InventoryItem, { productId }) => {
      queryClient.invalidateQueries({ queryKey: inventoryItemKey(organizationId, productId) });
      queryClient.invalidateQueries({ queryKey: inventoryMovementsKey(organizationId, productId) });
    },
  });
}

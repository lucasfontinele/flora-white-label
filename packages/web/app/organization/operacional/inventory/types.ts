// Shapes and enums for the
// /organizations/:organizationId/products/:productId/inventory endpoints.
// Mirrors the API inventory contract (see specs/011-organization-product-inventory).

export type InventoryItem = {
  id: string;
  organizationId: string;
  productId: string;
  availableQuantity: number;
  reservedQuantity: number;
  minimumQuantity: number;
  belowMinimum: boolean;
  createdAt: string;
  updatedAt: string;
};

export const INVENTORY_MOVEMENT_TYPES = [
  "IN",
  "OUT",
  "RESERVE",
  "RELEASE",
  "ADJUSTMENT",
] as const;

export type InventoryMovementType = (typeof INVENTORY_MOVEMENT_TYPES)[number];

export const INVENTORY_MOVEMENT_TYPE_LABELS: Record<InventoryMovementType, string> = {
  IN: "Entrada",
  OUT: "Saída",
  RESERVE: "Reserva",
  RELEASE: "Liberação",
  ADJUSTMENT: "Ajuste",
};

export type InventoryMovement = {
  id: string;
  organizationId: string;
  inventoryItemId: string;
  productId: string;
  type: InventoryMovementType;
  quantity: number;
  reason: string | null;
  createdByUserId: string;
  createdAt: string;
};

// GET .../inventory/movements
export type ListInventoryMovementsResponse = {
  data: InventoryMovement[];
};

// Stock operations available from this screen. The "create" operation maps to
// POST .../inventory; the others to the matching POST .../inventory/<path>.
export const STOCK_OPERATIONS = [
  "add-stock",
  "reserve",
  "release-reservation",
  "confirm-stock-out",
  "adjust",
] as const;

export type StockOperation = (typeof STOCK_OPERATIONS)[number];

export const STOCK_OPERATION_LABELS: Record<StockOperation, string> = {
  "add-stock": "Entrada de estoque",
  reserve: "Reservar",
  "release-reservation": "Liberar reserva",
  "confirm-stock-out": "Confirmar saída",
  adjust: "Ajustar disponível",
};

export const STOCK_OPERATION_HINTS: Record<StockOperation, string> = {
  "add-stock": "Adiciona a quantidade informada ao disponível.",
  reserve: "Move a quantidade do disponível para o reservado.",
  "release-reservation": "Devolve a quantidade do reservado para o disponível.",
  "confirm-stock-out": "Confirma a saída física da quantidade reservada.",
  adjust: "Define o disponível para o novo valor absoluto informado.",
};

// Body for POST .../inventory
export type CreateInventoryItemBody = {
  availableQuantity?: number;
  minimumQuantity?: number;
  reason: string | null;
  createdByUserId: string;
};

// Body for the stock operation endpoints (add-stock / reserve / release /
// confirm-stock-out / adjust).
export type StockOperationBody = {
  quantity: number;
  reason: string | null;
  createdByUserId: string;
};

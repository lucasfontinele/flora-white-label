import type { InventoryItem } from "../../domain/entities/InventoryItem.js";

export interface InventoryItemReadModel {
  id: string;
  organizationId: string;
  productId: string;
  availableQuantity: number;
  reservedQuantity: number;
  minimumQuantity: number;
  belowMinimum: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItemRepository {
  findByProductInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<InventoryItem | null>;
  findDetailsByProductInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<InventoryItemReadModel | null>;
  existsForProduct(organizationId: string, productId: string): Promise<boolean>;
  create(item: InventoryItem): Promise<InventoryItemReadModel>;
  save(item: InventoryItem): Promise<InventoryItemReadModel>;
}

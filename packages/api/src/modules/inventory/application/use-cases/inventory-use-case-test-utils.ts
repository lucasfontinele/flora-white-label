import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { Product } from "../../../products/domain/entities/Product.js";
import type { ProductRepository } from "../../../products/application/repositories/ProductRepository.js";
import { InventoryItem } from "../../domain/entities/InventoryItem.js";
import type { InventoryMovement } from "../../domain/entities/InventoryMovement.js";
import type {
  InventoryItemReadModel,
  InventoryItemRepository,
} from "../repositories/InventoryItemRepository.js";
import type {
  InventoryMovementReadModel,
  InventoryMovementRepository,
} from "../repositories/InventoryMovementRepository.js";

export const fixedNow = new Date("2026-06-23T12:00:00.000Z");

export const immediateUnitOfWork: UnitOfWork = {
  execute: <T>(work: () => Promise<T>) => work(),
};

function key(organizationId: string, productId: string): string {
  return `${organizationId}:${productId}`;
}

export function toInventoryItemReadModel(
  item: InventoryItem,
  createdAt = fixedNow,
  updatedAt = fixedNow,
): InventoryItemReadModel {
  return {
    id: item.id,
    organizationId: item.organizationId,
    productId: item.productId,
    availableQuantity: item.availableQuantity,
    reservedQuantity: item.reservedQuantity,
    minimumQuantity: item.minimumQuantity,
    belowMinimum: item.belowMinimum,
    createdAt,
    updatedAt,
  };
}

export class InMemoryInventoryItemRepository implements InventoryItemRepository {
  readonly items = new Map<string, InventoryItemReadModel>();
  saveCalls = 0;

  async findByProductInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<InventoryItem | null> {
    const record = this.items.get(key(organizationId, productId));

    if (!record) {
      return null;
    }

    return InventoryItem.restore(
      {
        organizationId: record.organizationId,
        productId: record.productId,
        availableQuantity: record.availableQuantity,
        reservedQuantity: record.reservedQuantity,
        minimumQuantity: record.minimumQuantity,
      },
      record.id,
    );
  }

  async findDetailsByProductInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<InventoryItemReadModel | null> {
    return this.items.get(key(organizationId, productId)) ?? null;
  }

  async existsForProduct(organizationId: string, productId: string): Promise<boolean> {
    return this.items.has(key(organizationId, productId));
  }

  async create(item: InventoryItem): Promise<InventoryItemReadModel> {
    const readModel = toInventoryItemReadModel(item);
    this.items.set(key(item.organizationId, item.productId), readModel);

    return readModel;
  }

  async save(item: InventoryItem): Promise<InventoryItemReadModel> {
    this.saveCalls += 1;
    const existing = this.items.get(key(item.organizationId, item.productId));
    const readModel = toInventoryItemReadModel(item, existing?.createdAt ?? fixedNow, fixedNow);
    this.items.set(key(item.organizationId, item.productId), readModel);

    return readModel;
  }

  seed(item: InventoryItem): InventoryItemReadModel {
    const readModel = toInventoryItemReadModel(item);
    this.items.set(key(item.organizationId, item.productId), readModel);

    return readModel;
  }
}

export class InMemoryInventoryMovementRepository implements InventoryMovementRepository {
  readonly movements: InventoryMovementReadModel[] = [];

  async append(movements: InventoryMovement[]): Promise<void> {
    for (const movement of movements) {
      this.movements.push({
        id: movement.id,
        organizationId: movement.organizationId,
        inventoryItemId: movement.inventoryItemId,
        productId: movement.productId,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        createdByUserId: movement.createdByUserId,
        createdAt: new Date(fixedNow.getTime() + this.movements.length),
      });
    }
  }

  async listByProductInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<InventoryMovementReadModel[]> {
    return this.movements
      .filter(
        (movement) =>
          movement.organizationId === organizationId && movement.productId === productId,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export class FakeProductRepository implements ProductRepository {
  readonly productKeys = new Set<string>();

  constructor(keys: string[] = ["organization-1:product-1"]) {
    keys.forEach((entry) => this.productKeys.add(entry));
  }

  async findByIdInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<Product | null> {
    return this.productKeys.has(key(organizationId, productId)) ? ({} as Product) : null;
  }

  async findDetailsByIdInOrganization(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async findAllByOrganization(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async create(): Promise<never> {
    throw new Error("Method not implemented.");
  }

  async save(): Promise<never> {
    throw new Error("Method not implemented.");
  }
}

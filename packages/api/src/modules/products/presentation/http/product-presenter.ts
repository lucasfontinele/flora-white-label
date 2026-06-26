import type { ProductReadModel } from "../../application/repositories/ProductRepository.js";
import type { ProductCategory } from "../../domain/enums/ProductCategory.js";
import type { ProductType } from "../../domain/enums/ProductType.js";
import type { ProductUnit } from "../../domain/enums/ProductUnit.js";
import type { StrainType } from "../../domain/enums/StrainType.js";

export interface ProductResponse {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  type: ProductType;
  strainType: StrainType | null;
  thcPercentage: number | null;
  cbdPercentage: number | null;
  unit: ProductUnit;
  priceInCents: number;
  coverImageStorageKey: string | null;
  coverImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class ProductPresenter {
  /**
   * Maps a product to its HTTP representation. The cover image is exposed as the
   * stable `coverImageStorageKey` plus a freshly resolved `coverImageUrl`
   * (presigned), which the caller resolves from the storage port and passes in.
   */
  static toHttp(product: ProductReadModel, coverImageUrl: string | null = null): ProductResponse {
    return {
      id: product.id,
      organizationId: product.organizationId,
      name: product.name,
      description: product.description,
      category: product.category,
      type: product.type,
      strainType: product.strainType,
      thcPercentage: product.thcPercentage,
      cbdPercentage: product.cbdPercentage,
      unit: product.unit,
      priceInCents: product.priceInCents,
      coverImageStorageKey: product.coverImageStorageKey,
      coverImageUrl: product.coverImageStorageKey ? coverImageUrl : null,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}

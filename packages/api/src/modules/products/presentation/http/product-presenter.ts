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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class ProductPresenter {
  static toHttp(product: ProductReadModel): ProductResponse {
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
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}

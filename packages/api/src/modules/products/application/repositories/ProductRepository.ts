import type { Product } from "../../domain/entities/Product.js";
import type { ProductCategory } from "../../domain/enums/ProductCategory.js";
import type { ProductType } from "../../domain/enums/ProductType.js";
import type { ProductUnit } from "../../domain/enums/ProductUnit.js";
import type { StrainType } from "../../domain/enums/StrainType.js";

export interface ProductReadModel {
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductRepository {
  findByIdInOrganization(organizationId: string, productId: string): Promise<Product | null>;
  findDetailsByIdInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<ProductReadModel | null>;
  findAllByOrganization(organizationId: string): Promise<ProductReadModel[]>;
  create(product: Product): Promise<ProductReadModel>;
  save(product: Product): Promise<ProductReadModel>;
}

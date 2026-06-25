import type { Prisma, Product as PrismaProduct } from "@prisma/client";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import type { ProductReadModel } from "../../application/repositories/ProductRepository.js";
import { Product } from "../../domain/entities/Product.js";
import { ProductCategory } from "../../domain/enums/ProductCategory.js";
import { ProductType } from "../../domain/enums/ProductType.js";
import { ProductUnit } from "../../domain/enums/ProductUnit.js";
import { StrainType } from "../../domain/enums/StrainType.js";

export class ProductMapper {
  static toDomain(record: PrismaProduct): Product {
    return Product.create(
      {
        organizationId: record.organizationId,
        name: record.name,
        description: record.description,
        category: record.category as ProductCategory,
        type: record.type as ProductType,
        strainType: record.strainType as StrainType | null,
        thcPercentage: record.thcPercentage,
        cbdPercentage: record.cbdPercentage,
        unit: record.unit as ProductUnit,
        price: MoneyInCents.create(record.priceInCents),
        isActive: record.isActive,
      },
      record.id,
    );
  }

  static toReadModel(record: PrismaProduct): ProductReadModel {
    return {
      id: record.id,
      organizationId: record.organizationId,
      name: record.name,
      description: record.description,
      category: record.category as ProductCategory,
      type: record.type as ProductType,
      strainType: record.strainType as StrainType | null,
      thcPercentage: record.thcPercentage,
      cbdPercentage: record.cbdPercentage,
      unit: record.unit as ProductUnit,
      priceInCents: record.priceInCents,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toPersistence(product: Product): Prisma.ProductUncheckedCreateInput {
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
    };
  }

  static toUpdatePersistence(product: Product): Prisma.ProductUncheckedUpdateInput {
    return {
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
    };
  }
}

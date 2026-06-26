import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import type { Organization } from "../../../organizations/domain/entities/Organization.js";
import type {
  OrganizationPublicReadModel,
  OrganizationReadModel,
  OrganizationRepository,
} from "../../../organizations/application/repositories/OrganizationRepository.js";
import { Product } from "../../domain/entities/Product.js";
import { ProductCategory } from "../../domain/enums/ProductCategory.js";
import { ProductType } from "../../domain/enums/ProductType.js";
import { ProductUnit } from "../../domain/enums/ProductUnit.js";
import type { ProductReadModel, ProductRepository } from "../repositories/ProductRepository.js";
import type {
  ProductImageStorageService,
  UploadProductImageInput,
  UploadProductImageOutput,
} from "../services/ProductImageStorageService.js";

export const fixedNow = new Date("2026-06-23T12:00:00.000Z");

export const immediateUnitOfWork: UnitOfWork = {
  execute: <T>(work: () => Promise<T>) => work(),
};

export const validCreateProductInput = {
  organizationId: "organization-1",
  name: "CBD Oil 1000mg",
  description: "Frasco com 30ml.",
  category: ProductCategory.Oil,
  type: ProductType.Cbd,
  strainType: null,
  thcPercentage: 0,
  cbdPercentage: 10,
  unit: ProductUnit.Milliliter,
  priceInCents: 15900,
};

function productFromReadModel(readModel: ProductReadModel): Product {
  return Product.create(
    {
      organizationId: readModel.organizationId,
      name: readModel.name,
      description: readModel.description,
      category: readModel.category,
      type: readModel.type,
      strainType: readModel.strainType,
      thcPercentage: readModel.thcPercentage,
      cbdPercentage: readModel.cbdPercentage,
      unit: readModel.unit,
      price: MoneyInCents.create(readModel.priceInCents),
      coverImageStorageKey: readModel.coverImageStorageKey,
      isActive: readModel.isActive,
    },
    readModel.id,
  );
}

export function toProductReadModel(product: Product): ProductReadModel {
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
    isActive: product.isActive,
    createdAt: fixedNow,
    updatedAt: fixedNow,
  };
}

export class InMemoryProductRepository implements ProductRepository {
  readonly products = new Map<string, ProductReadModel>();
  saveCalls = 0;

  async findByIdInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<Product | null> {
    const product = this.products.get(productId);

    if (!product || product.organizationId !== organizationId) {
      return null;
    }

    return productFromReadModel(product);
  }

  async findDetailsByIdInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<ProductReadModel | null> {
    const product = this.products.get(productId);

    return product && product.organizationId === organizationId ? product : null;
  }

  async findAllByOrganization(organizationId: string): Promise<ProductReadModel[]> {
    return [...this.products.values()].filter((product) => product.organizationId === organizationId);
  }

  async create(product: Product): Promise<ProductReadModel> {
    const readModel = toProductReadModel(product);
    this.products.set(readModel.id, readModel);

    return readModel;
  }

  async save(product: Product): Promise<ProductReadModel> {
    this.saveCalls += 1;
    const existing = this.products.get(product.id);
    const readModel = {
      ...toProductReadModel(product),
      createdAt: existing?.createdAt ?? fixedNow,
      updatedAt: fixedNow,
    };

    this.products.set(readModel.id, readModel);

    return readModel;
  }

  seed(product: Product): ProductReadModel {
    const readModel = toProductReadModel(product);
    this.products.set(readModel.id, readModel);

    return readModel;
  }
}

export class InMemoryProductImageStorageService implements ProductImageStorageService {
  readonly uploads: UploadProductImageInput[] = [];
  readonly deleted: string[] = [];

  async upload(input: UploadProductImageInput): Promise<UploadProductImageOutput> {
    this.uploads.push(input);

    return {
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      size: input.size,
    };
  }

  async getImageUrl(storageKey: string): Promise<string> {
    return `https://cdn.test/${storageKey}`;
  }

  async delete(storageKey: string): Promise<void> {
    this.deleted.push(storageKey);
  }
}

export class InMemoryOrganizationRepository implements OrganizationRepository {
  readonly organizationIds = new Set<string>();

  constructor(ids: string[] = ["organization-1"]) {
    ids.forEach((id) => this.organizationIds.add(id));
  }

  async findById(id: string): Promise<Organization | null> {
    return this.organizationIds.has(id) ? ({} as Organization) : null;
  }

  async findByCnpj(): Promise<Organization | null> {
    throw new Error("Method not implemented.");
  }

  async findByCnpjExcludingId(): Promise<Organization | null> {
    throw new Error("Method not implemented.");
  }

  async findBySlug(): Promise<OrganizationPublicReadModel | null> {
    throw new Error("Method not implemented.");
  }

  async findDetailsById(): Promise<OrganizationReadModel | null> {
    throw new Error("Method not implemented.");
  }

  async findAllDetails(): Promise<OrganizationReadModel[]> {
    throw new Error("Method not implemented.");
  }

  async create(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async save(): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async delete(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

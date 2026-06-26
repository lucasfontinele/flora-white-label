import { AggregateRoot } from "../../../../shared/domain/entities/AggregateRoot.js";
import { DomainValidationError } from "../../../../shared/domain/errors/DomainValidationError.js";
import type { MoneyInCents } from "../../../../shared/domain/value-objects/MoneyInCents.js";
import { ProductCategory } from "../enums/ProductCategory.js";
import { ProductType } from "../enums/ProductType.js";
import { ProductUnit } from "../enums/ProductUnit.js";
import { StrainType } from "../enums/StrainType.js";

export interface ProductProps {
  organizationId: string;
  name: string;
  description?: string | null;
  category: ProductCategory;
  type: ProductType;
  strainType?: StrainType | null;
  thcPercentage?: number | null;
  cbdPercentage?: number | null;
  unit: ProductUnit;
  price: MoneyInCents;
  coverImageStorageKey?: string | null;
  isActive?: boolean;
}

export interface UpdateProductCatalogDataInput {
  name: string;
  description?: string | null;
  category: ProductCategory;
  type: ProductType;
  strainType?: StrainType | null;
  thcPercentage?: number | null;
  cbdPercentage?: number | null;
  unit: ProductUnit;
  price: MoneyInCents;
}

export class Product extends AggregateRoot<ProductProps> {
  private constructor(props: ProductProps, id?: string) {
    super(props, id);
  }

  static create(props: ProductProps, id?: string): Product {
    return new Product(Product.normalizeProps(props), id);
  }

  updateCatalogData(input: UpdateProductCatalogDataInput): void {
    const normalized = Product.normalizeProps({
      ...input,
      organizationId: this.organizationId,
      isActive: this.isActive,
    });

    this.props.name = normalized.name;
    this.props.description = normalized.description;
    this.props.category = normalized.category;
    this.props.type = normalized.type;
    this.props.strainType = normalized.strainType;
    this.props.thcPercentage = normalized.thcPercentage;
    this.props.cbdPercentage = normalized.cbdPercentage;
    this.props.unit = normalized.unit;
    this.props.price = normalized.price;
  }

  setCoverImage(storageKey: string): void {
    const normalized = storageKey.trim();
    if (normalized.length === 0) {
      throw new DomainValidationError("Product cover image storage key is required.");
    }

    this.props.coverImageStorageKey = normalized;
  }

  removeCoverImage(): void {
    this.props.coverImageStorageKey = null;
  }

  activate(): void {
    this.props.isActive = true;
  }

  deactivate(): void {
    this.props.isActive = false;
  }

  delete(): void {
    this.deactivate();
  }

  private static normalizeProps(props: ProductProps): ProductProps {
    const organizationId = props.organizationId.trim();
    if (organizationId.length === 0) {
      throw new DomainValidationError("Product requires an organizationId.");
    }

    const name = props.name.trim();
    if (name.length === 0) {
      throw new DomainValidationError("Product name is required.");
    }

    Product.ensureEnumValue(ProductCategory, props.category, "category");
    Product.ensureEnumValue(ProductType, props.type, "type");
    Product.ensureEnumValue(ProductUnit, props.unit, "unit");

    if (props.strainType !== undefined && props.strainType !== null) {
      Product.ensureEnumValue(StrainType, props.strainType, "strainType");
    }

    const description = Product.normalizeOptionalText(props.description);
    const thcPercentage = Product.normalizePercentage(props.thcPercentage, "thcPercentage");
    const cbdPercentage = Product.normalizePercentage(props.cbdPercentage, "cbdPercentage");

    return {
      ...props,
      organizationId,
      name,
      description,
      strainType: props.strainType ?? null,
      thcPercentage,
      cbdPercentage,
      coverImageStorageKey: Product.normalizeOptionalText(props.coverImageStorageKey),
      isActive: props.isActive ?? true,
    };
  }

  private static normalizeOptionalText(value: string | null | undefined): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const trimmed = value.trim();

    return trimmed.length > 0 ? trimmed : null;
  }

  private static ensureEnumValue<T extends Record<string, string>>(
    enumObject: T,
    value: unknown,
    field: string,
  ): void {
    if (!Object.values(enumObject).includes(value as string)) {
      throw new DomainValidationError(`Invalid product ${field}.`);
    }
  }

  private static normalizePercentage(
    value: number | null | undefined,
    field: "thcPercentage" | "cbdPercentage",
  ): number | null {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      throw new DomainValidationError(`${field} cannot be negative.`);
    }

    return value;
  }

  get organizationId(): string {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description ?? null;
  }

  get category(): ProductCategory {
    return this.props.category;
  }

  get type(): ProductType {
    return this.props.type;
  }

  get strainType(): StrainType | null {
    return this.props.strainType ?? null;
  }

  get thcPercentage(): number | null {
    return this.props.thcPercentage ?? null;
  }

  get cbdPercentage(): number | null {
    return this.props.cbdPercentage ?? null;
  }

  get unit(): ProductUnit {
    return this.props.unit;
  }

  get price(): MoneyInCents {
    return this.props.price;
  }

  get priceInCents(): number {
    return this.props.price.value;
  }

  get coverImageStorageKey(): string | null {
    return this.props.coverImageStorageKey ?? null;
  }

  get isActive(): boolean {
    return this.props.isActive ?? true;
  }
}

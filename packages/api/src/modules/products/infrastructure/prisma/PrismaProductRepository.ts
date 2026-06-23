import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  ProductReadModel,
  ProductRepository,
} from "../../application/repositories/ProductRepository.js";
import type { Product } from "../../domain/entities/Product.js";
import { ProductMapper } from "./ProductMapper.js";

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByIdInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<Product | null> {
    const record = await this.prisma.getClient().product.findFirst({
      where: { id: productId, organizationId },
    });

    return record ? ProductMapper.toDomain(record) : null;
  }

  async findDetailsByIdInOrganization(
    organizationId: string,
    productId: string,
  ): Promise<ProductReadModel | null> {
    const record = await this.prisma.getClient().product.findFirst({
      where: { id: productId, organizationId },
    });

    return record ? ProductMapper.toReadModel(record) : null;
  }

  async findAllByOrganization(organizationId: string): Promise<ProductReadModel[]> {
    const records = await this.prisma.getClient().product.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    });

    return records.map((record) => ProductMapper.toReadModel(record));
  }

  async create(product: Product): Promise<ProductReadModel> {
    const record = await this.prisma.getClient().product.create({
      data: ProductMapper.toPersistence(product),
    });

    return ProductMapper.toReadModel(record);
  }

  async save(product: Product): Promise<ProductReadModel> {
    const record = await this.prisma.getClient().product.update({
      where: { id: product.id },
      data: ProductMapper.toUpdatePersistence(product),
    });

    return ProductMapper.toReadModel(record);
  }
}

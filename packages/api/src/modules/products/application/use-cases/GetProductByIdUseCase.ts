import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type {
  ProductReadModel,
  ProductRepository,
} from "../repositories/ProductRepository.js";

export interface GetProductByIdInput {
  organizationId: string;
  productId: string;
}

export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: GetProductByIdInput): Promise<ProductReadModel> {
    const product = await this.productRepository.findDetailsByIdInOrganization(
      input.organizationId,
      input.productId,
    );

    if (!product) {
      throw new NotFoundError("Product not found.");
    }

    return product;
  }
}

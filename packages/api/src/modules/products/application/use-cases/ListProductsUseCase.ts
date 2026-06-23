import type {
  ProductReadModel,
  ProductRepository,
} from "../repositories/ProductRepository.js";

export interface ListProductsInput {
  organizationId: string;
}

export interface ListProductsOutput {
  data: ProductReadModel[];
}

export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: ListProductsInput): Promise<ListProductsOutput> {
    const data = await this.productRepository.findAllByOrganization(input.organizationId);

    return { data };
  }
}

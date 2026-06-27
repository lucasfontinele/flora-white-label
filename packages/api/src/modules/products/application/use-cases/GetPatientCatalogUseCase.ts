import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import type { ProductCategory } from "../../domain/enums/ProductCategory.js";
import type { PatientCatalogAccessRepository } from "../repositories/PatientCatalogAccessRepository.js";
import type { ProductReadModel, ProductRepository } from "../repositories/ProductRepository.js";

export interface GetPatientCatalogInput {
  organizationId: string;
  patientId: string;
}

export interface GetPatientCatalogOutput {
  /** Categories the patient has access to (drives the catalog filter buttons). */
  categories: ProductCategory[];
  /** Active products the patient is allowed to see. */
  products: ProductReadModel[];
}

export interface GetPatientCatalogDependencies {
  productRepository: ProductRepository;
  patientRepository: PatientRepository;
  catalogAccessRepository: PatientCatalogAccessRepository;
}

/**
 * Resolves the patient's visible catalog from their posology: active products
 * released either directly (product-scoped lines) or by category (category-scoped
 * lines), plus the distinct categories among them for the filter buttons. A
 * patient without a prescription sees an empty catalog.
 */
export class GetPatientCatalogUseCase {
  constructor(private readonly deps: GetPatientCatalogDependencies) {}

  async execute(input: GetPatientCatalogInput): Promise<GetPatientCatalogOutput> {
    // A patient only sees the catalog while their registration is approved — any
    // other status (revoked, expired receita, missing docs) blocks it entirely.
    const patient = await this.deps.patientRepository.findByIdInOrganization(
      input.organizationId,
      input.patientId,
    );
    if (!patient || patient.patientStatus !== PatientStatus.Approval) {
      return { categories: [], products: [] };
    }

    const access = await this.deps.catalogAccessRepository.findAccessByPatient(
      input.organizationId,
      input.patientId,
    );

    if (!access) {
      return { categories: [], products: [] };
    }

    const allowedProductIds = new Set(access.productIds);
    const allowedCategories = new Set(access.categories);

    const products = await this.deps.productRepository.findAllByOrganization(input.organizationId);
    const accessible = products.filter(
      (product) =>
        product.isActive &&
        (allowedProductIds.has(product.id) || allowedCategories.has(product.category)),
    );

    const categories = [...new Set(accessible.map((product) => product.category))];

    return { categories, products: accessible };
  }
}

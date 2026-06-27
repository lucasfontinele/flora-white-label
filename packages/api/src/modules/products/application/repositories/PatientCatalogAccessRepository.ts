import type { ProductCategory } from "../../domain/enums/ProductCategory.js";

/** Catalog access a patient is granted by their posology. */
export interface PatientCatalogAccess {
  productIds: string[];
  categories: ProductCategory[];
}

/**
 * Narrow read port over a patient's posology-derived catalog access. The
 * prescriptions repository satisfies this structurally, so the products module
 * does not depend on the full prescription repository.
 */
export interface PatientCatalogAccessRepository {
  findAccessByPatient(
    organizationId: string,
    patientId: string,
  ): Promise<PatientCatalogAccess | null>;
}

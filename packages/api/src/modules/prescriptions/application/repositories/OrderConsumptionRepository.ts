import type { ProductCategory } from "../../../products/domain/enums/ProductCategory.js";

/**
 * Narrow read port over the order history, used to compute how much a patient has
 * already consumed in a period window — per product or across a category. The
 * orders module's repository satisfies this structurally, so prescriptions does
 * not depend on the full OrderRepository.
 */
export interface OrderConsumptionRepository {
  sumProductQuantityInRange(
    organizationId: string,
    patientId: string,
    productId: string,
    from: Date,
    to: Date,
  ): Promise<number>;
  sumCategoryQuantityInRange(
    organizationId: string,
    patientId: string,
    category: ProductCategory,
    from: Date,
    to: Date,
  ): Promise<number>;
}

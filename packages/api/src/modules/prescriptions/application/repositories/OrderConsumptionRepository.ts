/**
 * Narrow read port over the order history, used to compute how much of a product
 * a patient has already consumed in a period window. The orders module's
 * repository satisfies this structurally, so prescriptions does not depend on
 * the full OrderRepository.
 */
export interface OrderConsumptionRepository {
  sumProductQuantityInRange(
    organizationId: string,
    patientId: string,
    productId: string,
    from: Date,
    to: Date,
  ): Promise<number>;
}

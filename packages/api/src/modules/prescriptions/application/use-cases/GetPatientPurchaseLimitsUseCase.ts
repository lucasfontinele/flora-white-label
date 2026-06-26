import type { ProductUnit } from "../../../products/domain/enums/ProductUnit.js";
import type { PrescriptionPeriod } from "../../domain/enums/PrescriptionPeriod.js";
import { currentPeriodWindow } from "../../domain/posology-window.js";
import type { OrderConsumptionRepository } from "../repositories/OrderConsumptionRepository.js";
import type { PatientPrescriptionRepository } from "../repositories/PatientPrescriptionRepository.js";

export interface PatientPurchaseLimitItem {
  productId: string;
  productName: string;
  unit: ProductUnit;
  period: PrescriptionPeriod;
  allowedQuantity: number;
  used: number;
  remaining: number;
  notes: string | null;
}

export interface PatientPurchaseLimits {
  hasPrescription: boolean;
  issuedAt: Date | null;
  validUntil: Date | null;
  isExpired: boolean;
  items: PatientPurchaseLimitItem[];
}

export interface GetPatientPurchaseLimitsInput {
  organizationId: string;
  patientId: string;
}

export interface GetPatientPurchaseLimitsDependencies {
  prescriptionRepository: PatientPrescriptionRepository;
  orderConsumptionRepository: OrderConsumptionRepository;
}

/**
 * Builds the patient's purchase allowances from their active prescription: for
 * each posology item, how much is allowed in the current period and how much
 * has already been consumed (summed from non-cancelled orders in that window).
 */
export class GetPatientPurchaseLimitsUseCase {
  constructor(private readonly deps: GetPatientPurchaseLimitsDependencies) {}

  async execute(input: GetPatientPurchaseLimitsInput): Promise<PatientPurchaseLimits> {
    const prescription = await this.deps.prescriptionRepository.findDetailsByPatient(
      input.organizationId,
      input.patientId,
    );

    if (!prescription) {
      return {
        hasPrescription: false,
        issuedAt: null,
        validUntil: null,
        isExpired: false,
        items: [],
      };
    }

    const now = new Date();
    const items = await Promise.all(
      prescription.items.map(async (item) => {
        const window = currentPeriodWindow(item.period, now);
        const used = await this.deps.orderConsumptionRepository.sumProductQuantityInRange(
          input.organizationId,
          input.patientId,
          item.productId,
          window.from,
          window.to,
        );
        const remaining = Math.max(item.allowedQuantity - used, 0);

        return {
          productId: item.productId,
          productName: item.productName,
          unit: item.productUnit,
          period: item.period,
          allowedQuantity: item.allowedQuantity,
          used,
          remaining,
          notes: item.notes,
        };
      }),
    );

    return {
      hasPrescription: true,
      issuedAt: prescription.issuedAt,
      validUntil: prescription.validUntil,
      isExpired: prescription.validUntil.getTime() <= now.getTime(),
      items,
    };
  }
}

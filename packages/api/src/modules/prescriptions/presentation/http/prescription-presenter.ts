import type { PatientPurchaseLimits } from "../../application/use-cases/GetPatientPurchaseLimitsUseCase.js";
import type {
  PatientPrescriptionReadModel,
  PrescriptionItemReadModel,
} from "../../application/repositories/PatientPrescriptionRepository.js";

export interface PrescriptionItemResponse {
  id: string;
  productId: string;
  productName: string;
  productUnit: string;
  allowedQuantity: number;
  period: string;
  notes: string | null;
}

export interface PrescriptionResponse {
  id: string;
  organizationId: string;
  patientId: string;
  patientName: string;
  issuedAt: string;
  validUntil: string;
  observations: string | null;
  items: PrescriptionItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseLimitItemResponse {
  productId: string;
  productName: string;
  unit: string;
  period: string;
  allowedQuantity: number;
  used: number;
  remaining: number;
  notes: string | null;
}

export interface PurchaseLimitsResponse {
  hasPrescription: boolean;
  issuedAt: string | null;
  validUntil: string | null;
  isExpired: boolean;
  items: PurchaseLimitItemResponse[];
}

export class PrescriptionPresenter {
  static toHttp(prescription: PatientPrescriptionReadModel): PrescriptionResponse {
    return {
      id: prescription.id,
      organizationId: prescription.organizationId,
      patientId: prescription.patientId,
      patientName: prescription.patientName,
      issuedAt: prescription.issuedAt.toISOString(),
      validUntil: prescription.validUntil.toISOString(),
      observations: prescription.observations,
      items: prescription.items.map((item) => PrescriptionPresenter.itemToHttp(item)),
      createdAt: prescription.createdAt.toISOString(),
      updatedAt: prescription.updatedAt.toISOString(),
    };
  }

  static itemToHttp(item: PrescriptionItemReadModel): PrescriptionItemResponse {
    return {
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productUnit: item.productUnit,
      allowedQuantity: item.allowedQuantity,
      period: item.period,
      notes: item.notes,
    };
  }

  static limitsToHttp(limits: PatientPurchaseLimits): PurchaseLimitsResponse {
    return {
      hasPrescription: limits.hasPrescription,
      issuedAt: limits.issuedAt ? limits.issuedAt.toISOString() : null,
      validUntil: limits.validUntil ? limits.validUntil.toISOString() : null,
      isExpired: limits.isExpired,
      items: limits.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        unit: item.unit,
        period: item.period,
        allowedQuantity: item.allowedQuantity,
        used: item.used,
        remaining: item.remaining,
        notes: item.notes,
      })),
    };
  }
}

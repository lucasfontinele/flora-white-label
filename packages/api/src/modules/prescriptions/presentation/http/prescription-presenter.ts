import type { PatientPrescriptionReadModel } from "../../application/repositories/PatientPrescriptionRepository.js";

export interface PrescriptionResponse {
  id: string;
  organizationId: string;
  patientId: string;
  patientName: string;
  validUntil: string;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
}

export class PrescriptionPresenter {
  static toHttp(prescription: PatientPrescriptionReadModel): PrescriptionResponse {
    return {
      id: prescription.id,
      organizationId: prescription.organizationId,
      patientId: prescription.patientId,
      patientName: prescription.patientName,
      validUntil: prescription.validUntil.toISOString(),
      observations: prescription.observations,
      createdAt: prescription.createdAt.toISOString(),
      updatedAt: prescription.updatedAt.toISOString(),
    };
  }
}

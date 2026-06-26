import type { ProductUnit } from "../../../products/domain/enums/ProductUnit.js";
import type { PatientPrescription } from "../../domain/entities/PatientPrescription.js";
import type { PrescriptionItem } from "../../domain/entities/PrescriptionItem.js";
import type { PrescriptionPeriod } from "../../domain/enums/PrescriptionPeriod.js";

export interface PrescriptionItemReadModel {
  id: string;
  productId: string;
  productName: string;
  productUnit: ProductUnit;
  allowedQuantity: number;
  period: PrescriptionPeriod;
  notes: string | null;
}

export interface PatientPrescriptionReadModel {
  id: string;
  organizationId: string;
  patientId: string;
  patientName: string;
  issuedAt: Date;
  validUntil: Date;
  observations: string | null;
  items: PrescriptionItemReadModel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientPrescriptionRepository {
  findByPatient(organizationId: string, patientId: string): Promise<PatientPrescription | null>;
  findDetailsByPatient(
    organizationId: string,
    patientId: string,
  ): Promise<PatientPrescriptionReadModel | null>;
  findAllByOrganization(organizationId: string): Promise<PatientPrescriptionReadModel[]>;
  create(prescription: PatientPrescription): Promise<PatientPrescriptionReadModel>;
  save(prescription: PatientPrescription): Promise<PatientPrescriptionReadModel>;
  /**
   * Replaces the full set of posology items for a prescription (delete + recreate).
   */
  replaceItems(prescriptionId: string, items: PrescriptionItem[]): Promise<void>;
  delete(prescriptionId: string): Promise<void>;
}

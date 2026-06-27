import type { ProductCategory } from "../../../products/domain/enums/ProductCategory.js";
import type { ProductUnit } from "../../../products/domain/enums/ProductUnit.js";
import type { PatientPrescription } from "../../domain/entities/PatientPrescription.js";
import type { PrescriptionItem } from "../../domain/entities/PrescriptionItem.js";
import type { PrescriptionItemScope } from "../../domain/enums/PrescriptionItemScope.js";
import type { PrescriptionPeriod } from "../../domain/enums/PrescriptionPeriod.js";

export interface PrescriptionItemReadModel {
  id: string;
  scope: PrescriptionItemScope;
  productId: string | null;
  productName: string | null;
  productUnit: ProductUnit | null;
  category: ProductCategory | null;
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

/** Resolved catalog access derived from a patient's posology. */
export interface PatientCatalogAccess {
  productIds: string[];
  categories: ProductCategory[];
}

export interface PatientPrescriptionRepository {
  findByPatient(organizationId: string, patientId: string): Promise<PatientPrescription | null>;
  findDetailsByPatient(
    organizationId: string,
    patientId: string,
  ): Promise<PatientPrescriptionReadModel | null>;
  findAllByOrganization(organizationId: string): Promise<PatientPrescriptionReadModel[]>;
  /**
   * The product ids and categories the patient is allowed to see in the catalog,
   * or null when the patient has no prescription.
   */
  findAccessByPatient(
    organizationId: string,
    patientId: string,
  ): Promise<PatientCatalogAccess | null>;
  create(prescription: PatientPrescription): Promise<PatientPrescriptionReadModel>;
  save(prescription: PatientPrescription): Promise<PatientPrescriptionReadModel>;
  /**
   * Replaces the full set of posology items for a prescription (delete + recreate).
   */
  replaceItems(prescriptionId: string, items: PrescriptionItem[]): Promise<void>;
  delete(prescriptionId: string): Promise<void>;
}

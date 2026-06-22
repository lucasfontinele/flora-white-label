import type { Patient } from "../../domain/entities/Patient.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";

export interface PatientRepository {
  findByIdInOrganization(organizationId: string, patientId: string): Promise<Patient | null>;
  findByDocument(organizationId: string, document: Document): Promise<Patient | null>;
  create(patient: Patient): Promise<void>;
}

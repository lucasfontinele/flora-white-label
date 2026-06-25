import type { PatientPrescription } from "../../domain/entities/PatientPrescription.js";

export interface PatientPrescriptionReadModel {
  id: string;
  organizationId: string;
  patientId: string;
  patientName: string;
  validUntil: Date;
  observations: string | null;
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
  delete(prescriptionId: string): Promise<void>;
}

import type { Patient } from "../../domain/entities/Patient.js";
import type { PatientStatus } from "../../domain/enums/PatientStatus.js";
import type { Gender } from "../../../../shared/domain/enums/Gender.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";

export interface PatientReadModel {
  id: string;
  organizationId: string;
  guardianId: string | null;
  guardianName: string | null;
  name: string;
  document: string;
  birthdate: Date;
  gender: Gender;
  underPrivileged: boolean;
  patientStatus: PatientStatus;
  rejectionReason: string | null;
  createdAt: Date;
}

export interface PatientRepository {
  findByIdInOrganization(organizationId: string, patientId: string): Promise<Patient | null>;
  findDetailsByIdInOrganization(
    organizationId: string,
    patientId: string,
  ): Promise<PatientReadModel | null>;
  findManyByOrganization(
    organizationId: string,
    status?: PatientStatus,
  ): Promise<PatientReadModel[]>;
  findByDocument(organizationId: string, document: Document): Promise<Patient | null>;
  create(patient: Patient): Promise<void>;
  save(patient: Patient): Promise<void>;
}

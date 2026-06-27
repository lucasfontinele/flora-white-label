import type { Prescriber } from "../../domain/entities/Prescriber.js";

export interface PrescriberReadModel {
  id: string;
  organizationId: string;
  patientId: string;
  fullName: string;
  crm: string;
  crmState: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrescriberRepository {
  findById(id: string): Promise<Prescriber | null>;
  findByPatient(organizationId: string, patientId: string): Promise<PrescriberReadModel[]>;
  create(prescriber: Prescriber): Promise<PrescriberReadModel>;
  save(prescriber: Prescriber): Promise<PrescriberReadModel>;
  delete(id: string): Promise<void>;
}

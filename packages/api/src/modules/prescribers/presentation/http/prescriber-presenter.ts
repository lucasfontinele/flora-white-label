import type { PrescriberReadModel } from "../../application/repositories/PrescriberRepository.js";

export interface PrescriberResponse {
  id: string;
  organizationId: string;
  patientId: string;
  fullName: string;
  crm: string;
  crmState: string;
  createdAt: string;
  updatedAt: string;
}

export class PrescriberPresenter {
  static toHttp(prescriber: PrescriberReadModel): PrescriberResponse {
    return {
      id: prescriber.id,
      organizationId: prescriber.organizationId,
      patientId: prescriber.patientId,
      fullName: prescriber.fullName,
      crm: prescriber.crm,
      crmState: prescriber.crmState,
      createdAt: prescriber.createdAt.toISOString(),
      updatedAt: prescriber.updatedAt.toISOString(),
    };
  }
}

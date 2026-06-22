import type { OrganizationDocumentApprovalLog } from "../../domain/entities/OrganizationDocumentApprovalLog.js";
import type { DocumentApprovalAction } from "../../domain/enums/DocumentApprovalAction.js";

export interface OrganizationDocumentApprovalLogReadModel {
  id: string;
  action: DocumentApprovalAction;
  patientApprovalId: string;
  organizationUserId: string;
  createdAt: Date;
}

export interface OrganizationDocumentApprovalLogRepository {
  create(log: OrganizationDocumentApprovalLog): Promise<OrganizationDocumentApprovalLogReadModel>;
  findAllByPatientApproval(patientApprovalId: string): Promise<OrganizationDocumentApprovalLogReadModel[]>;
}

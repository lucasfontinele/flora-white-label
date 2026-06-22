import type { OrganizationDocumentApprovalLogReadModel } from "../../application/repositories/OrganizationDocumentApprovalLogRepository.js";
import type { OrganizationDocumentPatientApprovalReadModel } from "../../application/repositories/OrganizationDocumentPatientApprovalRepository.js";
import type { OrganizationRequiredDocumentReadModel } from "../../application/repositories/OrganizationRequiredDocumentRepository.js";
import type { DocumentApprovalAction } from "../../domain/enums/DocumentApprovalAction.js";
import type { DocumentApprovalStatus } from "../../domain/enums/DocumentApprovalStatus.js";

export interface RequiredDocumentResponse {
  id: string;
  organizationId: string;
  name: string;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientDocumentApprovalResponse {
  id: string;
  documentId: string;
  patientId: string;
  status: DocumentApprovalStatus;
  rejectedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalLogResponse {
  id: string;
  action: DocumentApprovalAction;
  patientApprovalId: string;
  organizationUserId: string;
  createdAt: string;
}

export class OrganizationDocumentPresenter {
  static requiredDocumentToHttp(
    document: OrganizationRequiredDocumentReadModel,
  ): RequiredDocumentResponse {
    return {
      id: document.id,
      organizationId: document.organizationId,
      name: document.name,
      observations: document.observations,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    };
  }

  static approvalToHttp(
    approval: OrganizationDocumentPatientApprovalReadModel,
  ): PatientDocumentApprovalResponse {
    return {
      id: approval.id,
      documentId: approval.documentId,
      patientId: approval.patientId,
      status: approval.status,
      rejectedReason: approval.rejectedReason,
      createdAt: approval.createdAt.toISOString(),
      updatedAt: approval.updatedAt.toISOString(),
    };
  }

  static logToHttp(log: OrganizationDocumentApprovalLogReadModel): ApprovalLogResponse {
    return {
      id: log.id,
      action: log.action,
      patientApprovalId: log.patientApprovalId,
      organizationUserId: log.organizationUserId,
      createdAt: log.createdAt.toISOString(),
    };
  }
}

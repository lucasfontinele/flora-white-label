import type { PatientReadModel } from "../../../patients/application/repositories/PatientRepository.js";
import type { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";
import type { Gender } from "../../../../shared/domain/enums/Gender.js";
import type { OrganizationDocumentApprovalLogReadModel } from "../../application/repositories/OrganizationDocumentApprovalLogRepository.js";
import type { OrganizationDocumentPatientApprovalReadModel } from "../../application/repositories/OrganizationDocumentPatientApprovalRepository.js";
import type { OrganizationRequiredDocumentReadModel } from "../../application/repositories/OrganizationRequiredDocumentRepository.js";
import type { GetPatientApprovalDetailsOutput } from "../../application/use-cases/GetPatientApprovalDetailsUseCase.js";
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
  organizationId: string;
  documentId: string;
  patientId: string;
  status: DocumentApprovalStatus;
  rejectedReason: string | null;
  fileName: string | null;
  mimeType: string | null;
  size: number | null;
  storageKey: string | null;
  fileUrl: string | null;
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

export interface PatientResponse {
  id: string;
  name: string;
  document: string;
  birthdate: string;
  gender: Gender;
  underPrivileged: boolean;
  patientStatus: PatientStatus;
  rejectionReason: string | null;
  guardianName: string | null;
  createdAt: string;
}

export interface PatientApprovalDetailsResponse {
  patient: PatientResponse;
  requiredDocuments: RequiredDocumentResponse[];
  approvals: PatientDocumentApprovalResponse[];
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
      organizationId: approval.organizationId,
      documentId: approval.documentId,
      patientId: approval.patientId,
      status: approval.status,
      rejectedReason: approval.rejectedReason,
      fileName: approval.fileName,
      mimeType: approval.mimeType,
      size: approval.size,
      storageKey: approval.storageKey,
      fileUrl: approval.fileUrl ?? null,
      createdAt: approval.createdAt.toISOString(),
      updatedAt: approval.updatedAt.toISOString(),
    };
  }

  static patientToHttp(patient: PatientReadModel): PatientResponse {
    return {
      id: patient.id,
      name: patient.name,
      document: patient.document,
      birthdate: patient.birthdate.toISOString(),
      gender: patient.gender,
      underPrivileged: patient.underPrivileged,
      patientStatus: patient.patientStatus,
      rejectionReason: patient.rejectionReason,
      guardianName: patient.guardianName,
      createdAt: patient.createdAt.toISOString(),
    };
  }

  static patientApprovalDetailsToHttp(
    output: GetPatientApprovalDetailsOutput,
  ): PatientApprovalDetailsResponse {
    return {
      patient: OrganizationDocumentPresenter.patientToHttp(output.patient),
      requiredDocuments: output.requiredDocuments.map((document) =>
        OrganizationDocumentPresenter.requiredDocumentToHttp(document),
      ),
      approvals: output.approvals.map((approval) =>
        OrganizationDocumentPresenter.approvalToHttp(approval),
      ),
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

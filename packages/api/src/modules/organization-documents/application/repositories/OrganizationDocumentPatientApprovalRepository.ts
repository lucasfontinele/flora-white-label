import type { OrganizationDocumentPatientApproval } from "../../domain/entities/OrganizationDocumentPatientApproval.js";
import type { DocumentApprovalStatus } from "../../domain/enums/DocumentApprovalStatus.js";

export interface OrganizationDocumentPatientApprovalReadModel {
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
  fileUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationDocumentPatientApprovalRepository {
  findByIdForPatientInOrganization(
    organizationId: string,
    patientId: string,
    approvalId: string,
  ): Promise<OrganizationDocumentPatientApproval | null>;
  findDetailsByIdForPatientInOrganization(
    organizationId: string,
    patientId: string,
    approvalId: string,
  ): Promise<OrganizationDocumentPatientApprovalReadModel | null>;
  findByDocumentAndPatient(
    documentId: string,
    patientId: string,
  ): Promise<OrganizationDocumentPatientApproval | null>;
  findAllByPatientInOrganization(
    organizationId: string,
    patientId: string,
  ): Promise<OrganizationDocumentPatientApprovalReadModel[]>;
  create(
    approval: OrganizationDocumentPatientApproval,
  ): Promise<OrganizationDocumentPatientApprovalReadModel>;
  save(
    approval: OrganizationDocumentPatientApproval,
  ): Promise<OrganizationDocumentPatientApprovalReadModel>;
}

import type {
  OrganizationDocumentPatientApproval as PrismaOrganizationDocumentPatientApproval,
  Prisma,
} from "@prisma/client";
import type { OrganizationDocumentPatientApprovalReadModel } from "../../application/repositories/OrganizationDocumentPatientApprovalRepository.js";
import { OrganizationDocumentPatientApproval } from "../../domain/entities/OrganizationDocumentPatientApproval.js";
import { DocumentApprovalStatus } from "../../domain/enums/DocumentApprovalStatus.js";

export class OrganizationDocumentPatientApprovalMapper {
  static toDomain(
    record: PrismaOrganizationDocumentPatientApproval,
  ): OrganizationDocumentPatientApproval {
    return OrganizationDocumentPatientApproval.create(
      {
        organizationId: record.organizationId,
        documentId: record.documentId,
        patientId: record.patientId,
        status: record.status as DocumentApprovalStatus,
        rejectedReason: record.rejectedReason,
        fileName: record.fileName,
        mimeType: record.mimeType,
        size: record.size,
        storageKey: record.storageKey,
      },
      record.id,
    );
  }

  static toReadModel(
    record: PrismaOrganizationDocumentPatientApproval,
  ): OrganizationDocumentPatientApprovalReadModel {
    return {
      id: record.id,
      organizationId: record.organizationId,
      documentId: record.documentId,
      patientId: record.patientId,
      status: record.status as DocumentApprovalStatus,
      rejectedReason: record.rejectedReason,
      fileName: record.fileName,
      mimeType: record.mimeType,
      size: record.size,
      storageKey: record.storageKey,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toPersistence(
    approval: OrganizationDocumentPatientApproval,
  ): Prisma.OrganizationDocumentPatientApprovalUncheckedCreateInput {
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
    };
  }

  static toUpdatePersistence(
    approval: OrganizationDocumentPatientApproval,
  ): Prisma.OrganizationDocumentPatientApprovalUncheckedUpdateInput {
    return {
      status: approval.status,
      rejectedReason: approval.rejectedReason,
      fileName: approval.fileName,
      mimeType: approval.mimeType,
      size: approval.size,
      storageKey: approval.storageKey,
    };
  }
}

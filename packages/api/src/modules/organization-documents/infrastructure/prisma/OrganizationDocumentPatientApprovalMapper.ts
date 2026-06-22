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
        documentId: record.documentId,
        patientId: record.patientId,
        status: record.status as DocumentApprovalStatus,
        rejectedReason: record.rejectedReason,
      },
      record.id,
    );
  }

  static toReadModel(
    record: PrismaOrganizationDocumentPatientApproval,
  ): OrganizationDocumentPatientApprovalReadModel {
    return {
      id: record.id,
      documentId: record.documentId,
      patientId: record.patientId,
      status: record.status as DocumentApprovalStatus,
      rejectedReason: record.rejectedReason,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toPersistence(
    approval: OrganizationDocumentPatientApproval,
  ): Prisma.OrganizationDocumentPatientApprovalUncheckedCreateInput {
    return {
      id: approval.id,
      documentId: approval.documentId,
      patientId: approval.patientId,
      status: approval.status,
      rejectedReason: approval.rejectedReason,
    };
  }

  static toUpdatePersistence(
    approval: OrganizationDocumentPatientApproval,
  ): Prisma.OrganizationDocumentPatientApprovalUncheckedUpdateInput {
    return {
      status: approval.status,
      rejectedReason: approval.rejectedReason,
    };
  }
}

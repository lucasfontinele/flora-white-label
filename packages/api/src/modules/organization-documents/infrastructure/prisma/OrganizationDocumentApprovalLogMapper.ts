import type { OrganizationDocumentApprovalLog as PrismaOrganizationDocumentApprovalLog, Prisma } from "@prisma/client";
import type { OrganizationDocumentApprovalLogReadModel } from "../../application/repositories/OrganizationDocumentApprovalLogRepository.js";
import { OrganizationDocumentApprovalLog } from "../../domain/entities/OrganizationDocumentApprovalLog.js";
import { DocumentApprovalAction } from "../../domain/enums/DocumentApprovalAction.js";

export class OrganizationDocumentApprovalLogMapper {
  static toDomain(record: PrismaOrganizationDocumentApprovalLog): OrganizationDocumentApprovalLog {
    return OrganizationDocumentApprovalLog.create(
      {
        action: record.action as DocumentApprovalAction,
        patientApprovalId: record.patientApprovalId,
        organizationUserId: record.organizationUserId,
      },
      record.id,
    );
  }

  static toReadModel(
    record: PrismaOrganizationDocumentApprovalLog,
  ): OrganizationDocumentApprovalLogReadModel {
    return {
      id: record.id,
      action: record.action as DocumentApprovalAction,
      patientApprovalId: record.patientApprovalId,
      organizationUserId: record.organizationUserId,
      createdAt: record.createdAt,
    };
  }

  static toPersistence(
    log: OrganizationDocumentApprovalLog,
  ): Prisma.OrganizationDocumentApprovalLogUncheckedCreateInput {
    return {
      id: log.id,
      action: log.action,
      patientApprovalId: log.patientApprovalId,
      organizationUserId: log.organizationUserId,
    };
  }
}

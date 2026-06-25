import type { OrganizationRequiredDocument as PrismaOrganizationRequiredDocument, Prisma } from "@prisma/client";
import type { OrganizationRequiredDocumentReadModel } from "../../application/repositories/OrganizationRequiredDocumentRepository.js";
import { OrganizationRequiredDocument } from "../../domain/entities/OrganizationRequiredDocument.js";

export class OrganizationRequiredDocumentMapper {
  static toDomain(record: PrismaOrganizationRequiredDocument): OrganizationRequiredDocument {
    return OrganizationRequiredDocument.create(
      {
        organizationId: record.organizationId,
        name: record.name,
        observations: record.observations,
      },
      record.id,
    );
  }

  static toReadModel(record: PrismaOrganizationRequiredDocument): OrganizationRequiredDocumentReadModel {
    return {
      id: record.id,
      organizationId: record.organizationId,
      name: record.name,
      observations: record.observations,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toPersistence(
    document: OrganizationRequiredDocument,
  ): Prisma.OrganizationRequiredDocumentUncheckedCreateInput {
    return {
      id: document.id,
      organizationId: document.organizationId,
      name: document.name,
      observations: document.observations,
    };
  }

  static toUpdatePersistence(
    document: OrganizationRequiredDocument,
  ): Prisma.OrganizationRequiredDocumentUncheckedUpdateInput {
    return {
      name: document.name,
      observations: document.observations,
    };
  }
}

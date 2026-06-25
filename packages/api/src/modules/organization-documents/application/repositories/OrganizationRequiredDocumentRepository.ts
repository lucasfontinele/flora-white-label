import type { OrganizationRequiredDocument } from "../../domain/entities/OrganizationRequiredDocument.js";

export interface OrganizationRequiredDocumentReadModel {
  id: string;
  organizationId: string;
  name: string;
  observations: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationRequiredDocumentRepository {
  findByIdInOrganization(
    organizationId: string,
    documentId: string,
  ): Promise<OrganizationRequiredDocument | null>;
  findDetailsByIdInOrganization(
    organizationId: string,
    documentId: string,
  ): Promise<OrganizationRequiredDocumentReadModel | null>;
  findByNameInOrganization(
    organizationId: string,
    name: string,
  ): Promise<OrganizationRequiredDocument | null>;
  findByNameInOrganizationExcludingId(
    organizationId: string,
    name: string,
    documentId: string,
  ): Promise<OrganizationRequiredDocument | null>;
  findAllByOrganization(organizationId: string): Promise<OrganizationRequiredDocumentReadModel[]>;
  create(document: OrganizationRequiredDocument): Promise<OrganizationRequiredDocumentReadModel>;
  save(document: OrganizationRequiredDocument): Promise<OrganizationRequiredDocumentReadModel>;
  delete(documentId: string): Promise<void>;
  hasApprovals(documentId: string): Promise<boolean>;
}

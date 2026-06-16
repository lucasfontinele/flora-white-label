import type { CreateOrganizationRecordInput, Organization } from "../../domain/organizations/organization.js";

export type OrganizationRepository = {
  create(input: CreateOrganizationRecordInput): Promise<Organization>;
  existsByCnpj(cnpj: string): Promise<boolean>;
};

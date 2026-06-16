import type { PaginationDto } from "@flora/shared/organizations";
import type { CreateOrganizationRecordInput, Organization } from "../../domain/organizations/organization.js";

export type ListOrganizationsInput = {
  page: number;
  perPage: number;
};

export type ListOrganizationsResult = {
  data: Organization[];
  pagination: PaginationDto;
};

export type OrganizationRepository = {
  create(input: CreateOrganizationRecordInput): Promise<Organization>;
  existsByCnpj(cnpj: string): Promise<boolean>;
  list(input: ListOrganizationsInput): Promise<ListOrganizationsResult>;
};

import type { ListOrganizationsResponse } from "@flora/shared/organizations";
import type { MasterUserContext } from "../../communication/http/plugins/master-auth.js";
import { organizationToListItem } from "../../domain/organizations/organization.js";
import type { OrganizationRepository } from "./organization-repository.js";

type ListOrganizationsUseCaseInput = {
  page?: number;
  perPage?: number;
};

const defaultPage = 1;
const defaultPerPage = 20;
const maxPerPage = 100;

export class ListOrganizationsUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(input: ListOrganizationsUseCaseInput, _masterUser: MasterUserContext): Promise<ListOrganizationsResponse> {
    const page = normalizePositiveInteger(input.page, defaultPage);
    const perPage = Math.min(normalizePositiveInteger(input.perPage, defaultPerPage), maxPerPage);
    const result = await this.organizationRepository.list({ page, perPage });

    return {
      data: result.data.map(organizationToListItem),
      pagination: result.pagination,
    };
  }
}

function normalizePositiveInteger(value: number | undefined, fallback: number) {
  if (!Number.isInteger(value) || Number(value) <= 0) return fallback;

  return Number(value);
}

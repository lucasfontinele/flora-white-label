import type {
  AssociateFilters,
  AssociateReadModel,
  OrganizationAssociateRepository,
} from "../repositories/OrganizationAssociateRepository.js";

export interface ListOrganizationAssociatesInput extends AssociateFilters {
  organizationId: string;
}

export interface ListOrganizationAssociatesOutput {
  data: AssociateReadModel[];
}

export class ListOrganizationAssociatesUseCase {
  constructor(private readonly deps: { associateRepository: OrganizationAssociateRepository }) {}

  async execute(input: ListOrganizationAssociatesInput): Promise<ListOrganizationAssociatesOutput> {
    const { organizationId, ...filters } = input;
    const data = await this.deps.associateRepository.findAssociates(organizationId, filters);

    return { data };
  }
}

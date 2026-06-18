import type {
  OrganizationReadModel,
  OrganizationRepository,
} from "../repositories/OrganizationRepository.js";

export interface ListOrganizationsOutput {
  data: OrganizationReadModel[];
}

export class ListOrganizationsUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(): Promise<ListOrganizationsOutput> {
    const data = await this.organizationRepository.findAllDetails();

    return { data };
  }
}

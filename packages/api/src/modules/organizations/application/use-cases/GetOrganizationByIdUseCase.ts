import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type {
  OrganizationReadModel,
  OrganizationRepository,
} from "../repositories/OrganizationRepository.js";

export interface GetOrganizationByIdInput {
  id: string;
}

export class GetOrganizationByIdUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(input: GetOrganizationByIdInput): Promise<OrganizationReadModel> {
    const organization = await this.organizationRepository.findDetailsById(input.id);

    if (!organization) {
      throw new NotFoundError(`Organization "${input.id}" was not found.`);
    }

    return organization;
  }
}

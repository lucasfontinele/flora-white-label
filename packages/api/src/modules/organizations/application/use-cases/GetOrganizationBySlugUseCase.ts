import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import { slugify } from "../../domain/slug.js";
import type {
  OrganizationPublicReadModel,
  OrganizationRepository,
} from "../repositories/OrganizationRepository.js";

export interface GetOrganizationBySlugInput {
  slug: string;
}

/**
 * Resolves the public tenant view (id + branding) from a subdomain slug. The
 * input is normalized through `slugify` so casing/format quirks in the host
 * still match the stored slug.
 */
export class GetOrganizationBySlugUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(input: GetOrganizationBySlugInput): Promise<OrganizationPublicReadModel> {
    const slug = slugify(input.slug);
    const organization = await this.organizationRepository.findBySlug(slug);

    if (!organization) {
      throw new NotFoundError(`Organization with slug "${input.slug}" was not found.`);
    }

    return organization;
  }
}

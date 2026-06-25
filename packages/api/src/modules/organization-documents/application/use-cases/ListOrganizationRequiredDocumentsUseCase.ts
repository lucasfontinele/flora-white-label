import type {
  OrganizationRequiredDocumentReadModel,
  OrganizationRequiredDocumentRepository,
} from "../repositories/OrganizationRequiredDocumentRepository.js";

export interface ListOrganizationRequiredDocumentsInput {
  organizationId: string;
}

export interface ListOrganizationRequiredDocumentsOutput {
  data: OrganizationRequiredDocumentReadModel[];
}

export class ListOrganizationRequiredDocumentsUseCase {
  constructor(private readonly requiredDocumentRepository: OrganizationRequiredDocumentRepository) {}

  async execute(
    input: ListOrganizationRequiredDocumentsInput,
  ): Promise<ListOrganizationRequiredDocumentsOutput> {
    const data = await this.requiredDocumentRepository.findAllByOrganization(input.organizationId);

    return { data };
  }
}

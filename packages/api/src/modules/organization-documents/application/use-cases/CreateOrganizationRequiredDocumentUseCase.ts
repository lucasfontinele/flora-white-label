import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { OrganizationRepository } from "../../../organizations/application/repositories/OrganizationRepository.js";
import { OrganizationRequiredDocument } from "../../domain/entities/OrganizationRequiredDocument.js";
import type {
  OrganizationRequiredDocumentReadModel,
  OrganizationRequiredDocumentRepository,
} from "../repositories/OrganizationRequiredDocumentRepository.js";

export interface CreateOrganizationRequiredDocumentInput {
  organizationId: string;
  name: string;
  observations?: string | null;
}

export interface CreateOrganizationRequiredDocumentDependencies {
  organizationRepository: OrganizationRepository;
  requiredDocumentRepository: OrganizationRequiredDocumentRepository;
  unitOfWork: UnitOfWork;
}

export class CreateOrganizationRequiredDocumentUseCase {
  constructor(private readonly deps: CreateOrganizationRequiredDocumentDependencies) {}

  async execute(
    input: CreateOrganizationRequiredDocumentInput,
  ): Promise<OrganizationRequiredDocumentReadModel> {
    const organization = await this.deps.organizationRepository.findById(input.organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found.");
    }

    const document = OrganizationRequiredDocument.create({
      organizationId: input.organizationId,
      name: input.name,
      observations: input.observations,
    });

    const duplicated = await this.deps.requiredDocumentRepository.findByNameInOrganization(
      document.organizationId,
      document.name,
    );
    if (duplicated) {
      throw new ConflictError("Required document already exists for this organization.");
    }

    return this.deps.unitOfWork.execute(() => this.deps.requiredDocumentRepository.create(document));
  }
}

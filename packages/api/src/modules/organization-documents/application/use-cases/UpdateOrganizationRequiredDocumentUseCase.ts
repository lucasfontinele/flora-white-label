import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { OrganizationRequiredDocument } from "../../domain/entities/OrganizationRequiredDocument.js";
import type {
  OrganizationRequiredDocumentReadModel,
  OrganizationRequiredDocumentRepository,
} from "../repositories/OrganizationRequiredDocumentRepository.js";

export interface UpdateOrganizationRequiredDocumentInput {
  organizationId: string;
  documentId: string;
  name: string;
  observations?: string | null;
}

export interface UpdateOrganizationRequiredDocumentDependencies {
  requiredDocumentRepository: OrganizationRequiredDocumentRepository;
  unitOfWork: UnitOfWork;
}

export class UpdateOrganizationRequiredDocumentUseCase {
  constructor(private readonly deps: UpdateOrganizationRequiredDocumentDependencies) {}

  async execute(
    input: UpdateOrganizationRequiredDocumentInput,
  ): Promise<OrganizationRequiredDocumentReadModel> {
    const current = await this.deps.requiredDocumentRepository.findByIdInOrganization(
      input.organizationId,
      input.documentId,
    );
    if (!current) {
      throw new NotFoundError("Required document not found.");
    }

    const updated = OrganizationRequiredDocument.create(
      { organizationId: input.organizationId, name: input.name, observations: input.observations },
      input.documentId,
    );

    const duplicated =
      await this.deps.requiredDocumentRepository.findByNameInOrganizationExcludingId(
        updated.organizationId,
        updated.name,
        updated.id,
      );
    if (duplicated) {
      throw new ConflictError("Required document already exists for this organization.");
    }

    return this.deps.unitOfWork.execute(() => this.deps.requiredDocumentRepository.save(updated));
  }
}

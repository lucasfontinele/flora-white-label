import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { OrganizationRequiredDocumentRepository } from "../repositories/OrganizationRequiredDocumentRepository.js";

export interface DeleteOrganizationRequiredDocumentInput {
  organizationId: string;
  documentId: string;
}

export interface DeleteOrganizationRequiredDocumentDependencies {
  requiredDocumentRepository: OrganizationRequiredDocumentRepository;
  unitOfWork: UnitOfWork;
}

export class DeleteOrganizationRequiredDocumentUseCase {
  constructor(private readonly deps: DeleteOrganizationRequiredDocumentDependencies) {}

  async execute(input: DeleteOrganizationRequiredDocumentInput): Promise<void> {
    const document = await this.deps.requiredDocumentRepository.findByIdInOrganization(
      input.organizationId,
      input.documentId,
    );
    if (!document) {
      throw new NotFoundError("Required document not found.");
    }

    const hasApprovals = await this.deps.requiredDocumentRepository.hasApprovals(document.id);
    if (hasApprovals) {
      throw new ConflictError("Required document has patient approvals and cannot be removed.");
    }

    await this.deps.unitOfWork.execute(() => this.deps.requiredDocumentRepository.delete(document.id));
  }
}

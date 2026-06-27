import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { PrescriberRepository } from "../repositories/PrescriberRepository.js";

export interface DeletePrescriberInput {
  organizationId: string;
  patientId: string;
  prescriberId: string;
}

export interface DeletePrescriberDependencies {
  prescriberRepository: PrescriberRepository;
  unitOfWork: UnitOfWork;
}

export class DeletePrescriberUseCase {
  constructor(private readonly deps: DeletePrescriberDependencies) {}

  async execute(input: DeletePrescriberInput): Promise<void> {
    const prescriber = await this.deps.prescriberRepository.findById(input.prescriberId);
    if (
      !prescriber ||
      prescriber.organizationId !== input.organizationId ||
      prescriber.patientId !== input.patientId
    ) {
      throw new NotFoundError("Prescriber not found.");
    }

    await this.deps.unitOfWork.execute(() =>
      this.deps.prescriberRepository.delete(prescriber.id),
    );
  }
}

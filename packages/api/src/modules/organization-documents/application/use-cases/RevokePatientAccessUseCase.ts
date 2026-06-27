import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type {
  PatientReadModel,
  PatientRepository,
} from "../../../patients/application/repositories/PatientRepository.js";

export interface RevokePatientAccessInput {
  organizationId: string;
  patientId: string;
}

export interface RevokePatientAccessDependencies {
  patientRepository: PatientRepository;
  unitOfWork: UnitOfWork;
}

/**
 * Lets an operator revoke an associate's access: the patient is sent back to
 * WAITING_DOCUMENTS, which immediately blocks the catalog and purchases until a
 * new approval. A no-op-safe transition (idempotent for non-approved patients).
 */
export class RevokePatientAccessUseCase {
  constructor(private readonly deps: RevokePatientAccessDependencies) {}

  async execute(input: RevokePatientAccessInput): Promise<PatientReadModel> {
    const patient = await this.deps.patientRepository.findByIdInOrganization(
      input.organizationId,
      input.patientId,
    );
    if (!patient) {
      throw new NotFoundError("Patient not found.");
    }

    patient.revertToWaitingDocuments();
    await this.deps.unitOfWork.execute(() => this.deps.patientRepository.save(patient));

    const updated = await this.deps.patientRepository.findDetailsByIdInOrganization(
      input.organizationId,
      input.patientId,
    );
    if (!updated) {
      throw new NotFoundError("Patient not found.");
    }

    return updated;
  }
}

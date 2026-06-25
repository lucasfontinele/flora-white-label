import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type {
  PatientReadModel,
  PatientRepository,
} from "../../../patients/application/repositories/PatientRepository.js";

export interface RejectPatientRegistrationInput {
  organizationId: string;
  patientId: string;
  reason: string;
}

export interface RejectPatientRegistrationDependencies {
  patientRepository: PatientRepository;
  unitOfWork: UnitOfWork;
}

export class RejectPatientRegistrationUseCase {
  constructor(private readonly deps: RejectPatientRegistrationDependencies) {}

  async execute(input: RejectPatientRegistrationInput): Promise<PatientReadModel> {
    const patient = await this.deps.patientRepository.findByIdInOrganization(
      input.organizationId,
      input.patientId,
    );
    if (!patient) {
      throw new NotFoundError("Patient not found.");
    }

    // Throws DomainValidationError (422) when the reason is blank.
    patient.rejectRegistration(input.reason);

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

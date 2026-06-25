import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { PatientPrescriptionRepository } from "../repositories/PatientPrescriptionRepository.js";

export interface DeletePatientPrescriptionInput {
  organizationId: string;
  patientId: string;
}

export interface DeletePatientPrescriptionDependencies {
  prescriptionRepository: PatientPrescriptionRepository;
  unitOfWork: UnitOfWork;
}

export class DeletePatientPrescriptionUseCase {
  constructor(private readonly deps: DeletePatientPrescriptionDependencies) {}

  async execute(input: DeletePatientPrescriptionInput): Promise<void> {
    const existing = await this.deps.prescriptionRepository.findByPatient(
      input.organizationId,
      input.patientId,
    );
    if (!existing) {
      throw new NotFoundError("Prescription not found.");
    }

    await this.deps.unitOfWork.execute(() =>
      this.deps.prescriptionRepository.delete(existing.id),
    );
  }
}

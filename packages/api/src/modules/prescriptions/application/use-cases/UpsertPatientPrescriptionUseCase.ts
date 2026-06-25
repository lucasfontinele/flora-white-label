import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { OrganizationRepository } from "../../../organizations/application/repositories/OrganizationRepository.js";
import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import { PatientPrescription } from "../../domain/entities/PatientPrescription.js";
import type {
  PatientPrescriptionReadModel,
  PatientPrescriptionRepository,
} from "../repositories/PatientPrescriptionRepository.js";

export interface UpsertPatientPrescriptionInput {
  organizationId: string;
  patientId: string;
  validUntil: Date;
  observations?: string | null;
}

export interface UpsertPatientPrescriptionDependencies {
  organizationRepository: OrganizationRepository;
  patientRepository: PatientRepository;
  prescriptionRepository: PatientPrescriptionRepository;
  unitOfWork: UnitOfWork;
}

/**
 * Sets the prescription validity date for a patient. The model keeps a single
 * active prescription per patient, so this creates the record on first use and
 * replaces it on subsequent edits.
 */
export class UpsertPatientPrescriptionUseCase {
  constructor(private readonly deps: UpsertPatientPrescriptionDependencies) {}

  async execute(input: UpsertPatientPrescriptionInput): Promise<PatientPrescriptionReadModel> {
    const organization = await this.deps.organizationRepository.findById(input.organizationId);
    if (!organization) {
      throw new NotFoundError("Organization not found.");
    }

    const patient = await this.deps.patientRepository.findByIdInOrganization(
      input.organizationId,
      input.patientId,
    );
    if (!patient) {
      throw new NotFoundError("Patient not found.");
    }

    const existing = await this.deps.prescriptionRepository.findByPatient(
      input.organizationId,
      input.patientId,
    );

    const prescription = PatientPrescription.create(
      {
        organizationId: input.organizationId,
        patientId: input.patientId,
        validUntil: input.validUntil,
        observations: input.observations,
      },
      existing?.id,
    );

    if (existing) {
      return this.deps.unitOfWork.execute(() =>
        this.deps.prescriptionRepository.save(prescription),
      );
    }

    return this.deps.unitOfWork.execute(() =>
      this.deps.prescriptionRepository.create(prescription),
    );
  }
}

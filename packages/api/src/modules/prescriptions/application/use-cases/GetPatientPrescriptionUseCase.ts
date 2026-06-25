import type {
  PatientPrescriptionReadModel,
  PatientPrescriptionRepository,
} from "../repositories/PatientPrescriptionRepository.js";

export interface GetPatientPrescriptionInput {
  organizationId: string;
  patientId: string;
}

export interface GetPatientPrescriptionOutput {
  prescription: PatientPrescriptionReadModel | null;
}

export class GetPatientPrescriptionUseCase {
  constructor(private readonly prescriptionRepository: PatientPrescriptionRepository) {}

  async execute(input: GetPatientPrescriptionInput): Promise<GetPatientPrescriptionOutput> {
    const prescription = await this.prescriptionRepository.findDetailsByPatient(
      input.organizationId,
      input.patientId,
    );

    return { prescription };
  }
}

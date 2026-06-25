import type {
  PatientPrescriptionReadModel,
  PatientPrescriptionRepository,
} from "../repositories/PatientPrescriptionRepository.js";

export interface ListPatientPrescriptionsInput {
  organizationId: string;
}

export interface ListPatientPrescriptionsOutput {
  data: PatientPrescriptionReadModel[];
}

export class ListPatientPrescriptionsUseCase {
  constructor(private readonly prescriptionRepository: PatientPrescriptionRepository) {}

  async execute(input: ListPatientPrescriptionsInput): Promise<ListPatientPrescriptionsOutput> {
    const data = await this.prescriptionRepository.findAllByOrganization(input.organizationId);

    return { data };
  }
}

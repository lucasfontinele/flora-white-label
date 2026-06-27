import type {
  PrescriberReadModel,
  PrescriberRepository,
} from "../repositories/PrescriberRepository.js";

export interface ListPrescribersByPatientInput {
  organizationId: string;
  patientId: string;
}

export interface ListPrescribersByPatientOutput {
  data: PrescriberReadModel[];
}

export class ListPrescribersByPatientUseCase {
  constructor(private readonly prescriberRepository: PrescriberRepository) {}

  async execute(input: ListPrescribersByPatientInput): Promise<ListPrescribersByPatientOutput> {
    const data = await this.prescriberRepository.findByPatient(
      input.organizationId,
      input.patientId,
    );

    return { data };
  }
}

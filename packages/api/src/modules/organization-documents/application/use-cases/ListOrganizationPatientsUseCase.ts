import type {
  PatientReadModel,
  PatientRepository,
} from "../../../patients/application/repositories/PatientRepository.js";
import type { PatientStatus } from "../../../patients/domain/enums/PatientStatus.js";

export interface ListOrganizationPatientsInput {
  organizationId: string;
  status?: PatientStatus;
}

export interface ListOrganizationPatientsOutput {
  data: PatientReadModel[];
}

export class ListOrganizationPatientsUseCase {
  constructor(private readonly deps: { patientRepository: PatientRepository }) {}

  async execute(input: ListOrganizationPatientsInput): Promise<ListOrganizationPatientsOutput> {
    const data = await this.deps.patientRepository.findManyByOrganization(
      input.organizationId,
      input.status,
    );

    return { data };
  }
}

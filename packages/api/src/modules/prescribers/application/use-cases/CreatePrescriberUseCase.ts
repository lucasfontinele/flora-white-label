import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { PatientRepository } from "../../../patients/application/repositories/PatientRepository.js";
import { Prescriber } from "../../domain/entities/Prescriber.js";
import type {
  PrescriberReadModel,
  PrescriberRepository,
} from "../repositories/PrescriberRepository.js";

export interface CreatePrescriberInput {
  organizationId: string;
  patientId: string;
  fullName: string;
  crm: string;
  crmState: string;
}

export interface CreatePrescriberDependencies {
  patientRepository: PatientRepository;
  prescriberRepository: PrescriberRepository;
  unitOfWork: UnitOfWork;
}

export class CreatePrescriberUseCase {
  constructor(private readonly deps: CreatePrescriberDependencies) {}

  async execute(input: CreatePrescriberInput): Promise<PrescriberReadModel> {
    const patient = await this.deps.patientRepository.findByIdInOrganization(
      input.organizationId,
      input.patientId,
    );
    if (!patient) {
      throw new NotFoundError("Patient not found.");
    }

    const prescriber = Prescriber.create({
      organizationId: input.organizationId,
      patientId: input.patientId,
      fullName: input.fullName,
      crm: input.crm,
      crmState: input.crmState,
    });

    const existing = await this.deps.prescriberRepository.findByPatient(
      input.organizationId,
      input.patientId,
    );
    if (existing.some((item) => item.crm === prescriber.crm && item.crmState === prescriber.crmState)) {
      throw new ConflictError("This prescriber (CRM/UF) is already registered for the patient.");
    }

    return this.deps.unitOfWork.execute(() => this.deps.prescriberRepository.create(prescriber));
  }
}

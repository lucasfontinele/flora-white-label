import { ConflictError } from "../../../../shared/application/errors/ConflictError.js";
import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type {
  PrescriberReadModel,
  PrescriberRepository,
} from "../repositories/PrescriberRepository.js";

export interface UpdatePrescriberInput {
  organizationId: string;
  patientId: string;
  prescriberId: string;
  fullName: string;
  crm: string;
  crmState: string;
}

export interface UpdatePrescriberDependencies {
  prescriberRepository: PrescriberRepository;
  unitOfWork: UnitOfWork;
}

export class UpdatePrescriberUseCase {
  constructor(private readonly deps: UpdatePrescriberDependencies) {}

  async execute(input: UpdatePrescriberInput): Promise<PrescriberReadModel> {
    const prescriber = await this.deps.prescriberRepository.findById(input.prescriberId);
    if (
      !prescriber ||
      prescriber.organizationId !== input.organizationId ||
      prescriber.patientId !== input.patientId
    ) {
      throw new NotFoundError("Prescriber not found.");
    }

    prescriber.update({
      fullName: input.fullName,
      crm: input.crm,
      crmState: input.crmState,
    });

    const siblings = await this.deps.prescriberRepository.findByPatient(
      input.organizationId,
      input.patientId,
    );
    const duplicate = siblings.some(
      (item) =>
        item.id !== prescriber.id &&
        item.crm === prescriber.crm &&
        item.crmState === prescriber.crmState,
    );
    if (duplicate) {
      throw new ConflictError("This prescriber (CRM/UF) is already registered for the patient.");
    }

    return this.deps.unitOfWork.execute(() => this.deps.prescriberRepository.save(prescriber));
  }
}

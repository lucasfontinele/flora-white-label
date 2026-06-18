import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import type { AddressRepository } from "../../../addresses/application/repositories/AddressRepository.js";
import type { OrganizationRepository } from "../repositories/OrganizationRepository.js";

export interface DeleteOrganizationInput {
  id: string;
}

export interface DeleteOrganizationDependencies {
  organizationRepository: OrganizationRepository;
  addressRepository: AddressRepository;
  unitOfWork: UnitOfWork;
}

export class DeleteOrganizationUseCase {
  constructor(private readonly deps: DeleteOrganizationDependencies) {}

  async execute(input: DeleteOrganizationInput): Promise<void> {
    await this.deps.unitOfWork.execute(async () => {
      const organization = await this.deps.organizationRepository.findById(input.id);

      if (!organization) {
        throw new NotFoundError(`Organization "${input.id}" was not found.`);
      }

      await this.deps.organizationRepository.delete(organization.id);
      await this.deps.addressRepository.delete(organization.addressId);
    });
  }
}

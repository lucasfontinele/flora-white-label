import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type { UnitOfWork } from "../../../../shared/application/transaction/UnitOfWork.js";
import { UserProfile } from "../../domain/enums/UserProfile.js";
import type { UserRepository } from "../repositories/UserRepository.js";

export interface SetUserAccessInput {
  organizationId: string;
  userId: string;
  isActive: boolean;
}

export interface SetUserAccessOutput {
  userId: string;
  isActive: boolean;
}

export interface SetUserAccessDependencies {
  userRepository: UserRepository;
  unitOfWork: UnitOfWork;
}

export class SetUserAccessUseCase {
  constructor(private readonly deps: SetUserAccessDependencies) {}

  async execute(input: SetUserAccessInput): Promise<SetUserAccessOutput> {
    const user = await this.deps.userRepository.findById(input.userId);
    const isAssociate =
      user?.profile === UserProfile.Patient || user?.profile === UserProfile.Guardian;

    if (!user || user.organizationId !== input.organizationId || !isAssociate) {
      throw new NotFoundError("Associate not found.");
    }

    user.setAccessEnabled(input.isActive);
    await this.deps.unitOfWork.execute(() => this.deps.userRepository.save(user));

    return { userId: user.id, isActive: user.isActive };
  }
}

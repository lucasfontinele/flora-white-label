import { AuthenticationError } from "../../../../shared/application/errors/AuthenticationError.js";
import { ForbiddenError } from "../../../../shared/application/errors/ForbiddenError.js";
import type { AuthenticatedUserContextRepository } from "../../../users/application/repositories/AuthenticatedUserContextRepository.js";
import type { UserRepository } from "../../../users/application/repositories/UserRepository.js";
import {
  assembleAuthContext,
  toPublicUser,
  type AuthenticatedContextView,
  type AuthPublicUser,
} from "../auth-context.js";

export interface MeResponse {
  user: AuthPublicUser;
  context: AuthenticatedContextView;
}

export interface GetMeInput {
  userId: string;
}

/**
 * Refreshes a patient's registration status on demand — invoked when the patient
 * portal hits `/me`. Re-evaluates each patient bound to the user (expired receita
 * or missing required documents demote them to WAITING_DOCUMENTS) and returns the
 * up-to-date authenticated context.
 */
export interface PatientStatusRefresher {
  execute(input: { organizationId: string; patientId: string }): Promise<unknown>;
}

export interface GetMeDependencies {
  userRepository: UserRepository;
  contextRepository: AuthenticatedUserContextRepository;
  patientStatusRefresher: PatientStatusRefresher;
}

export class GetMeUseCase {
  constructor(private readonly deps: GetMeDependencies) {}

  async execute(input: GetMeInput): Promise<MeResponse> {
    const user = await this.deps.userRepository.findById(input.userId);
    if (!user) {
      throw new AuthenticationError();
    }
    if (!user.isActive) {
      throw new ForbiddenError("Seu acesso foi desabilitado. Procure a associação.");
    }

    const initialContext = await this.deps.contextRepository.findByUserId(user.id);

    const patientIds = new Set<string>();
    if (user.patientId) {
      patientIds.add(user.patientId);
    }
    for (const managedPatient of initialContext?.managedPatients ?? []) {
      patientIds.add(managedPatient.id);
    }

    for (const patientId of patientIds) {
      await this.deps.patientStatusRefresher.execute({
        organizationId: user.organizationId,
        patientId,
      });
    }

    // Re-read so the assembled context reflects any status change above.
    const refreshedContext = patientIds.size
      ? await this.deps.contextRepository.findByUserId(user.id)
      : initialContext;

    return {
      user: toPublicUser(user),
      context: assembleAuthContext(user, refreshedContext),
    };
  }
}

import { AuthenticationError } from "../../../../shared/application/errors/AuthenticationError.js";
import { ForbiddenError } from "../../../../shared/application/errors/ForbiddenError.js";
import type { HashService } from "../../../../shared/application/cryptography/HashService.js";
import type { JwtPayload, JwtService } from "../../../../shared/application/tokens/JwtService.js";
import type { AuthenticatedUserContextRepository } from "../../../users/application/repositories/AuthenticatedUserContextRepository.js";
import type { UserRepository } from "../../../users/application/repositories/UserRepository.js";
import { Email } from "../../../users/domain/value-objects/Email.js";
import {
  assembleAuthContext,
  toPublicUser,
  type AuthenticatedContextView,
  type AuthenticatedUserProfile,
  type AuthPublicUser,
  type AuthView,
} from "../auth-context.js";

export type { AuthenticatedUserProfile, AuthView };

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  profile: AuthenticatedUserProfile;
  organizationId: string;
  patientId: string | null;
  guardianId?: string;
  organizationEmployeeId?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthPublicUser;
  context: AuthenticatedContextView;
}

export interface AuthenticateUserDependencies {
  userRepository: UserRepository;
  contextRepository: AuthenticatedUserContextRepository;
  hashService: HashService;
  jwtService: JwtService;
}

export class AuthenticateUserUseCase {
  constructor(private readonly deps: AuthenticateUserDependencies) {}

  async execute(input: AuthenticateUserInput): Promise<LoginResponse> {
    const email = Email.create(input.email);
    const user = await this.deps.userRepository.findByEmail(email);

    if (!user) {
      throw new AuthenticationError();
    }

    const passwordMatches = await this.deps.hashService.verify(
      user.passwordHash.value,
      input.password,
    );

    if (!passwordMatches) {
      throw new AuthenticationError();
    }

    if (!user.isActive) {
      throw new ForbiddenError("Seu acesso foi desabilitado. Procure a associação.");
    }

    const publicUser = toPublicUser(user);

    const tokenPayload: AuthTokenPayload = {
      sub: publicUser.id,
      email: publicUser.email,
      profile: publicUser.profile,
      organizationId: publicUser.organizationId,
      patientId: publicUser.patientId,
      ...(publicUser.guardianId ? { guardianId: publicUser.guardianId } : {}),
      ...(publicUser.organizationEmployeeId
        ? { organizationEmployeeId: publicUser.organizationEmployeeId }
        : {}),
    };

    const accessToken = await this.deps.jwtService.sign(tokenPayload);
    const authenticatedContext = await this.deps.contextRepository.findByUserId(user.id);

    return {
      accessToken,
      user: publicUser,
      context: assembleAuthContext(user, authenticatedContext),
    };
  }
}

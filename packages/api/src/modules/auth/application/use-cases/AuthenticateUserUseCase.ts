import { AuthenticationError } from "../../../../shared/application/errors/AuthenticationError.js";
import type { HashService } from "../../../../shared/application/cryptography/HashService.js";
import type { JwtPayload, JwtService } from "../../../../shared/application/tokens/JwtService.js";
import type { UserRepository } from "../../../users/application/repositories/UserRepository.js";
import { UserProfile } from "../../../users/domain/enums/UserProfile.js";
import { Email } from "../../../users/domain/value-objects/Email.js";

export type AuthenticatedUserProfile = "Master" | "Organization" | "Patient" | "Guardian";
export type AuthView = "BackofficeMaster" | "Organization" | "PatientPortal";

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  profile: AuthenticatedUserProfile;
  organizationId: string;
  guardianId: string | null;
  patientId: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    profile: AuthenticatedUserProfile;
    organizationId: string;
    guardianId: string | null;
    patientId: string | null;
  };
  context: {
    view: AuthView;
    organizationId: string;
    guardianId: string | null;
    patientId: string | null;
  };
}

export interface AuthenticateUserDependencies {
  userRepository: UserRepository;
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

    const publicUser = {
      id: user.id,
      email: user.email.value,
      profile: user.profile,
      organizationId: user.organizationId,
      guardianId: user.guardianId ?? null,
      patientId: user.patientId ?? null,
    };

    const tokenPayload: AuthTokenPayload = {
      sub: publicUser.id,
      email: publicUser.email,
      profile: publicUser.profile,
      organizationId: publicUser.organizationId,
      guardianId: publicUser.guardianId,
      patientId: publicUser.patientId,
    };

    const accessToken = await this.deps.jwtService.sign(tokenPayload);

    return {
      accessToken,
      user: publicUser,
      context: {
        view: this.resolveView(user.profile),
        organizationId: publicUser.organizationId,
        guardianId: publicUser.guardianId,
        patientId: publicUser.patientId,
      },
    };
  }

  private resolveView(profile: UserProfile): AuthView {
    switch (profile) {
      case UserProfile.Master:
        return "BackofficeMaster";
      case UserProfile.Organization:
        return "Organization";
      case UserProfile.Guardian:
      case UserProfile.Patient:
        return "PatientPortal";
    }
  }
}

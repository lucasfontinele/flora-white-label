import { AuthenticationError } from "../../../../shared/application/errors/AuthenticationError.js";
import type { HashService } from "../../../../shared/application/cryptography/HashService.js";
import type { JwtPayload, JwtService } from "../../../../shared/application/tokens/JwtService.js";
import type {
  AuthenticatedUserContext,
  AuthenticatedUserContextPatient,
  AuthenticatedUserContextRepository,
} from "../../../users/application/repositories/AuthenticatedUserContextRepository.js";
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
  organizationEmployeeId: string | null;
}

export interface AuthPatientContext {
  id: string;
  name: string;
  document: string;
  relationshipLabel: string;
  underPrivileged: boolean;
}

export interface AuthGuardianContext {
  id: string;
  name: string;
  document: string;
}

export interface AuthEmployeeContext {
  id: string;
  fullName: string;
  document: string;
  isActive: boolean;
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
    organizationEmployeeId: string | null;
  };
  context: {
    view: AuthView;
    organizationId: string;
    guardianId: string | null;
    patientId: string | null;
    organizationEmployeeId: string | null;
    guardian: AuthGuardianContext | null;
    patient: AuthPatientContext | null;
    employee: AuthEmployeeContext | null;
    managedPatients: AuthPatientContext[];
  };
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

    const isEmployee = user.profile === UserProfile.Organization;

    const publicUser = {
      id: user.id,
      email: user.email.value,
      profile: user.profile,
      organizationId: user.organizationId,
      guardianId: user.profile === UserProfile.Guardian ? (user.guardianId ?? null) : null,
      patientId: user.patientId ?? null,
      organizationEmployeeId: isEmployee ? (user.organizationEmployeeId ?? null) : null,
    };

    const tokenPayload: AuthTokenPayload = {
      sub: publicUser.id,
      email: publicUser.email,
      profile: publicUser.profile,
      organizationId: publicUser.organizationId,
      guardianId: publicUser.guardianId,
      patientId: publicUser.patientId,
      organizationEmployeeId: publicUser.organizationEmployeeId,
    };

    const accessToken = await this.deps.jwtService.sign(tokenPayload);
    const authenticatedContext = await this.deps.contextRepository.findByUserId(user.id);

    return {
      accessToken,
      user: publicUser,
      context: {
        view: this.resolveView(user.profile),
        organizationId: publicUser.organizationId,
        guardianId: publicUser.guardianId,
        patientId: publicUser.patientId,
        organizationEmployeeId: publicUser.organizationEmployeeId,
        guardian:
          user.profile === UserProfile.Guardian ? (authenticatedContext?.guardian ?? null) : null,
        patient:
          user.profile === UserProfile.Patient
            ? this.resolvePatientContext(authenticatedContext, publicUser.patientId)
            : null,
        employee:
          isEmployee && publicUser.organizationEmployeeId
            ? this.resolveEmployeeContext(authenticatedContext)
            : null,
        managedPatients:
          user.profile === UserProfile.Guardian
            ? (authenticatedContext?.managedPatients.map((patient) =>
                this.toPatientContext(patient, publicUser.patientId),
              ) ?? [])
            : [],
      },
    };
  }

  private resolveEmployeeContext(
    context: AuthenticatedUserContext | null,
  ): AuthEmployeeContext | null {
    if (!context?.employee) {
      return null;
    }

    return {
      id: context.employee.id,
      fullName: context.employee.fullName,
      document: context.employee.document,
      isActive: context.employee.isActive,
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

  private resolvePatientContext(
    context: AuthenticatedUserContext | null,
    patientId: string | null,
  ): AuthPatientContext | null {
    if (!context || !patientId) {
      return null;
    }

    const patient =
      context.patient ?? context.managedPatients.find((managedPatient) => managedPatient.id === patientId);

    return patient ? this.toPatientContext(patient, patientId) : null;
  }

  private toPatientContext(
    patient: AuthenticatedUserContextPatient,
    userPatientId: string | null,
  ): AuthPatientContext {
    return {
      id: patient.id,
      name: patient.name,
      document: patient.document,
      relationshipLabel: patient.id === userPatientId ? "Titular" : "Paciente vinculado",
      underPrivileged: patient.underPrivileged,
    };
  }
}

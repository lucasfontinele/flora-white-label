import { NotFoundError } from "../../../../shared/application/errors/NotFoundError.js";
import type {
  AuthenticatedUserContextPatient,
  AuthenticatedUserContextRepository,
} from "../repositories/AuthenticatedUserContextRepository.js";

export type AuthenticatedUserProfile = "Master" | "Organization" | "Patient" | "Guardian";

export interface GetAuthenticatedUserContextInput {
  userId: string;
}

export interface AuthenticatedUserPatientContext {
  id: string;
  name: string;
  document: string;
  relationshipLabel: string;
  underPrivileged: boolean;
}

export interface ManagedPatientContext extends AuthenticatedUserPatientContext {
  isActive: boolean;
}

export interface AuthenticatedUserEmployeeContext {
  id: string;
  fullName: string;
  document: string;
  isActive: boolean;
}

export interface GetAuthenticatedUserContextOutput {
  user: {
    id: string;
    email: string;
    profile: AuthenticatedUserProfile;
    organizationId: string;
  };
  guardian?: {
    id: string;
    name: string;
    document: string;
  };
  employee?: AuthenticatedUserEmployeeContext;
  activePatient?: AuthenticatedUserPatientContext;
  managedPatients: ManagedPatientContext[];
  capabilities: {
    canManagePatients: boolean;
    canBecomePatient: boolean;
    isPatient: boolean;
    isEmployee: boolean;
  };
}

export interface GetAuthenticatedUserContextDependencies {
  contextRepository: AuthenticatedUserContextRepository;
}

export class GetAuthenticatedUserContextUseCase {
  constructor(private readonly deps: GetAuthenticatedUserContextDependencies) {}

  async execute(input: GetAuthenticatedUserContextInput): Promise<GetAuthenticatedUserContextOutput> {
    const context = await this.deps.contextRepository.findByUserId(input.userId);

    if (!context) {
      throw new NotFoundError(`Authenticated user context not found for user "${input.userId}".`);
    }

    const activePatientSource = context.user.patientId
      ? context.managedPatients.find((patient) => patient.id === context.user.patientId) ??
        context.patient
      : context.managedPatients[0];

    const activePatientId = activePatientSource?.id;
    const managedPatients = context.managedPatients.map((patient) => ({
      ...this.toPatientContext(patient, context.user.patientId),
      isActive: patient.id === activePatientId,
    }));

    const isEmployee =
      context.user.profile === "Organization" && Boolean(context.user.organizationEmployeeId);

    return {
      user: {
        id: context.user.id,
        email: context.user.email,
        profile: context.user.profile,
        organizationId: context.user.organizationId,
      },
      guardian: context.guardian,
      employee:
        isEmployee && context.employee
          ? {
              id: context.employee.id,
              fullName: context.employee.fullName,
              document: context.employee.document,
              isActive: context.employee.isActive,
            }
          : undefined,
      activePatient: activePatientSource
        ? this.toPatientContext(activePatientSource, context.user.patientId)
        : undefined,
      managedPatients,
      capabilities: {
        canManagePatients: Boolean(context.user.guardianId),
        canBecomePatient: Boolean(context.user.guardianId && !context.user.patientId),
        isPatient: Boolean(context.user.patientId),
        isEmployee,
      },
    };
  }

  private toPatientContext(
    patient: AuthenticatedUserContextPatient,
    userPatientId?: string,
  ): AuthenticatedUserPatientContext {
    return {
      id: patient.id,
      name: patient.name,
      document: patient.document,
      relationshipLabel: patient.id === userPatientId ? "Titular" : "Paciente vinculado",
      underPrivileged: patient.underPrivileged,
    };
  }
}

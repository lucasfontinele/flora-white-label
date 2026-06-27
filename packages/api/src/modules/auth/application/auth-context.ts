import type {
  AuthenticatedUserContext,
  AuthenticatedUserContextPatient,
} from "../../users/application/repositories/AuthenticatedUserContextRepository.js";
import type { User } from "../../users/domain/entities/User.js";
import { UserProfile } from "../../users/domain/enums/UserProfile.js";

export type AuthenticatedUserProfile = "Master" | "Organization" | "Patient" | "Guardian";
export type AuthView = "BackofficeMaster" | "Organization" | "PatientPortal";

export interface AuthPatientContext {
  id: string;
  name: string;
  document: string;
  relationshipLabel: string;
  underPrivileged: boolean;
  patientStatus: AuthenticatedUserContextPatient["patientStatus"];
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

export interface AuthOrganizationContext {
  id: string;
  tradeName: string;
  legalName: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

export interface AuthPublicUser {
  id: string;
  email: string;
  profile: AuthenticatedUserProfile;
  organizationId: string;
  patientId: string | null;
  guardianId?: string;
  organizationEmployeeId?: string;
}

export interface AuthenticatedContextView {
  view: AuthView;
  organizationId: string;
  patientId: string | null;
  guardianId?: string;
  organizationEmployeeId?: string;
  organization: AuthOrganizationContext | null;
  guardian: AuthGuardianContext | null;
  patient: AuthPatientContext | null;
  employee: AuthEmployeeContext | null;
  managedPatients: AuthPatientContext[];
}

export function toPublicUser(user: User): AuthPublicUser {
  return {
    id: user.id,
    email: user.email.value,
    profile: user.profile,
    organizationId: user.organizationId,
    patientId: user.patientId ?? null,
    ...(user.guardianId ? { guardianId: user.guardianId } : {}),
    ...(user.organizationEmployeeId
      ? { organizationEmployeeId: user.organizationEmployeeId }
      : {}),
  };
}

/**
 * Assembles the per-view authenticated context (organization/guardian/patient/
 * employee + managed patients) from the user and its resolved context read
 * model. Shared by login and the `/me` refresh so both stay in sync.
 */
export function assembleAuthContext(
  user: User,
  authenticatedContext: AuthenticatedUserContext | null,
): AuthenticatedContextView {
  const publicUser = toPublicUser(user);
  const isEmployee = user.profile === UserProfile.Organization;

  return {
    view: resolveView(user.profile),
    organizationId: publicUser.organizationId,
    patientId: publicUser.patientId,
    ...(publicUser.guardianId ? { guardianId: publicUser.guardianId } : {}),
    ...(publicUser.organizationEmployeeId
      ? { organizationEmployeeId: publicUser.organizationEmployeeId }
      : {}),
    organization: authenticatedContext?.organization ?? null,
    guardian:
      user.profile === UserProfile.Guardian ? (authenticatedContext?.guardian ?? null) : null,
    patient:
      user.profile === UserProfile.Patient
        ? resolvePatientContext(authenticatedContext, publicUser.patientId)
        : null,
    employee:
      isEmployee && publicUser.organizationEmployeeId
        ? resolveEmployeeContext(authenticatedContext)
        : null,
    managedPatients:
      user.profile === UserProfile.Guardian
        ? (authenticatedContext?.managedPatients.map((patient) =>
            toPatientContext(patient, publicUser.patientId),
          ) ?? [])
        : [],
  };
}

function resolveEmployeeContext(
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

function resolveView(profile: UserProfile): AuthView {
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

function resolvePatientContext(
  context: AuthenticatedUserContext | null,
  patientId: string | null,
): AuthPatientContext | null {
  if (!context || !patientId) {
    return null;
  }

  const patient =
    context.patient ??
    context.managedPatients.find((managedPatient) => managedPatient.id === patientId);

  return patient ? toPatientContext(patient, patientId) : null;
}

function toPatientContext(
  patient: AuthenticatedUserContextPatient,
  userPatientId: string | null,
): AuthPatientContext {
  return {
    id: patient.id,
    name: patient.name,
    document: patient.document,
    relationshipLabel: patient.id === userPatientId ? "Titular" : "Paciente vinculado",
    underPrivileged: patient.underPrivileged,
    patientStatus: patient.patientStatus,
  };
}

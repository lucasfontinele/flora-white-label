import type { PatientRegistrationStatus } from "@flora/shared/authentication";
import type { UserProfile } from "../../domain/enums/UserProfile.js";

export interface AuthenticatedUserContextUser {
  id: string;
  email: string;
  profile: UserProfile;
  organizationId: string;
  guardianId?: string;
  patientId?: string;
  organizationEmployeeId?: string;
}

export interface AuthenticatedUserContextGuardian {
  id: string;
  name: string;
  document: string;
}

export interface AuthenticatedUserContextPatient {
  id: string;
  name: string;
  document: string;
  underPrivileged: boolean;
  patientStatus: PatientRegistrationStatus;
}

export interface AuthenticatedUserContextEmployee {
  id: string;
  organizationId: string;
  fullName: string;
  document: string;
  isActive: boolean;
}

export interface AuthenticatedUserContextOrganization {
  id: string;
  tradeName: string;
  legalName: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

export interface AuthenticatedUserContext {
  user: AuthenticatedUserContextUser;
  organization?: AuthenticatedUserContextOrganization;
  guardian?: AuthenticatedUserContextGuardian;
  patient?: AuthenticatedUserContextPatient;
  employee?: AuthenticatedUserContextEmployee;
  managedPatients: AuthenticatedUserContextPatient[];
}

export interface AuthenticatedUserContextRepository {
  findByUserId(userId: string): Promise<AuthenticatedUserContext | null>;
}

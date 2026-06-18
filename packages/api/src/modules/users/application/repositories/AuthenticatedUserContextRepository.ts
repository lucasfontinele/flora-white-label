import type { UserProfile } from "../../domain/enums/UserProfile.js";

export interface AuthenticatedUserContextUser {
  id: string;
  email: string;
  profile: UserProfile;
  organizationId: string;
  guardianId?: string;
  patientId?: string;
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
}

export interface AuthenticatedUserContext {
  user: AuthenticatedUserContextUser;
  guardian?: AuthenticatedUserContextGuardian;
  patient?: AuthenticatedUserContextPatient;
  managedPatients: AuthenticatedUserContextPatient[];
}

export interface AuthenticatedUserContextRepository {
  findByUserId(userId: string): Promise<AuthenticatedUserContext | null>;
}

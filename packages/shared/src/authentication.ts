export type AuthenticatedUserProfile = "Master" | "Organization" | "Patient" | "Guardian";
export type AuthView = "BackofficeMaster" | "Organization" | "PatientPortal";

export type AuthenticatedUserDto = {
  email: string;
  id: string;
  organizationId: string;
  profile: AuthenticatedUserProfile;
  patientId: string | null;
  guardianId?: string;
  organizationEmployeeId?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

// Patient registration lifecycle (mirrors the API `PatientStatus` enum). Only
// `APPROVAL` means the association approved the patient.
export type PatientRegistrationStatus =
  | "WAITING_DOCUMENTS"
  | "WAITING_APPROVAL"
  | "APPROVAL"
  | "REJECTED";

export type AuthPatientContextDto = {
  id: string;
  name: string;
  document: string;
  relationshipLabel: string;
  underPrivileged: boolean;
  patientStatus: PatientRegistrationStatus;
};

export type AuthGuardianContextDto = {
  id: string;
  name: string;
  document: string;
};

export type AuthEmployeeContextDto = {
  id: string;
  fullName: string;
  document: string;
  isActive: boolean;
};

export type AuthOrganizationContextDto = {
  id: string;
  tradeName: string;
  legalName: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
};

export type AuthContextDto = {
  view: AuthView;
  organizationId: string;
  patientId: string | null;
  guardianId?: string;
  organizationEmployeeId?: string;
  organization: AuthOrganizationContextDto | null;
  guardian: AuthGuardianContextDto | null;
  patient: AuthPatientContextDto | null;
  employee: AuthEmployeeContextDto | null;
  managedPatients: AuthPatientContextDto[];
};

export type LoginResponse = {
  accessToken: string;
  user: AuthenticatedUserDto;
  context: AuthContextDto;
};

export type CurrentSessionResponse = {
  data: {
    user: AuthenticatedUserDto;
    context: AuthContextDto;
  };
};

export type LogoutResponse = {
  data: {
    signedOut: true;
  };
};

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "SESSION_EXPIRED"
  | "SESSION_REVOKED"
  | "INVALID_TOKEN"
  | "AUTHORIZATION_REQUIRED"
  | "AUTHORIZATION_FORBIDDEN";

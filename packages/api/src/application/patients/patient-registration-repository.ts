import type { AuthenticatedUserProfile } from "../../domain/patients/patient.js";
import type { ParsedPatientRegistrationInput } from "../../domain/patients/patient-registration.js";

export type CreatePatientRegistrationRecordInput = Omit<ParsedPatientRegistrationInput, "user"> & {
  user: Omit<ParsedPatientRegistrationInput["user"], "password"> & {
    passwordHash: string;
  };
};

export type CreatedPatientRegistration = {
  profile: AuthenticatedUserProfile;
  user: {
    email: string;
    id: string;
    role: "TUTOR" | "PATIENT";
  };
};

export type PatientRegistrationRepository = {
  create(input: CreatePatientRegistrationRecordInput): Promise<CreatedPatientRegistration>;
  existsByEmail(email: string): Promise<boolean>;
};

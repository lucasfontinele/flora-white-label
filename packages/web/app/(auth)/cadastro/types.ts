export type RegistrationRole = "pet_tutor" | "legal_guardian" | "patient";

export type Gender = "masculino" | "feminino" | "outro" | "prefiro_nao_informar";

// --- API contract: POST /organizations/:organizationId/patient-registrations ---
// The payload is a discriminated union by `registrationType` (UserProfile).

export type ApiRegistrationType = "Patient" | "LegalGuardian" | "PetTutor";

export type ApiGender = "M" | "F" | "O" | "N/A";

export type RegistrationUser = {
  email: string;
  password: string;
};

export type RegistrationPerson = {
  name: string;
  document: string;
  birthdate: string;
  gender: ApiGender;
};

export type RegistrationPatient = RegistrationPerson & {
  underPrivileged: boolean;
};

export type PatientRegistrationBody =
  | { registrationType: "Patient"; user: RegistrationUser; patient: RegistrationPatient }
  | {
      registrationType: "LegalGuardian";
      user: RegistrationUser;
      guardian: RegistrationPerson;
      patient: RegistrationPatient;
    }
  | { registrationType: "PetTutor"; user: RegistrationUser; guardian: RegistrationPerson };

export type PatientRegistrationResponse = {
  userId: string;
  guardianId: string | null;
  patientId: string | null;
  registrationType: ApiRegistrationType;
};

export type GuardianRelationship = "pai_mae" | "tutor" | "filho" | "cuidador" | "procurador";

export type PetSpecies = "Canina" | "Felina" | "Equina" | "Aviária" | "Exótica" | "Silvestre" | "Outras";

export type RegistrationFormData = {
  role: RegistrationRole;
  fullName: string;
  cpf?: string;
  birthDate: string;
  nickname?: string;
  gender: Gender;
  email: string;
  password: string;
  passwordConfirmation: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  state: string;
  city: string;
  guardianFullName?: string;
  guardianCpf?: string;
  guardianRg?: string;
  guardianRelationship?: GuardianRelationship;
  guardianBirthDate?: string;
  guardianPhone?: string;
  guardianCep?: string;
  guardianStreet?: string;
  guardianNumber?: string;
  guardianComplement?: string;
  guardianNeighborhood?: string;
  guardianState?: string;
  guardianCity?: string;
  petName?: string;
  petSpecies?: PetSpecies | "";
  petBreed?: string;
  petBirthDate?: string;
  petDiagnosis?: string;
};

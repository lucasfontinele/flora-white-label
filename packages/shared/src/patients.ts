export type UserRole = "TUTOR" | "PATIENT";

export type RegistrationRole = "pet_tutor" | "legal_guardian" | "patient";

export type RegistrationGender = "masculino" | "feminino" | "outro" | "prefiro_nao_informar";

export type RegistrationGuardianRelationship =
  | "pai_mae"
  | "tutor"
  | "filho"
  | "cuidador"
  | "procurador";

export type RegistrationPetSpecies =
  | "Canina"
  | "Felina"
  | "Equina"
  | "Aviária"
  | "Exótica"
  | "Silvestre"
  | "Outras";

export type PatientType = "HUMANO" | "ANIMAL";

export type PatientGender = "MASCULINO" | "FEMININO" | "OUTRO" | "PREFIRO_NAO_INFORMAR";

export type GuardianRelationship =
  | "MAE_PAI"
  | "TUTOR"
  | "FILHO"
  | "CUIDADOR"
  | "PROCURADOR";

export type PetSpecies =
  | "CANINA"
  | "FELINA"
  | "EQUINA"
  | "AVIARIA"
  | "EXOTICA"
  | "SILVESTRE"
  | "OUTRAS";

export type PatientAddressDto = {
  cep: string;
  city: string;
  complement?: string;
  id: string;
  logradouro: string;
  neighborhood: string;
  number: string;
  state: string;
};

export type AuthPetDto = {
  birthDate: string | null;
  breed: string | null;
  diagnosis: string | null;
  id: string;
  name: string;
  patientId: string;
  species: PetSpecies;
};

export type AuthPatientDto = {
  address: PatientAddressDto | null;
  birthDate: string | null;
  document: string | null;
  fullName: string;
  gender: PatientGender | null;
  id: string;
  nickname: string | null;
  organizationId: string | null;
  pet: AuthPetDto | null;
  phone: string | null;
  type: PatientType;
  userId: string | null;
};

export type AuthPatientGuardianDto = {
  address: PatientAddressDto | null;
  birthDate: string;
  document: string;
  fullName: string;
  id: string;
  patient: AuthPatientDto;
  patientId: string;
  phone: string;
  relationship: GuardianRelationship;
  rg: string | null;
  userId: string;
};

export type AuthenticatedUserProfileDto = {
  guardianships: AuthPatientGuardianDto[];
  patient: AuthPatientDto | null;
};

export type CreatePatientRegistrationRequest = {
  birthDate: string;
  cep: string;
  city: string;
  complement?: string;
  cpf: string;
  email: string;
  fullName: string;
  gender: RegistrationGender;
  guardianBirthDate?: string;
  guardianCep?: string;
  guardianCity?: string;
  guardianComplement?: string;
  guardianCpf?: string;
  guardianFullName?: string;
  guardianNeighborhood?: string;
  guardianNumber?: string;
  guardianPhone?: string;
  guardianRelationship?: RegistrationGuardianRelationship;
  guardianRg?: string;
  guardianState?: string;
  guardianStreet?: string;
  neighborhood: string;
  nickname?: string;
  number: string;
  organizationId?: string;
  password: string;
  passwordConfirmation: string;
  petBirthDate?: string;
  petBreed?: string;
  petDiagnosis?: string;
  petName?: string;
  petSpecies?: RegistrationPetSpecies | "";
  phone: string;
  role: RegistrationRole;
  state: string;
  street: string;
};

export type CreatePatientRegistrationResponse = {
  data: {
    user: {
      email: string;
      id: string;
      role: UserRole;
    };
    profile: AuthenticatedUserProfileDto;
  };
};

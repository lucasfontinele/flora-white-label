export type RegistrationRole = "pet_tutor" | "legal_guardian" | "patient";

export type Gender = "masculino" | "feminino" | "outro" | "prefiro_nao_informar";

export type GuardianRelationship = "pai_mae" | "tutor";

export type PetSpecies = "Canina" | "Felina" | "Equina" | "Aviária" | "Exótica" | "Silvestre" | "Outras";

export type RegistrationFormData = {
  role: RegistrationRole;
  fullName: string;
  cpf?: string;
  birthDate: string;
  nickname?: string;
  gender: Gender;
  email: string;
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
  guardianEmail?: string;
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

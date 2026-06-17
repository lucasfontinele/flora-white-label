import type {
  GuardianRelationship,
  PatientGender,
  PatientType,
  PetSpecies,
  RegistrationGender,
  RegistrationGuardianRelationship,
  RegistrationPetSpecies,
  RegistrationRole,
  UserRole,
} from "@flora/shared/patients";
import { ValidationException } from "../../exception/index.js";
import { createAddress, type Address } from "../addresses/address.js";
import {
  isFutureDate,
  isValidBrazilianPhone,
  isValidCpf,
  isValidEmail,
  normalizeCep,
  normalizeCpf,
  normalizePhone,
  normalizeText,
  parseDateOnly,
} from "../shared/validation.js";

export type PatientRegistrationPatientInput = {
  address?: Address;
  birthDate: Date | null;
  document: string | null;
  fullName: string;
  gender: PatientGender | null;
  nickname?: string;
  organizationId: string | null;
  phone?: string;
  type: PatientType;
};

export type PatientRegistrationGuardianInput = {
  address: Address;
  birthDate: Date;
  document: string;
  fullName: string;
  phone: string;
  relationship: GuardianRelationship;
  rg?: string;
};

export type PatientRegistrationPetInput = {
  birthDate: Date | null;
  breed?: string;
  diagnosis?: string;
  name: string;
  species: PetSpecies;
};

export type ParsedPatientRegistrationInput = {
  guardian?: PatientRegistrationGuardianInput;
  patient: PatientRegistrationPatientInput;
  pet?: PatientRegistrationPetInput;
  user: {
    email: string;
    organizationId: string | null;
    password: string;
    role: UserRole;
  };
};

type ParseOptions = {
  now?: Date;
};

const genderMap: Record<RegistrationGender, PatientGender> = {
  feminino: "FEMININO",
  masculino: "MASCULINO",
  outro: "OUTRO",
  prefiro_nao_informar: "PREFIRO_NAO_INFORMAR",
};

const relationshipMap: Record<RegistrationGuardianRelationship, GuardianRelationship> = {
  cuidador: "CUIDADOR",
  filho: "FILHO",
  pai_mae: "MAE_PAI",
  procurador: "PROCURADOR",
  tutor: "TUTOR",
};

const speciesMap: Record<RegistrationPetSpecies, PetSpecies> = {
  Aviária: "AVIARIA",
  Canina: "CANINA",
  Equina: "EQUINA",
  Exótica: "EXOTICA",
  Felina: "FELINA",
  Outras: "OUTRAS",
  Silvestre: "SILVESTRE",
};

export function parsePatientRegistrationInput(
  input: unknown,
  options: ParseOptions = {},
): ParsedPatientRegistrationInput {
  if (!isRecord(input)) {
    throw new ValidationException("Cadastro inválido.");
  }

  const issues: string[] = [];
  const now = options.now ?? new Date();
  const role = readString(input.role) as RegistrationRole;
  const organizationId = optionalString(input.organizationId) ?? null;
  const email = normalizeText(readString(input.email)).toLowerCase();
  const password = readString(input.password);
  const passwordConfirmation = readString(input.passwordConfirmation);
  const fullName = normalizeText(readString(input.fullName));
  const document = normalizeCpf(readString(input.cpf));
  const birthDate = parseInputDate(readString(input.birthDate));
  const phone = normalizePhone(readString(input.phone));
  const gender = parseGender(readString(input.gender));
  const nickname = optionalString(input.nickname);

  if (!isRegistrationRole(role)) issues.push("Tipo de cadastro inválido.");
  if (!isValidEmail(email)) issues.push("E-mail inválido.");
  if (!isStrongPassword(password)) {
    issues.push("Senha deve ter ao menos 8 caracteres, uma letra minúscula e um número.");
  }
  if (password !== passwordConfirmation) issues.push("Confirmação de senha não confere.");
  if (!fullName) issues.push("Nome completo obrigatório.");
  if (!isValidCpf(document)) issues.push("CPF inválido.");
  if (!birthDate) issues.push("Data de nascimento inválida.");
  if (birthDate && isFutureDate(birthDate, now)) issues.push("Data de nascimento não pode ser futura.");
  if (!gender) issues.push("Gênero inválido.");
  if (!isValidBrazilianPhone(phone)) issues.push("Telefone inválido.");

  const baseAddress = parseAddress(input, issues);

  if (issues.length > 0 || !birthDate || !gender || !baseAddress || !isRegistrationRole(role)) {
    throw new ValidationException("Dados do cadastro inválidos.", issues);
  }

  if (role === "patient") {
    return {
      patient: {
        address: baseAddress,
        birthDate,
        document,
        fullName,
        gender,
        nickname,
        organizationId,
        phone,
        type: "HUMANO",
      },
      user: {
        email,
        organizationId,
        password,
        role: "PATIENT",
      },
    };
  }

  if (role === "legal_guardian") {
    const guardian = parseLegalGuardian(input, issues, now);

    if (issues.length > 0 || !guardian) {
      throw new ValidationException("Dados do cadastro inválidos.", issues);
    }

    return {
      guardian,
      patient: {
        address: baseAddress,
        birthDate,
        document,
        fullName,
        gender,
        nickname,
        organizationId,
        phone,
        type: "HUMANO",
      },
      user: {
        email,
        organizationId,
        password,
        role: "TUTOR",
      },
    };
  }

  const pet = parsePet(input, issues, now);

  if (issues.length > 0 || !pet) {
    throw new ValidationException("Dados do cadastro inválidos.", issues);
  }

  return {
    guardian: {
      address: baseAddress,
      birthDate,
      document,
      fullName,
      phone,
      relationship: "TUTOR",
    },
    patient: {
      birthDate: null,
      document: null,
      fullName: pet.name,
      gender: null,
      organizationId,
      type: "ANIMAL",
    },
    pet,
    user: {
      email,
      organizationId,
      password,
      role: "TUTOR",
    },
  };
}

function parseLegalGuardian(
  input: Record<string, unknown>,
  issues: string[],
  now: Date,
): PatientRegistrationGuardianInput | null {
  const fullName = normalizeText(readString(input.guardianFullName));
  const document = normalizeCpf(readString(input.guardianCpf));
  const rg = optionalString(input.guardianRg);
  const birthDate = parseInputDate(readString(input.guardianBirthDate));
  const phone = normalizePhone(readString(input.guardianPhone));
  const relationship = parseRelationship(readString(input.guardianRelationship));
  const address = parseAddress(
    {
      cep: input.guardianCep,
      city: input.guardianCity,
      complement: input.guardianComplement,
      neighborhood: input.guardianNeighborhood,
      number: input.guardianNumber,
      state: input.guardianState,
      street: input.guardianStreet,
    },
    issues,
  );

  if (!fullName) issues.push("Nome completo do responsável obrigatório.");
  if (!isValidCpf(document)) issues.push("CPF do responsável inválido.");
  if (!rg) issues.push("RG do responsável obrigatório.");
  if (!birthDate) issues.push("Data de nascimento do responsável inválida.");
  if (birthDate && isFutureDate(birthDate, now)) {
    issues.push("Data de nascimento do responsável não pode ser futura.");
  }
  if (!isValidBrazilianPhone(phone)) issues.push("Telefone do responsável inválido.");
  if (!relationship) issues.push("Tipo de relação inválido.");

  if (!birthDate || !relationship || !address) return null;

  return {
    address,
    birthDate,
    document,
    fullName,
    phone,
    relationship,
    rg,
  };
}

function parsePet(
  input: Record<string, unknown>,
  issues: string[],
  now: Date,
): PatientRegistrationPetInput | null {
  const name = normalizeText(readString(input.petName));
  const species = parseSpecies(readString(input.petSpecies));
  const breed = optionalString(input.petBreed);
  const birthDateInput = readString(input.petBirthDate);
  const birthDate = birthDateInput ? parseInputDate(birthDateInput) : null;
  const diagnosis = optionalString(input.petDiagnosis);

  if (!name) issues.push("Nome do PET obrigatório.");
  if (!species) issues.push("Espécie do PET inválida.");
  if (breed && breed.length > 100) issues.push("Raça do PET deve ter no máximo 100 caracteres.");
  if (birthDateInput && !birthDate) issues.push("Data de nascimento do PET inválida.");
  if (birthDate && isFutureDate(birthDate, now)) {
    issues.push("Data de nascimento do PET não pode ser futura.");
  }

  if (!name || !species) return null;

  return {
    birthDate,
    breed,
    diagnosis,
    name,
    species,
  };
}

function parseAddress(input: Record<string, unknown>, issues: string[]) {
  try {
    return createAddress({
      cep: normalizeCep(readString(input.cep)),
      city: readString(input.city),
      complement: optionalString(input.complement),
      logradouro: readString(input.street),
      neighborhood: readString(input.neighborhood),
      number: readString(input.number),
      state: readString(input.state),
    });
  } catch (error) {
    if (error instanceof ValidationException) {
      issues.push(...(Array.isArray(error.details) ? error.details.map(String) : [error.message]));
      return null;
    }

    throw error;
  }
}

function parseInputDate(value: string) {
  const normalized = value.trim();
  const brazilianDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(normalized);

  if (brazilianDate) {
    const [, day, month, year] = brazilianDate;
    return parseExactDate(`${year}-${month}-${day}`);
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? parseExactDate(normalized) : null;
}

function parseExactDate(value: string) {
  const date = parseDateOnly(value);
  if (!date) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseGender(value: string): PatientGender | null {
  return isRegistrationGender(value) ? genderMap[value] : null;
}

function parseRelationship(value: string): GuardianRelationship | null {
  return isRegistrationRelationship(value) ? relationshipMap[value] : null;
}

function parseSpecies(value: string): PetSpecies | null {
  return isRegistrationPetSpecies(value) ? speciesMap[value] : null;
}

function isStrongPassword(value: string) {
  return value.length >= 8 && /[a-z]/.test(value) && /\d/.test(value);
}

function isRegistrationRole(value: string): value is RegistrationRole {
  return value === "patient" || value === "legal_guardian" || value === "pet_tutor";
}

function isRegistrationGender(value: string): value is RegistrationGender {
  return value === "masculino" || value === "feminino" || value === "outro" || value === "prefiro_nao_informar";
}

function isRegistrationRelationship(value: string): value is RegistrationGuardianRelationship {
  return (
    value === "pai_mae" ||
    value === "tutor" ||
    value === "filho" ||
    value === "cuidador" ||
    value === "procurador"
  );
}

function isRegistrationPetSpecies(value: string): value is RegistrationPetSpecies {
  return (
    value === "Canina" ||
    value === "Felina" ||
    value === "Equina" ||
    value === "Aviária" ||
    value === "Exótica" ||
    value === "Silvestre" ||
    value === "Outras"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? normalizeText(value) : undefined;
}

import type {
  AuthPatientDto,
  AuthPatientGuardianDto,
  AuthPetDto,
  AuthenticatedUserProfileDto,
  GuardianRelationship,
  PatientAddressDto,
  PatientGender,
  PatientType,
  PetSpecies,
} from "@flora/shared/patients";
import type { Address } from "../addresses/address.js";

export type PersistedAddress = Address & {
  id: string;
};

export type Pet = {
  birthDate: Date | null;
  breed: string | null;
  diagnosis: string | null;
  id: string;
  name: string;
  patientId: string;
  species: PetSpecies;
};

export type Patient = {
  address: PersistedAddress | null;
  addressId: string | null;
  birthDate: Date | null;
  document: string | null;
  fullName: string;
  gender: PatientGender | null;
  id: string;
  nickname: string | null;
  organizationId: string | null;
  pet: Pet | null;
  phone: string | null;
  type: PatientType;
  userId: string | null;
};

export type PatientGuardian = {
  address: PersistedAddress | null;
  addressId: string | null;
  birthDate: Date;
  document: string;
  fullName: string;
  id: string;
  patient: Patient;
  patientId: string;
  phone: string;
  relationship: GuardianRelationship;
  rg: string | null;
  userId: string;
};

export type AuthenticatedUserProfile = {
  guardianships: PatientGuardian[];
  patient: Patient | null;
};

export function addressToDto(address: PersistedAddress | null): PatientAddressDto | null {
  if (!address) return null;

  return {
    cep: address.cep,
    city: address.city,
    complement: address.complement,
    id: address.id,
    logradouro: address.logradouro,
    neighborhood: address.neighborhood,
    number: address.number,
    state: address.state,
  };
}

export function petToDto(pet: Pet | null): AuthPetDto | null {
  if (!pet) return null;

  return {
    birthDate: pet.birthDate?.toISOString().slice(0, 10) ?? null,
    breed: pet.breed,
    diagnosis: pet.diagnosis,
    id: pet.id,
    name: pet.name,
    patientId: pet.patientId,
    species: pet.species,
  };
}

export function patientToDto(patient: Patient): AuthPatientDto {
  return {
    address: addressToDto(patient.address),
    birthDate: patient.birthDate?.toISOString().slice(0, 10) ?? null,
    document: patient.document,
    fullName: patient.fullName,
    gender: patient.gender,
    id: patient.id,
    nickname: patient.nickname,
    organizationId: patient.organizationId,
    pet: petToDto(patient.pet),
    phone: patient.phone,
    type: patient.type,
    userId: patient.userId,
  };
}

export function patientGuardianToDto(guardian: PatientGuardian): AuthPatientGuardianDto {
  return {
    address: addressToDto(guardian.address),
    birthDate: guardian.birthDate.toISOString().slice(0, 10),
    document: guardian.document,
    fullName: guardian.fullName,
    id: guardian.id,
    patient: patientToDto(guardian.patient),
    patientId: guardian.patientId,
    phone: guardian.phone,
    relationship: guardian.relationship,
    rg: guardian.rg,
    userId: guardian.userId,
  };
}

export function authenticatedUserProfileToDto(
  profile: AuthenticatedUserProfile | null | undefined,
): AuthenticatedUserProfileDto | null {
  if (!profile) return null;

  return {
    guardianships: profile.guardianships.map(patientGuardianToDto),
    patient: profile.patient ? patientToDto(profile.patient) : null,
  };
}

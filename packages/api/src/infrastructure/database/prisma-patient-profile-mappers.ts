import type { AuthenticatedUserProfile, Patient, PatientGuardian, PersistedAddress, Pet } from "../../domain/patients/patient.js";

export type AddressRecord = {
  cep: string;
  city: string;
  complement: string | null;
  id: string;
  logradouro: string;
  neighborhood: string;
  number: string;
  state: string;
};

export type PetRecord = {
  birthDate: Date | null;
  breed: string | null;
  diagnosis: string | null;
  id: string;
  name: string;
  patientId: string;
  species: string;
};

export type PatientRecord = {
  address: AddressRecord | null;
  addressId: string | null;
  birthDate: Date | null;
  document: string | null;
  fullName: string;
  gender: string | null;
  id: string;
  nickname: string | null;
  organizationId: string | null;
  pet: PetRecord | null;
  phone: string | null;
  type: string;
  userId: string | null;
};

export type PatientGuardianRecord = {
  address: AddressRecord | null;
  addressId: string | null;
  birthDate: Date;
  document: string;
  fullName: string;
  id: string;
  patient: PatientRecord;
  patientId: string;
  phone: string;
  relationship: string;
  rg: string | null;
  userId: string;
};

export function mapAuthenticatedUserProfile(user: {
  patient?: PatientRecord | null;
  patientGuardians?: PatientGuardianRecord[];
}): AuthenticatedUserProfile | null {
  const patient = user.patient ? mapPatient(user.patient) : null;
  const guardianships = (user.patientGuardians ?? []).map(mapPatientGuardian);

  if (!patient && guardianships.length === 0) return null;

  return {
    guardianships,
    patient,
  };
}

function mapAddress(address: AddressRecord | null): PersistedAddress | null {
  if (!address) return null;

  return {
    cep: address.cep,
    city: address.city,
    complement: address.complement ?? undefined,
    id: address.id,
    logradouro: address.logradouro,
    neighborhood: address.neighborhood,
    number: address.number,
    state: address.state,
  };
}

function mapPet(pet: PetRecord | null): Pet | null {
  if (!pet) return null;

  return {
    birthDate: pet.birthDate,
    breed: pet.breed,
    diagnosis: pet.diagnosis,
    id: pet.id,
    name: pet.name,
    patientId: pet.patientId,
    species: pet.species as Pet["species"],
  };
}

function mapPatient(patient: PatientRecord): Patient {
  return {
    address: mapAddress(patient.address),
    addressId: patient.addressId,
    birthDate: patient.birthDate,
    document: patient.document,
    fullName: patient.fullName,
    gender: patient.gender as Patient["gender"],
    id: patient.id,
    nickname: patient.nickname,
    organizationId: patient.organizationId,
    pet: mapPet(patient.pet),
    phone: patient.phone,
    type: patient.type as Patient["type"],
    userId: patient.userId,
  };
}

function mapPatientGuardian(guardian: PatientGuardianRecord): PatientGuardian {
  return {
    address: mapAddress(guardian.address),
    addressId: guardian.addressId,
    birthDate: guardian.birthDate,
    document: guardian.document,
    fullName: guardian.fullName,
    id: guardian.id,
    patient: mapPatient(guardian.patient),
    patientId: guardian.patientId,
    phone: guardian.phone,
    relationship: guardian.relationship as PatientGuardian["relationship"],
    rg: guardian.rg,
    userId: guardian.userId,
  };
}

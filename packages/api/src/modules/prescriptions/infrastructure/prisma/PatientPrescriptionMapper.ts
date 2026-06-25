import type { PatientPrescription as PrismaPatientPrescription, Prisma } from "@prisma/client";
import type { PatientPrescriptionReadModel } from "../../application/repositories/PatientPrescriptionRepository.js";
import { PatientPrescription } from "../../domain/entities/PatientPrescription.js";

type PrismaPatientPrescriptionWithPatient = PrismaPatientPrescription & {
  patient: { name: string };
};

export class PatientPrescriptionMapper {
  static toDomain(record: PrismaPatientPrescription): PatientPrescription {
    return PatientPrescription.create(
      {
        organizationId: record.organizationId,
        patientId: record.patientId,
        validUntil: record.validUntil,
        observations: record.observations,
      },
      record.id,
    );
  }

  static toReadModel(
    record: PrismaPatientPrescriptionWithPatient,
  ): PatientPrescriptionReadModel {
    return {
      id: record.id,
      organizationId: record.organizationId,
      patientId: record.patientId,
      patientName: record.patient.name,
      validUntil: record.validUntil,
      observations: record.observations,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toPersistence(
    prescription: PatientPrescription,
  ): Prisma.PatientPrescriptionUncheckedCreateInput {
    return {
      id: prescription.id,
      organizationId: prescription.organizationId,
      patientId: prescription.patientId,
      validUntil: prescription.validUntil,
      observations: prescription.observations,
    };
  }

  static toUpdatePersistence(
    prescription: PatientPrescription,
  ): Prisma.PatientPrescriptionUncheckedUpdateInput {
    return {
      validUntil: prescription.validUntil,
      observations: prescription.observations,
    };
  }
}

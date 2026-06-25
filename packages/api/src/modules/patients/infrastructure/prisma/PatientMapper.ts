import type { Prisma, Patient as PrismaPatient } from "@prisma/client";
import { Patient } from "../../domain/entities/Patient.js";
import { PatientStatus } from "../../domain/enums/PatientStatus.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import {
  genderFromPrisma,
  genderToPrisma,
} from "../../../../shared/infrastructure/database/prisma/gender-mapper.js";
import type { PatientReadModel } from "../../application/repositories/PatientRepository.js";

type PrismaPatientWithGuardian = PrismaPatient & { guardian?: { name: string } | null };

export class PatientMapper {
  static toDomain(record: PrismaPatient): Patient {
    return Patient.create(
      {
        organizationId: record.organizationId,
        guardianId: record.guardianId ?? undefined,
        name: record.name,
        document: Document.create(record.document),
        birthdate: record.birthdate,
        gender: genderFromPrisma(record.gender),
        underPrivileged: record.underPrivileged,
        patientStatus: record.patientStatus as PatientStatus,
        rejectionReason: record.rejectionReason,
      },
      record.id,
    );
  }

  static toReadModel(record: PrismaPatientWithGuardian): PatientReadModel {
    return {
      id: record.id,
      organizationId: record.organizationId,
      guardianId: record.guardianId ?? null,
      guardianName: record.guardian?.name ?? null,
      name: record.name,
      document: record.document,
      birthdate: record.birthdate,
      gender: genderFromPrisma(record.gender),
      underPrivileged: record.underPrivileged,
      patientStatus: record.patientStatus as PatientStatus,
      rejectionReason: record.rejectionReason,
      createdAt: record.createdAt,
    };
  }

  static toPersistence(patient: Patient): Prisma.PatientUncheckedCreateInput {
    return {
      id: patient.id,
      organizationId: patient.organizationId,
      guardianId: patient.guardianId ?? null,
      name: patient.name,
      document: patient.document.value,
      birthdate: patient.birthdate,
      gender: genderToPrisma(patient.gender),
      underPrivileged: patient.underPrivileged,
      patientStatus: patient.patientStatus,
      rejectionReason: patient.rejectionReason,
    };
  }

  static toUpdatePersistence(patient: Patient): Prisma.PatientUncheckedUpdateInput {
    return {
      patientStatus: patient.patientStatus,
      rejectionReason: patient.rejectionReason,
    };
  }
}

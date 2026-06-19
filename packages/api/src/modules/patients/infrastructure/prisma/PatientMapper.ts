import type { Prisma, Patient as PrismaPatient } from "@prisma/client";
import { Patient } from "../../domain/entities/Patient.js";
import { Document } from "../../../../shared/domain/value-objects/Document.js";
import {
  genderFromPrisma,
  genderToPrisma,
} from "../../../../shared/infrastructure/database/prisma/gender-mapper.js";

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
      },
      record.id,
    );
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
    };
  }
}

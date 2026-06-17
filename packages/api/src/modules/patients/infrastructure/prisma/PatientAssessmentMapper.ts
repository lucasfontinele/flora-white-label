import type { Prisma, PatientAssessment as PrismaPatientAssessment } from "@prisma/client";
import { PatientAssessment } from "../../domain/entities/PatientAssessment.js";

export class PatientAssessmentMapper {
  static toDomain(record: PrismaPatientAssessment): PatientAssessment {
    return PatientAssessment.create(
      {
        patientId: record.patientId,
        guardianId: record.guardianId,
        isApproved: record.isApproved,
        approvedAt: record.approvedAt,
      },
      record.id,
    );
  }

  static toPersistence(
    assessment: PatientAssessment,
  ): Prisma.PatientAssessmentUncheckedCreateInput {
    return {
      id: assessment.id,
      patientId: assessment.patientId,
      guardianId: assessment.guardianId,
      isApproved: assessment.isApproved,
      approvedAt: assessment.approvedAt,
    };
  }
}

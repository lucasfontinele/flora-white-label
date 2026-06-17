import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type { PatientAssessmentRepository } from "../../application/repositories/PatientAssessmentRepository.js";
import type { PatientAssessment } from "../../domain/entities/PatientAssessment.js";
import { PatientAssessmentMapper } from "./PatientAssessmentMapper.js";

export class PrismaPatientAssessmentRepository implements PatientAssessmentRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async create(patientAssessment: PatientAssessment): Promise<void> {
    await this.prisma.getClient().patientAssessment.create({
      data: PatientAssessmentMapper.toPersistence(patientAssessment),
    });
  }
}

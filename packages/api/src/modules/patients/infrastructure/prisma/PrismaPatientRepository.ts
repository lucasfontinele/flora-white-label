import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type { PatientRepository } from "../../application/repositories/PatientRepository.js";
import type { Patient } from "../../domain/entities/Patient.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";
import { PatientMapper } from "./PatientMapper.js";

export class PrismaPatientRepository implements PatientRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByDocument(organizationId: string, document: Document): Promise<Patient | null> {
    const record = await this.prisma.getClient().patient.findFirst({
      where: { organizationId, document: document.value },
    });

    return record ? PatientMapper.toDomain(record) : null;
  }

  async create(patient: Patient): Promise<void> {
    await this.prisma.getClient().patient.create({
      data: PatientMapper.toPersistence(patient),
    });
  }
}

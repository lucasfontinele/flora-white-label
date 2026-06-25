import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  PatientReadModel,
  PatientRepository,
} from "../../application/repositories/PatientRepository.js";
import type { Patient } from "../../domain/entities/Patient.js";
import type { PatientStatus } from "../../domain/enums/PatientStatus.js";
import type { Document } from "../../../../shared/domain/value-objects/Document.js";
import { PatientMapper } from "./PatientMapper.js";

export class PrismaPatientRepository implements PatientRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByIdInOrganization(organizationId: string, patientId: string): Promise<Patient | null> {
    const record = await this.prisma.getClient().patient.findFirst({
      where: { id: patientId, organizationId },
    });

    return record ? PatientMapper.toDomain(record) : null;
  }

  async findDetailsByIdInOrganization(
    organizationId: string,
    patientId: string,
  ): Promise<PatientReadModel | null> {
    const record = await this.prisma.getClient().patient.findFirst({
      where: { id: patientId, organizationId },
      include: { guardian: { select: { name: true } } },
    });

    return record ? PatientMapper.toReadModel(record) : null;
  }

  async findManyByOrganization(
    organizationId: string,
    status?: PatientStatus,
  ): Promise<PatientReadModel[]> {
    const records = await this.prisma.getClient().patient.findMany({
      where: { organizationId, ...(status ? { patientStatus: status } : {}) },
      include: { guardian: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => PatientMapper.toReadModel(record));
  }

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

  async save(patient: Patient): Promise<void> {
    await this.prisma.getClient().patient.update({
      where: { id: patient.id },
      data: PatientMapper.toUpdatePersistence(patient),
    });
  }
}

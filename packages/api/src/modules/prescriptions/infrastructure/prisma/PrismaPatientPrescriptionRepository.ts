import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  PatientPrescriptionReadModel,
  PatientPrescriptionRepository,
} from "../../application/repositories/PatientPrescriptionRepository.js";
import type { PatientPrescription } from "../../domain/entities/PatientPrescription.js";
import { PatientPrescriptionMapper } from "./PatientPrescriptionMapper.js";

const withPatientName = { patient: { select: { name: true } } } as const;

export class PrismaPatientPrescriptionRepository implements PatientPrescriptionRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findByPatient(
    organizationId: string,
    patientId: string,
  ): Promise<PatientPrescription | null> {
    const record = await this.prisma.getClient().patientPrescription.findFirst({
      where: { organizationId, patientId },
    });

    return record ? PatientPrescriptionMapper.toDomain(record) : null;
  }

  async findDetailsByPatient(
    organizationId: string,
    patientId: string,
  ): Promise<PatientPrescriptionReadModel | null> {
    const record = await this.prisma.getClient().patientPrescription.findFirst({
      where: { organizationId, patientId },
      include: withPatientName,
    });

    return record ? PatientPrescriptionMapper.toReadModel(record) : null;
  }

  async findAllByOrganization(
    organizationId: string,
  ): Promise<PatientPrescriptionReadModel[]> {
    const records = await this.prisma.getClient().patientPrescription.findMany({
      where: { organizationId },
      include: withPatientName,
      orderBy: { updatedAt: "desc" },
    });

    return records.map((record) => PatientPrescriptionMapper.toReadModel(record));
  }

  async create(prescription: PatientPrescription): Promise<PatientPrescriptionReadModel> {
    const record = await this.prisma.getClient().patientPrescription.create({
      data: PatientPrescriptionMapper.toPersistence(prescription),
      include: withPatientName,
    });

    return PatientPrescriptionMapper.toReadModel(record);
  }

  async save(prescription: PatientPrescription): Promise<PatientPrescriptionReadModel> {
    const record = await this.prisma.getClient().patientPrescription.update({
      where: { id: prescription.id },
      data: PatientPrescriptionMapper.toUpdatePersistence(prescription),
      include: withPatientName,
    });

    return PatientPrescriptionMapper.toReadModel(record);
  }

  async delete(prescriptionId: string): Promise<void> {
    await this.prisma.getClient().patientPrescription.delete({
      where: { id: prescriptionId },
    });
  }
}

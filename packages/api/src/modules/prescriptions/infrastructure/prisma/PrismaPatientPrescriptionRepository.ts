import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  PatientPrescriptionReadModel,
  PatientPrescriptionRepository,
} from "../../application/repositories/PatientPrescriptionRepository.js";
import type { PatientPrescription } from "../../domain/entities/PatientPrescription.js";
import type { PrescriptionItem } from "../../domain/entities/PrescriptionItem.js";
import { PatientPrescriptionMapper } from "./PatientPrescriptionMapper.js";

const readModelInclude = {
  patient: { select: { name: true } },
  items: {
    include: { product: { select: { name: true, unit: true } } },
    orderBy: { createdAt: "asc" },
  },
} as const;

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
      include: readModelInclude,
    });

    return record ? PatientPrescriptionMapper.toReadModel(record) : null;
  }

  async findAllByOrganization(
    organizationId: string,
  ): Promise<PatientPrescriptionReadModel[]> {
    const records = await this.prisma.getClient().patientPrescription.findMany({
      where: { organizationId },
      include: readModelInclude,
      orderBy: { updatedAt: "desc" },
    });

    return records.map((record) => PatientPrescriptionMapper.toReadModel(record));
  }

  async create(prescription: PatientPrescription): Promise<PatientPrescriptionReadModel> {
    const record = await this.prisma.getClient().patientPrescription.create({
      data: PatientPrescriptionMapper.toPersistence(prescription),
      include: readModelInclude,
    });

    return PatientPrescriptionMapper.toReadModel(record);
  }

  async save(prescription: PatientPrescription): Promise<PatientPrescriptionReadModel> {
    const record = await this.prisma.getClient().patientPrescription.update({
      where: { id: prescription.id },
      data: PatientPrescriptionMapper.toUpdatePersistence(prescription),
      include: readModelInclude,
    });

    return PatientPrescriptionMapper.toReadModel(record);
  }

  async replaceItems(prescriptionId: string, items: PrescriptionItem[]): Promise<void> {
    const client = this.prisma.getClient();

    await client.prescriptionItem.deleteMany({ where: { prescriptionId } });

    if (items.length > 0) {
      await client.prescriptionItem.createMany({
        data: items.map((item) => PatientPrescriptionMapper.itemToPersistence(item)),
      });
    }
  }

  async delete(prescriptionId: string): Promise<void> {
    await this.prisma.getClient().patientPrescription.delete({
      where: { id: prescriptionId },
    });
  }
}

import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type {
  PrescriberReadModel,
  PrescriberRepository,
} from "../../application/repositories/PrescriberRepository.js";
import type { Prescriber } from "../../domain/entities/Prescriber.js";
import { PrescriberMapper } from "./PrescriberMapper.js";

export class PrismaPrescriberRepository implements PrescriberRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async findById(id: string): Promise<Prescriber | null> {
    const record = await this.prisma.getClient().prescriber.findUnique({ where: { id } });

    return record ? PrescriberMapper.toDomain(record) : null;
  }

  async findByPatient(
    organizationId: string,
    patientId: string,
  ): Promise<PrescriberReadModel[]> {
    const records = await this.prisma.getClient().prescriber.findMany({
      where: { organizationId, patientId },
      orderBy: { createdAt: "asc" },
    });

    return records.map((record) => PrescriberMapper.toReadModel(record));
  }

  async create(prescriber: Prescriber): Promise<PrescriberReadModel> {
    const record = await this.prisma.getClient().prescriber.create({
      data: PrescriberMapper.toPersistence(prescriber),
    });

    return PrescriberMapper.toReadModel(record);
  }

  async save(prescriber: Prescriber): Promise<PrescriberReadModel> {
    const record = await this.prisma.getClient().prescriber.update({
      where: { id: prescriber.id },
      data: PrescriberMapper.toUpdatePersistence(prescriber),
    });

    return PrescriberMapper.toReadModel(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.getClient().prescriber.delete({ where: { id } });
  }
}

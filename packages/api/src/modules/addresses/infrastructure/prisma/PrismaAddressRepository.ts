import type { TransactionalPrisma } from "../../../../shared/infrastructure/database/prisma/PrismaTransactionManager.js";
import type { AddressRepository } from "../../application/repositories/AddressRepository.js";
import type { Address } from "../../domain/entities/Address.js";
import { AddressMapper } from "./AddressMapper.js";

export class PrismaAddressRepository implements AddressRepository {
  constructor(private readonly prisma: TransactionalPrisma) {}

  async create(address: Address): Promise<void> {
    await this.prisma.getClient().address.create({
      data: AddressMapper.toPersistence(address),
    });
  }
}

import { AsyncLocalStorage } from "node:async_hooks";
import type { Prisma } from "@prisma/client";
import type { UnitOfWork } from "../../../application/transaction/UnitOfWork.js";
import type { PrismaService } from "./PrismaService.js";

/**
 * Accessor used by Prisma repositories to obtain the client that is currently
 * in scope — the active transaction client when inside {@link UnitOfWork.execute},
 * or the base client otherwise.
 */
export interface TransactionalPrisma {
  getClient(): Prisma.TransactionClient;
}

/**
 * Prisma-backed {@link UnitOfWork}. It runs the work inside a single
 * `prisma.$transaction` and exposes the transaction client to repositories
 * through {@link AsyncLocalStorage}, so the use case never touches Prisma and
 * every repository call within the unit shares the same transaction.
 */
export class PrismaTransactionManager implements UnitOfWork, TransactionalPrisma {
  private readonly storage = new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor(private readonly prisma: PrismaService) {}

  getClient(): Prisma.TransactionClient {
    return this.storage.getStore() ?? this.prisma;
  }

  async execute<T>(work: () => Promise<T>): Promise<T> {
    const current = this.storage.getStore();

    if (current) {
      return work();
    }

    return this.prisma.$transaction((tx) => this.storage.run(tx, () => work()));
  }
}

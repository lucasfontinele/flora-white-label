/**
 * Application port for running a unit of work atomically. The concrete
 * implementation (Prisma transaction) lives in the infrastructure layer, so
 * use cases stay free of persistence details.
 */
export interface UnitOfWork {
  execute<T>(work: () => Promise<T>): Promise<T>;
}

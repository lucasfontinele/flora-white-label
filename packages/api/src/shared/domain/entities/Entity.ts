import { randomUUID } from "node:crypto";

/**
 * Base class for domain entities.
 *
 * An entity has a stable identity and is compared by that identity rather than
 * by its attributes. This class is framework-agnostic: it must not depend on
 * Fastify, Prisma or any HTTP/transport concern.
 */
export abstract class Entity<TProps> {
  protected readonly _id: string;
  protected readonly props: TProps;

  protected constructor(props: TProps, id?: string) {
    this._id = id ?? randomUUID();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  /**
   * Entities are equal when they share the same identity.
   */
  public equals(other?: Entity<TProps>): boolean {
    if (other === undefined || other === null) {
      return false;
    }

    if (this === other) {
      return true;
    }

    return this._id === other._id;
  }
}

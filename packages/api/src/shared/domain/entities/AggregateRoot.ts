import { Entity } from "./Entity.js";
import type { DomainEvent } from "../events/DomainEvent.js";

/**
 * Base class for aggregate roots.
 *
 * An aggregate root is an entity that also acts as the consistency boundary of
 * a cluster of objects and records the domain events raised while its
 * invariants change. Events are buffered in-memory and handed off (and
 * cleared) via {@link AggregateRoot.pullDomainEvents}. This class must not
 * depend on infrastructure.
 */
export abstract class AggregateRoot<TProps> extends Entity<TProps> {
  private _domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Returns the buffered domain events and clears the internal buffer so the
   * same event is never dispatched twice.
   */
  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];

    return events;
  }
}

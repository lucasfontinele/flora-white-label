/**
 * Contract implemented by every domain event.
 *
 * Concrete events live alongside their aggregate and are buffered by
 * {@link AggregateRoot} until dispatched by an application/infrastructure
 * dispatcher.
 */
export interface DomainEvent {
  aggregateId: string;
  occurredAt: Date;
}

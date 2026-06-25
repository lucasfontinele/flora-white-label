# Research: CRUD de Planos de Assinatura Master

## Decision: Keep `SubscriptionPlan` as an independent entity

**Rationale**: The current domain class extends `Entity`, the specification
explicitly says not to promote it to Aggregate Root, and the CRUD only manages
the catalog record itself. Organization continues to reference the plan through
the existing database relationship.

**Alternatives considered**:
- Promote to Aggregate Root: rejected because it adds scope not requested and
  conflicts with the spec.
- Move plan logic into Organization: rejected because plans are a global master
  catalog, not tenant-owned data.

## Decision: Reuse `MoneyInCents`

**Rationale**: `MoneyInCents` already exists in
`packages/api/src/shared/domain/value-objects/MoneyInCents.ts`, accepts zero and
positive integers, and rejects floats and negative values. Reusing it keeps
money handling consistent and avoids duplicate monetary rules.

**Alternatives considered**:
- Create a new money value object for subscription plans: rejected as duplicate
  behavior.
- Use decimal/float in the API or database: rejected by the spec and by money
  precision requirements.

## Decision: Make `description` nullable in Prisma

**Rationale**: The domain and spec treat `description` as optional. The current
Prisma schema declares `description String`, while the latest migration content
suggests nullable intent. The target schema should be `description String?`,
with implementation checking migration state before changing existing
migrations.

**Alternatives considered**:
- Keep `description` required and return empty string: rejected because it
  contradicts the spec and blurs the difference between absent and empty.
- Store empty strings for absent descriptions: rejected because the domain
  rejects blank descriptions.

## Decision: Validate HTTP input with Zod at Presentation

**Rationale**: The spec explicitly requires Zod validation and places
Presentation as the HTTP boundary. Existing use cases currently use Zod in
Application, but for this feature route params and bodies should be validated
with `safeParse` before calling use cases, so unhandled `ZodError` does not
reach the global error handler.

**Alternatives considered**:
- Put Zod only inside use cases: rejected for this feature because it conflicts
  with the requested presentation boundary and can produce incorrect HTTP
  errors today.
- Add a global Fastify/Zod validation middleware: rejected because there is no
  current pattern and the feature should stay narrow.

## Decision: Add application use cases for each CRUD operation

**Rationale**: Existing API modules place orchestration in
`application/use-cases`. Separate use cases keep create, list, get, update, and
delete independently testable and map directly to user stories.

**Alternatives considered**:
- Put CRUD logic directly in Fastify handlers: rejected because it would bypass
  the existing layered architecture.
- Use one large generic CRUD service: rejected because it hides business rules
  such as delete-in-use conflict and is unnecessary for five explicit flows.

## Decision: Expand the repository port but preserve `findById`

**Rationale**: `CreateOrganizationUseCase` already depends on
`SubscriptionPlanRepository.findById`. The CRUD needs create/list/update/delete
and timestamps for HTTP responses. The repository port should grow without
breaking the existing Organization use case.

**Alternatives considered**:
- Replace `findById` with a new response DTO method: rejected because it would
  force unrelated Organization changes.
- Return Prisma records from Application: rejected because Application must not
  depend on Prisma types.

## Decision: Use an application read model for timestamps

**Rationale**: Responses require `createdAt` and `updatedAt`, but those fields
are persistence metadata rather than current domain invariants. A
transport-agnostic application DTO/read model can include timestamps while the
domain entity remains focused on business rules.

**Alternatives considered**:
- Add timestamps to `SubscriptionPlanProps`: possible, but rejected for this
  slice because existing entities generally do not carry persistence timestamps.
- Drop timestamps from responses: rejected because the spec requires them.

## Decision: Guard delete through Organization reference check

**Rationale**: `Organization.currentPlanId` already references
`SubscriptionPlan`. The API should return a clear 409 conflict before attempting
to delete a plan in use, instead of surfacing a database foreign-key error.

**Alternatives considered**:
- Let Prisma throw a foreign-key error: rejected because it creates a less
  stable and less domain-specific API error.
- Soft delete plans: rejected because the spec asks for remove and does not
  request lifecycle/status changes.

## Decision: Keep authorization work out of implementation

**Rationale**: The user explicitly restricted authentication changes and new
authorization middleware. The current API does not yet have a reusable
backoffice master authorization pattern. The endpoint namespace
`/backoffice/subscription-plans` marks context for this slice; actual role
enforcement should reuse a future/existing auth marker when available.

**Alternatives considered**:
- Create a new master-only middleware now: rejected by user constraint.
- Touch the authentication feature: rejected by user constraint and out of
  scope.

## Decision: Register a narrow Fastify route plugin

**Rationale**: `buildApp()` currently registers global plugins and
`healthRoute`. A module route plugin under
`modules/subscription-plans/presentation/http` can be registered in `app.ts`
without creating a broad routing framework.

**Alternatives considered**:
- Put all routes in `shared/presentation/http/fastify/routes`: rejected because
  module behavior should stay near the domain module.
- Add a controller framework abstraction: rejected as unnecessary ceremony.

## Decision: Add centralized mapping for application not-found/conflict errors

**Rationale**: `NotFoundError` and `ConflictError` are already used by
application use cases, but the current global handler does not map them to
404/409. A narrow mapping preserves the structured `{ error, message }` shape
and benefits this CRUD without changing domain errors.

**Alternatives considered**:
- Catch application errors in every handler: rejected because it duplicates
  transport mapping.
- Change domain errors to carry HTTP status: rejected because domain must stay
  transport-agnostic.

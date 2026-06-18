# Research: CRUD de Organizações Master

## Decision: Reuse the existing `Organization` aggregate root

**Rationale**: `packages/api/src/modules/organizations/domain/entities/Organization.ts`
already extends `AggregateRoot` and validates `tradeName`, `legalName`,
`currentPlanId`, and `addressId`. The spec requires `Organization` to be the
Aggregate Root, so implementation should extend the current behavior rather
than replacing it.

**Alternatives considered**:
- Recreate `Organization` from scratch: rejected because the current aggregate
  already matches the architectural constraint.
- Move address or plan state inside the aggregate as nested entities: rejected
  because `Address` and `SubscriptionPlan` are independently persisted and
  referenced by ID.

## Decision: Reuse `Address` as a persistable entity

**Rationale**: `Address` already extends `Entity`, has its own Prisma model, and
is referenced by `Organization.addressId`. It normalizes strings, state, and
CEP, and it is wired through an address repository.

**Alternatives considered**:
- Make `Address` a value object embedded in `Organization`: rejected because
  the schema already persists addresses independently and the spec explicitly
  says `Address` is a persistable Entity.
- Create separate address endpoints: rejected by the spec.

## Decision: Tighten CEP validation in the domain if still missing

**Rationale**: The current `Address.create` removes non-digits from `zipcode`
but only checks for non-empty values. The spec requires CEP normalized to 8
digits. The rule belongs in `Address` because it is a domain invariant for a
persistable address, with route schemas catching the same invalid payload
earlier for HTTP requests.

**Alternatives considered**:
- Validate CEP only in Zod schemas: rejected because non-HTTP creation paths
  could persist invalid addresses.
- Add an external CEP service lookup: rejected because integrations are out of
  scope.

## Decision: Reuse `Cnpj` and `Cnae`

**Rationale**: `Cnpj` already accepts masked/unmasked input, strips non-digits,
stores 14 digits, rejects repeated digits, and validates official check digits.
`Cnae` already accepts masked/unmasked input, strips non-digits, stores exactly
7 digits, and intentionally avoids official table lookup.

**Alternatives considered**:
- Add a second CNPJ/CNAE implementation for backoffice: rejected as duplicate
  domain behavior.
- Relax CNPJ check-digit validation: rejected because the existing value object
  already implements the stronger allowed validation.

## Decision: Reuse `SubscriptionPlan` lookup and read data

**Rationale**: `SubscriptionPlan` already exists as an independent entity and
`SubscriptionPlanRepository.findById` is already used by organization creation.
The CRUD should validate `currentPlanId` through this existing repository and
return a minimal plan summary from Prisma nested reads or a repository read
model.

**Alternatives considered**:
- Recreate a plan model inside organizations: rejected because plans are a
  global catalog.
- Add billing behavior or plan history: rejected by out-of-scope constraints.

## Decision: Keep request validation at the presentation boundary with Zod

**Rationale**: The subscription-plan CRUD now uses route-local Zod
`safeParse` schemas plus Fastify JSON schemas. This keeps invalid HTTP bodies
and params as 400 responses before use cases run. Organization routes should
follow that pattern and gradually remove reliance on use-case-level Zod parsing
for HTTP concerns.

**Alternatives considered**:
- Continue validating organization write input only inside
  `CreateOrganizationUseCase`: rejected because it mixes transport validation
  into application logic and can surface inconsistent HTTP errors.
- Introduce a global Zod/Fastify adapter: rejected as broad infrastructure work.

## Decision: Use application read models for organization responses

**Rationale**: Responses require persistence timestamps and nested address/current
plan summaries, while domain entities should stay focused on invariants. A
transport-agnostic read model in application repositories can carry these
details to use cases and presenters without importing Prisma types into
application or domain layers.

**Alternatives considered**:
- Add timestamps and nested response concerns to `OrganizationProps`: rejected
  because they are persistence/API read concerns, not aggregate invariants.
- Return Prisma records from use cases: rejected because application must not
  depend on infrastructure types.

## Decision: Use full replacement for `PUT`

**Rationale**: The spec prefers complete update via `PUT`. Full replacement
keeps validation straightforward: all required organization and address fields
must be present, and optional fields may be null/omitted according to contract.

**Alternatives considered**:
- Partial update with `PATCH`: rejected because the spec selected `PUT`.
- Mixed full organization update and partial address update: rejected because it
  creates inconsistent semantics in one endpoint.

## Decision: Keep authorization out of scope

**Rationale**: The user explicitly restricted real authorization, permission
middleware, login, and mandatory 403 behavior. `/backoffice` is only the
technical namespace for this slice.

**Alternatives considered**:
- Create master-only middleware now: rejected by user constraint.
- Reuse a future auth context: not available as an established route pattern
  for this feature.

## Decision: Avoid Prisma schema changes unless implementation finds drift

**Rationale**: `schema.prisma` already contains `Organization`, `Address`,
`SubscriptionPlan`, their relations, unique CNPJ, and `secondaryCnaes` as a
string array. No schema change is required for the requested CRUD unless delete
behavior needs a relation policy change or migrations are out of sync.

**Alternatives considered**:
- Add soft-delete fields preemptively: rejected because the spec does not
  require lifecycle/status fields.
- Add pagination/filter fields: rejected because v1 list has no pagination or
  search requirements.

## Decision: Add route tests only if they can be isolated cleanly

**Rationale**: The API has use-case, domain, value-object, and Zod schema tests,
but no established Fastify `inject` route integration pattern. The plan should
include route tests as a conditional target rather than forcing a brittle
database-dependent test suite.

**Alternatives considered**:
- Skip all HTTP validation: rejected because routes and contracts are the
  feature surface.
- Add a full database integration harness as part of this CRUD: rejected as a
  larger testing infrastructure project unless implementation reveals an
  existing pattern.

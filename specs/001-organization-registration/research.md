# Research: Organization Registration

## Decision: Organization Is the Aggregate Root

**Decision**: Treat Organization as the aggregate root for organization
registration, tenant identity, company data ownership, address association, and
selected subscription plan relationship.

**Rationale**: Organization is the first tenant boundary in the product. Future
members, operators, patients, guardians, products, strains, inventory, orders,
documents, reports, and white-label settings all need to be scoped to an
organization. Making Organization the aggregate root gives later features a
single lifecycle and ownership boundary.

**Alternatives considered**:

- Treat company data as the aggregate root: rejected because company data is a
  detail of the tenant, not the tenant identity.
- Treat plan selection as the aggregate root: rejected because plans are shared
  reference data and do not own organization lifecycle.

## Decision: Address Is a Reusable Value Object Contract

**Decision**: Define Address as a reusable domain contract/value object with
CEP, logradouro, number, complement, neighborhood, city, and state. Persist an
address row per owner where needed, but do not treat Address as an aggregate
root or shared mutable tenant entity.

**Rationale**: Organization registration and future user registration need the
same address fields and validation rules. A shared contract prevents drift in
field names and rules while allowing each owner to control its own address
lifecycle.

**Alternatives considered**:

- Embed raw address fields only inside Organization: rejected because future
  user registration would likely duplicate field rules and labels.
- Use one polymorphic Address table for every owner: rejected because polymorphic
  ownership is harder to enforce consistently and can blur lifecycle ownership.

## Decision: Subscription Plan Is Reference Data

**Decision**: Treat Subscription Plan as platform reference data with unique
identifier, stable code/name, price in cents, active user limit, and operator
limit. Organization stores the selected plan relationship at creation.

**Rationale**: Starter, Growth, and Unlimited are shared commercial options and
are not owned by any one organization. They need deterministic availability
across environments and idempotent setup.

**Alternatives considered**:

- Store plan fields only on Organization: rejected because plan catalog values
  would be duplicated and hard to keep consistent.
- Treat each organization's selected plan as a separate aggregate: rejected for
  this phase because billing and plan-change history are out of scope.

## Decision: Represent Unlimited Operators Explicitly

**Decision**: Use an explicit unlimited marker in contracts and persistence for
operator limits, with no numeric maximum for Unlimited. Active users remain a
required numeric limit for every plan.

**Rationale**: The Unlimited plan still caps active users at 3000 while allowing
unlimited operators. A clear unlimited marker avoids interpreting `0`, `-1`, or
missing values incorrectly.

**Alternatives considered**:

- Use `0` to mean unlimited: rejected because it can also mean no operators.
- Use a very large number: rejected because it creates hidden limits and unclear
  product behavior.

## Decision: Store Money as Integer Cents

**Decision**: Store and exchange plan prices as integer cents: Starter 59700,
Growth 99700, Unlimited 209700.

**Rationale**: Integer cents avoid floating point rounding errors and match the
project rule that monetary values are saved and handled in cents, including
front-end display preparation.

**Alternatives considered**:

- Decimal currency values: rejected because the feature explicitly requires
  cent-based handling.
- Formatted strings as the source of truth: rejected because strings complicate
  comparisons, validation, and future billing integration.

## Decision: Master Is a Platform-Level Actor Outside Tenant Scope

**Decision**: Model Master authorization as a platform-level actor above
organizations. Master account creation is out of scope; this feature requires
organization creation to receive an authenticated Master context and record who
created the organization.

**Rationale**: The feature is about registering organizations, not onboarding
platform staff. Separating Master identity from tenant users prevents accidental
mixing of platform administration with organization operators or associated
users.

**Alternatives considered**:

- Reuse organization operator users as Masters: rejected because Masters operate
  above tenants and can create tenant organizations.
- Make organization creation public/self-service: rejected because the requested
  workflow is explicitly Master-created organizations.

## Decision: Validation Lives at Both Entry Points

**Decision**: Validate organization registration data in the Master-facing UI
for fast correction and in the API/application boundary for authoritative
enforcement.

**Rationale**: UI validation improves the Master workflow, but API validation is
required for consistency, security, and non-browser callers. CNPJ uniqueness,
selected plan availability, and Master authorization must be enforced by the
server-side boundary.

**Alternatives considered**:

- UI-only validation: rejected because it can be bypassed.
- API-only validation: rejected because the Master workflow would provide slower
  and less specific correction feedback.

## Decision: Use Contract and Domain Tests for Critical Behavior

**Decision**: Add focused automated checks for critical validation and domain
rules during implementation, using existing TypeScript tooling where possible,
and keep repository gates as `pnpm typecheck`, `pnpm build`, and Prisma
generation/migration validation.

**Rationale**: The constitution requires stronger verification for tenant
isolation, contracts, validation, persistence, and authorization. The current
repo has no package test script, so implementation tasks should either add
minimal package test scripts or provide a documented manual fallback only where
automation is not yet available.

**Alternatives considered**:

- Rely only on manual quickstart validation: rejected for CNPJ uniqueness,
  cent-based money handling, and Master-only access because those are critical
  behaviors.
- Introduce broad end-to-end tooling in this phase: rejected as too large for
  the first domain slice.

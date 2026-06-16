# Feature Specification: Organization Registration

**Feature Branch**: `main`

**Created**: 2026-06-16

**Status**: Draft

**Input**: Master users need to register legalized Brazilian medical cannabis
organizations with company data, reusable address data, and a selected
subscription plan. Default plans must be available with cent-based monetary
values and defined usage limits.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register an Organization (Priority: P1)

As a Master user of the platform, I want to register a legalized Brazilian
medical cannabis association so that the organization can become a tenant with
its company data, address, and selected plan recorded from the start.

**Why this priority**: Organization is the first tenant domain and must exist
before tenant-owned users, operators, products, inventory, orders, and reports
can be safely created.

**Independent Test**: A Master user can complete organization registration using
valid company data, address data, and a selected plan, then verify the newly
created organization contains all submitted information and has a tenant boundary.

**Acceptance Scenarios**:

1. **Given** a Master user has valid organization, address, and plan data,
   **When** the Master submits the registration, **Then** the organization is
   created with all company fields, all address fields, and the selected plan.
2. **Given** an organization already exists with a CNPJ, **When** the Master
   tries to register another organization with the same CNPJ, **Then** the
   system rejects the duplicate and does not create a second organization.
3. **Given** required information is missing or invalid, **When** the Master
   submits the registration, **Then** the system identifies the invalid fields
   and preserves the valid information for correction.

---

### User Story 2 - Select a Standard Plan (Priority: P2)

As a Master user, I want the standard subscription plans to be available during
organization registration so that every organization starts with a known
commercial plan and usage limits.

**Why this priority**: The selected plan determines active user and operator
capacity for the organization, so plan data must be reliable before tenant usage
rules can be enforced.

**Independent Test**: During organization registration, the Master can choose
Starter, Growth, or Unlimited, and each plan shows the correct price and usage
limits.

**Acceptance Scenarios**:

1. **Given** the Master starts organization registration, **When** plan selection
   is required, **Then** Starter, Growth, and Unlimited are available.
2. **Given** the Master selects a plan, **When** the organization is created,
   **Then** the organization retains the selected plan and its limits.
3. **Given** the Unlimited plan is selected, **When** limits are reviewed,
   **Then** operator access is treated as unlimited and active users are capped
   at 3000.

---

### User Story 3 - Establish Organization Domain Boundaries (Priority: P3)

As the product and domain team, I want the Organization domain boundary,
reusable address concept, and plan relationship to be explicit so that future
features reuse the same model instead of creating incompatible variants.

**Why this priority**: Address data will also be needed by user registration,
and Organization must act as the tenant boundary for later operational features.

**Independent Test**: A domain review confirms that Organization is the
aggregate root for organization registration, Address is reusable outside
Organization, and Plan remains selectable reference data.

**Acceptance Scenarios**:

1. **Given** a future workflow needs a Brazilian address, **When** the workflow
   is specified, **Then** it can reuse the same address fields defined here.
2. **Given** organization-owned behavior is added later, **When** ownership is
   evaluated, **Then** Organization is the lifecycle boundary for tenant identity
   and organization-owned data.
3. **Given** plan catalog data changes independently of an organization,
   **When** the domain relationship is reviewed, **Then** Plan is treated as
   reference data selected by Organization rather than as data owned by an
   individual organization.

### Edge Cases

- A CNPJ is invalid, formatted incorrectly, or already registered.
- A CEP is invalid or the address is missing street, number, neighborhood, city,
  or state.
- Complement is omitted; registration remains valid because complement is
  optional.
- Secondary CNAEs are omitted; registration remains valid because secondary
  CNAEs are optional.
- A foundation date is in the future.
- Institutional email or WhatsApp is malformed.
- The selected plan is unavailable at the time of submission.
- Unlimited operators must mean no operator cap, not zero allowed operators.
- Monetary conversion must preserve exact cents: R$ 597,00 is 59700,
  R$ 997,00 is 99700, and R$ 2.097,00 is 209700.
- A non-Master role attempts to create an organization.
- Organization data created by a Master must not become visible to other tenant
  organizations except through authorized Master-level administration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an authorized Master user to register an
  organization.
- **FR-002**: System MUST reject organization registration attempts by users who
  are not authorized as Master users.
- **FR-003**: System MUST collect the organization's address with CEP,
  logradouro, number, complement, neighborhood, city, and state.
- **FR-004**: System MUST collect company data with legal name, trade name,
  CNPJ, foundation date, primary CNAE, secondary CNAEs, institutional email,
  and WhatsApp.
- **FR-005**: System MUST require legal name, trade name, CNPJ, foundation date,
  primary CNAE, institutional email, WhatsApp, CEP, logradouro, number,
  neighborhood, city, state, and selected plan.
- **FR-006**: System MUST treat complement and secondary CNAEs as optional.
- **FR-007**: System MUST validate CNPJ format and uniqueness before creating an
  organization.
- **FR-008**: System MUST validate institutional email, WhatsApp, CEP, state,
  and foundation date before creating an organization.
- **FR-009**: System MUST assign each organization a unique identifier and a
  tenant boundary at creation.
- **FR-010**: System MUST create the organization only when all required company,
  address, and plan data is valid.
- **FR-011**: System MUST prevent partial organization creation when validation
  or plan selection fails.
- **FR-012**: System MUST associate each organization with exactly one selected
  subscription plan at creation.
- **FR-013**: System MUST provide these default subscription plans as available
  plan data:
  Starter with price 59700 cents, 10 association operators, and 50 active users;
  Growth with price 99700 cents, 30 association operators, and 100 active users;
  Unlimited with price 209700 cents, unlimited association operators, and 3000
  active users.
- **FR-014**: System MUST give every subscription plan a unique identifier,
  price in cents, maximum active user count, and maximum association operator
  count or an explicit unlimited operator value.
- **FR-015**: System MUST handle all monetary values for this feature as integer
  cents across entry, validation, storage, retrieval, and display preparation.
- **FR-016**: System MUST define Address as a reusable domain concept with the
  same fields required for organization registration.
- **FR-017**: System MUST define Organization as the aggregate root for
  organization registration, tenant identity, company data, address association,
  and selected plan relationship.
- **FR-018**: System MUST define Subscription Plan as shared reference data that
  can be selected by organizations but is not owned by a single organization.
- **FR-019**: System MUST keep organization data scoped so tenant organizations
  cannot access each other's organization records.
- **FR-020**: System MUST record which Master user created the organization and
  when the organization was created.

### Key Entities *(include if feature involves data)*

- **Master User**: Platform-level user above organization tenants. A Master can
  create organizations and manage initial organization registration data.
- **Organization**: Legalized Brazilian medical cannabis association registered
  as a tenant. It is the aggregate root for organization identity, company data,
  address association, selected plan relationship, and future organization-owned
  behavior.
- **Address**: Reusable Brazilian address concept with CEP, logradouro, number,
  complement, neighborhood, city, and state. It can be reused by organization
  registration and future user registration.
- **Company Data**: Organization legal and institutional details, including
  legal name, trade name, CNPJ, foundation date, primary CNAE, secondary CNAEs,
  institutional email, and WhatsApp.
- **Subscription Plan**: Selectable plan reference data with unique identifier,
  name, price in cents, maximum active users, and maximum association operators.
- **Tenant Ownership**: Organization is the tenant boundary. Organization-owned
  data must be scoped to the owning organization after creation.
- **Shared Contracts**: Organization registration, address, company data, and
  plan values are shared domain contracts for later planning and reuse.

### Constitution Alignment *(mandatory)*

- **Affected Packages**: Organization administration, organization domain,
  shared address/contract definitions, and plan reference data.
- **Tenant/White-Label Impact**: Organization creation establishes the tenant
  boundary; future white-label settings will attach to this organization.
- **Contract/Typing Impact**: Organization registration data, reusable address
  data, company data, plan data, and cent-based monetary values require stable
  shared contracts.
- **Clean-Code Boundaries**: Organization owns the registration lifecycle;
  Address remains reusable; Subscription Plan remains independent reference
  data; Master authorization is separate from tenant users.
- **Verification Scope**: Validate Master-only creation, CNPJ uniqueness,
  required field validation, exact default plan values, cent-based monetary
  handling, tenant scoping, and aggregate-boundary decisions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Master user can register a valid organization with company data,
  address, and selected plan in under 5 minutes.
- **SC-002**: 100% of successfully registered organizations contain complete
  required company data, complete required address data, a unique CNPJ, and one
  selected plan.
- **SC-003**: 100% of default plans match the required names, price-in-cent
  values, operator limits, and active user limits.
- **SC-004**: 0 non-Master organization creation attempts succeed during
  acceptance testing.
- **SC-005**: 100% of plan monetary values are verified as integer cents with no
  decimal rounding loss.
- **SC-006**: Domain review confirms Organization as aggregate root, Address as
  reusable, and Subscription Plan as reference data before planning proceeds.

## Assumptions

- Master account creation and Master authentication are outside this feature;
  an authorized Master user already exists for testing.
- This feature covers organization creation, default plan availability, and
  domain boundary definition; organization editing, deletion, suspension,
  billing charge execution, and tenant self-service onboarding are out of scope.
- The organization CNPJ must be unique across the platform.
- Secondary CNAEs can be an empty list when the organization has no secondary
  CNAEs.
- The selected plan can be changed by a future feature; this feature only
  records the initial plan selected during registration.

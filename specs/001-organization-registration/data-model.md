# Data Model: Organization Registration

## Aggregate Boundary

Organization is the aggregate root for this feature. It owns tenant identity,
company data, the selected plan relationship, and the address association used
at registration. Address is a reusable value object contract and persistence
detail, not an aggregate root. Subscription Plan is platform reference data and
is not owned by an organization.

## Entity: Organization

**Purpose**: Represents a legalized Brazilian medical cannabis association
registered as a tenant by a Master user.

**Fields**:

- `id`: unique organization identifier
- `legalName`: Razao Social, required
- `tradeName`: Nome Fantasia, required
- `cnpj`: Brazilian company registration number, required and unique
- `foundationDate`: company foundation date, required, cannot be in the future
- `primaryCnae`: primary CNAE, required
- `secondaryCnaes`: zero or more secondary CNAEs
- `institutionalEmail`: institutional email, required, valid email format
- `whatsapp`: WhatsApp contact number, required, valid Brazilian phone format
- `addressId`: associated Address identifier, required
- `subscriptionPlanId`: selected Subscription Plan identifier, required
- `createdByMasterUserId`: Master user identifier that created the organization
- `createdAt`: creation timestamp
- `updatedAt`: last update timestamp

**Validation rules**:

- `cnpj` must have valid CNPJ format and be unique platform-wide.
- `foundationDate` must not be in the future.
- `legalName`, `tradeName`, `primaryCnae`, `institutionalEmail`, `whatsapp`,
  `addressId`, and `subscriptionPlanId` are required.
- `secondaryCnaes` may be empty.
- Organization creation must fail atomically if company data, address data,
  selected plan, or Master authorization is invalid.

**Relationships**:

- Has one Address for registration address.
- Belongs to one selected Subscription Plan.
- Created by one Master User.
- Acts as the tenant boundary for future organization-owned data.

## Value Object Contract: Address

**Purpose**: Reusable Brazilian address shape for organization registration and
future user registration.

**Fields**:

- `id`: unique address persistence identifier when stored
- `cep`: required, 8 numeric digits after formatting is removed
- `logradouro`: required
- `number`: required
- `complement`: optional
- `neighborhood`: required
- `city`: required
- `state`: required, two-letter Brazilian UF
- `createdAt`: creation timestamp when persisted
- `updatedAt`: last update timestamp when persisted

**Validation rules**:

- `cep` must normalize to 8 digits.
- `logradouro`, `number`, `neighborhood`, `city`, and `state` are required.
- `state` must be a valid two-letter Brazilian UF.
- `complement` may be empty.

**Relationships**:

- Owned by the aggregate that uses it. In this feature, Organization owns its
  address lifecycle.
- Reused through shared contracts and validation rules; address rows are not
  shared mutable data between different owners.

## Entity: Subscription Plan

**Purpose**: Platform reference data for plan options available during
organization registration.

**Fields**:

- `id`: unique plan identifier
- `code`: stable unique code (`starter`, `growth`, `unlimited`)
- `name`: display name
- `priceInCents`: required integer cents
- `maxActiveUsers`: required integer active user limit
- `maxOperators`: integer operator limit when limited; absent when unlimited
- `operatorLimitType`: `limited` or `unlimited`
- `createdAt`: creation timestamp
- `updatedAt`: last update timestamp

**Default records**:

| Code | Name | Price In Cents | Operator Limit Type | Max Operators | Max Active Users |
|------|------|----------------|---------------------|---------------|------------------|
| `starter` | Starter | 59700 | limited | 10 | 50 |
| `growth` | Growth | 99700 | limited | 30 | 100 |
| `unlimited` | Unlimited | 209700 | unlimited | none | 3000 |

**Validation rules**:

- `code` and `name` must be unique.
- `priceInCents` must be an integer greater than or equal to 0.
- `maxActiveUsers` must be a positive integer.
- `maxOperators` must be a positive integer when `operatorLimitType` is
  `limited`.
- `maxOperators` must be absent when `operatorLimitType` is `unlimited`.

**Relationships**:

- Referenced by many organizations.
- Not owned by a single organization.

## External Actor: Master User

**Purpose**: Platform-level actor above organization tenants.

**Fields needed by this feature**:

- `id`: unique Master user identifier from authenticated context
- `role`: must authorize platform-level organization creation

**Rules**:

- Master account creation and authentication are outside this feature.
- Organization creation must record `createdByMasterUserId`.
- Non-Master actors cannot create organizations.

## Invariants

- Organization CNPJ is unique across all organizations.
- Organization creation is atomic: no organization exists unless valid company
  data, valid address, valid selected plan, and Master authorization all pass.
- Money values are stored and exchanged as integer cents.
- Unlimited operator access is represented explicitly and cannot be confused
  with zero operators.
- Organization is the tenant boundary for future organization-owned records.

## State Transitions

This feature has one creation transition:

1. Master submits valid organization registration data.
2. System validates Master authorization, company data, address data, CNPJ
   uniqueness, selected plan availability, and monetary cent values.
3. System creates Address and Organization, associates the selected Subscription
   Plan, records the creating Master user, and returns the created organization.

Editing, deletion, suspension, plan changes, billing charge execution, and
tenant self-service onboarding are out of scope.

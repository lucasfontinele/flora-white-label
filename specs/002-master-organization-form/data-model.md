# Data Model: Master Organization Form

## Master User Context

Represents the platform-level user allowed to access organization housekeeping.

Fields:

- `id`: string, required.
- `role`: `"master"`, required.

Validation rules:

- Temporary local integration requires `x-master-user-id` and
  `x-master-role: master`.
- Non-Master context cannot list or create organizations.

## Address

Reusable Brazilian address contract.

Fields:

- `id`: string, present on persisted responses.
- `cep`: string, required, normalized to 8 digits.
- `logradouro`: string, required.
- `number`: string, required.
- `complement`: string, optional.
- `neighborhood`: string, required.
- `city`: string, required.
- `state`: string, required, 2-character Brazilian UF.

Relationships:

- A created organization has one address.
- Address remains reusable for future user/member registration.

## Organization Company Data

Legal and institutional data for an organization.

Fields:

- `legalName`: string, required.
- `tradeName`: string, required.
- `cnpj`: string, required, normalized to 14 digits and unique.
- `foundationDate`: date string on API/web contract; date value in persistence.
- `primaryCnae`: string, required. Accepts formatted CNAE input and persists
  normalized 7-digit CNAE.
- `secondaryCnaes`: string array, optional, defaults to empty array. Each item
  accepts formatted CNAE input and persists normalized 7-digit CNAE. Duplicate
  items are rejected.
- `institutionalEmail`: string, required email.
- `phone`: optional Brazilian phone, normalized to digits when present.
- `whatsapp`: string, required Brazilian phone/WhatsApp value.
- `site`: optional URL.
- `instagram`: optional URL.
- `facebook`: optional URL.
- `linkedin`: optional URL.

Validation rules:

- Foundation date cannot be in the future.
- Duplicate CNPJ rejects creation and preserves form values in the UI.

## Subscription Plan

Reference data selected during organization creation.

Fields:

- `id`: string, required.
- `code`: `"starter" | "growth" | "unlimited"`, required.
- `name`: `"Starter" | "Growth" | "Unlimited"`, required.
- `priceInCents`: integer, required.
- `maxActiveUsers`: integer, required.
- `operatorLimitType`: `"limited" | "unlimited"`, required.
- `maxOperators`: integer or null; null only when `operatorLimitType` is
  `"unlimited"`.

Validation rules:

- The form cannot proceed to review without exactly one available plan.
- Prices are never represented as decimal currency in contracts.

## Organization

Tenant organization created by a Master user.

Fields:

- `id`: string, required.
- `company`: Organization Company Data, required.
- `address`: persisted Address, required.
- `subscriptionPlan`: Subscription Plan, required.
- `createdByMasterUserId`: string, required.
- `createdAt`: ISO date-time string in contracts.
- `updatedAt`: ISO date-time string in contracts.

Relationships:

- Organization is the tenant boundary and aggregate root for this flow.
- Organization belongs to exactly one selected subscription plan at creation.

## Organization List Item

Summary representation for the Master table.

Fields:

- `id`: string.
- `tradeName`: string.
- `legalName`: string.
- `cnpj`: string.
- `city`: string.
- `state`: string.
- `subscriptionPlan`: Subscription Plan summary.
- `createdAt`: ISO date-time string.

Validation rules:

- List items must not expose tenant operational records, only platform-level
  organization summary data.

## Organization List Page

Paginated list response for the Master organizations table.

Fields:

- `data`: Organization List Item array.
- `pagination.page`: integer, default 1.
- `pagination.perPage`: integer, default 20.
- `pagination.total`: integer.
- `pagination.totalPages`: integer.

Validation rules:

- `page` and `perPage` must be positive integers.
- The table must show loading, empty, error, and data states.

## Organization Registration Draft

Client-side in-progress form data for the multi-step registration flow.

Fields:

- `company`: Organization Company Data input.
- `address`: Address input.
- `subscriptionPlanId`: string.
- `currentStep`: company, address, plan, or review.

State transitions:

```text
editing company -> validating company -> editing address
editing address -> validating address -> selecting plan
selecting plan -> validating plan -> reviewing
reviewing -> submitting -> succeeded
reviewing -> submitting -> failed -> reviewing
```

Validation rules:

- Each step validates only the fields needed to advance.
- Previously entered values are preserved while navigating within the active
  registration session.
- Submission failure returns to a correctable state without clearing valid data.

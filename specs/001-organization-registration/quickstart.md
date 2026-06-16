# Quickstart: Organization Registration Validation

This guide validates the Organization Registration feature after implementation.
It references [data-model.md](./data-model.md) and
[contracts/organization-registration.openapi.yaml](./contracts/organization-registration.openapi.yaml).

## Prerequisites

- Node.js >=20.9.0
- pnpm 10.14.0
- PostgreSQL available through `packages/api/.env`
- An authenticated Master context available for API and web validation

## Setup

1. Install dependencies from the repository root:

   ```bash
   pnpm install
   ```

2. Create the API environment file if it does not exist:

   ```bash
   cp packages/api/.env.example packages/api/.env
   ```

3. Generate Prisma Client and apply migrations:

   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

4. Start the applications:

   ```bash
   pnpm dev
   ```

## Validation Scenarios

### 1. Default Plans Exist

**Action**: As a Master user, open the organization registration flow or request
the plan catalog.

**Expected result**:

- Starter exists with `priceInCents` 59700, `maxOperators` 10, and
  `maxActiveUsers` 50.
- Growth exists with `priceInCents` 99700, `maxOperators` 30, and
  `maxActiveUsers` 100.
- Unlimited exists with `priceInCents` 209700, unlimited operators, and
  `maxActiveUsers` 3000.

### 2. Master Creates an Organization

**Action**: Submit valid company data, valid address data, and one selected plan
as an authenticated Master user.

**Expected result**:

- The organization is created.
- The response or confirmation includes the submitted company data.
- The response or confirmation includes the submitted address.
- The selected plan is associated with the organization.
- The creating Master user is recorded.
- The organization has a unique tenant identifier.

### 3. Duplicate CNPJ Is Rejected

**Action**: Submit a second organization registration with a CNPJ already used
by another organization.

**Expected result**:

- The request is rejected.
- No second organization is created.
- The response identifies the CNPJ conflict.

### 4. Required Field Validation

**Action**: Submit registration without a required address field, company field,
or selected plan.

**Expected result**:

- The request is rejected.
- The invalid or missing fields are identified.
- No partial organization is created.

### 5. Non-Master Creation Is Rejected

**Action**: Attempt organization creation without Master authorization.

**Expected result**:

- The request is rejected.
- No organization is created.
- The response indicates missing or insufficient authorization.

### 6. Monetary Values Stay in Cents

**Action**: Inspect the plan values returned to the Master workflow and the
persisted plan data after migrations run.

**Expected result**:

- All plan prices are integer cents.
- No decimal currency value is used as the source of truth.
- Display formatting, if present, derives from integer cents.

## Quality Gates

Run the repository gates before moving to tasks completion or review:

```bash
pnpm typecheck
pnpm build
```

For package-specific changes, also validate the affected package:

```bash
pnpm typecheck:api
pnpm build:api
pnpm typecheck:web
pnpm build:web
```

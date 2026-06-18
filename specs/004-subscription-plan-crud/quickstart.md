# Quickstart: CRUD de Planos de Assinatura Master

This guide validates the API-only subscription plan CRUD after implementation.

## Prerequisites

- Dependencies installed with `pnpm install`.
- PostgreSQL reachable through `DATABASE_URL`.
- Prisma client generated.
- API server running locally on port `3333` or another configured port.

## Setup

```bash
pnpm prisma:generate
pnpm dev:api
```

If the implementation changes Prisma schema nullability, apply the generated
migration before manual API validation:

```bash
pnpm prisma:migrate
```

## Automated Validation

Run package-level checks first:

```bash
pnpm test:api
pnpm typecheck:api
pnpm build:api
pnpm --filter @flora/api lint
```

This slice does not add Fastify `inject` integration tests because the API
package does not currently have an established HTTP integration-test pattern.
Automated coverage is provided by domain/value-object tests, application use
case tests, and Zod schema tests; the endpoint behavior is validated manually
with the scenarios below.

Run repository-level gates before review:

```bash
pnpm typecheck
pnpm build
```

## Manual API Scenarios

Set the API URL:

```bash
API_URL=http://localhost:3333
```

### 1. Create a plan

```bash
curl -sS -X POST "$API_URL/backoffice/subscription-plans" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Plano Essencial",
    "description": "Ideal para associacoes iniciantes.",
    "priceInCents": 15000,
    "operatorsLimit": 5,
    "patientsLimit": 100
  }'
```

Expected outcome:

- HTTP 201.
- Response includes `id`, `title`, `description`, `priceInCents`,
  `operatorsLimit`, `patientsLimit`, `createdAt`, and `updatedAt`.
- `priceInCents` is an integer, not a decimal or formatted currency.

### 2. List plans

```bash
curl -sS "$API_URL/backoffice/subscription-plans"
```

Expected outcome:

- HTTP 200.
- Response shape is `{ "data": [...] }`.
- Newly created plans appear in the list.

### 3. Get a plan by ID

```bash
PLAN_ID=<id-from-create-response>
curl -sS "$API_URL/backoffice/subscription-plans/$PLAN_ID"
```

Expected outcome:

- HTTP 200 for an existing plan.
- HTTP 404 for an unknown ID.

### 4. Update a plan

```bash
curl -sS -X PUT "$API_URL/backoffice/subscription-plans/$PLAN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Plano Profissional",
    "description": null,
    "priceInCents": 29900,
    "operatorsLimit": 10,
    "patientsLimit": 300
  }'
```

Expected outcome:

- HTTP 200.
- Response contains the updated title, null description, integer cents, and
  updated limits.
- Missing required fields or invalid values return HTTP 400 and do not change
  the previous plan.

### 5. Reject invalid money and limits

```bash
curl -sS -X POST "$API_URL/backoffice/subscription-plans" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Plano Invalido",
    "description": "Valor decimal nao pode passar.",
    "priceInCents": 10.5,
    "operatorsLimit": 0,
    "patientsLimit": -1
  }'
```

Expected outcome:

- HTTP 400.
- No plan is created.

### 6. Delete an unused plan

```bash
curl -i -X DELETE "$API_URL/backoffice/subscription-plans/$PLAN_ID"
```

Expected outcome:

- HTTP 204 with no response body.
- A later GET for the same ID returns HTTP 404.

### 7. Reject delete for a plan used by organizations

Use a plan ID that is referenced by at least one Organization.

```bash
USED_PLAN_ID=<organization-current-plan-id>
curl -i -X DELETE "$API_URL/backoffice/subscription-plans/$USED_PLAN_ID"
```

Expected outcome:

- HTTP 409.
- The plan remains available through GET/list endpoints.

## Contract Reference

See [contracts/subscription-plans.openapi.yaml](./contracts/subscription-plans.openapi.yaml)
for request and response shapes.

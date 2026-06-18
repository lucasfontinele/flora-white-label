# Quickstart: CRUD de Organizações Master

This guide validates the API-only organization CRUD after implementation.

## Prerequisites

- Dependencies installed with `pnpm install`.
- PostgreSQL reachable through `DATABASE_URL`.
- Prisma client generated.
- At least one `SubscriptionPlan` exists for `currentPlanId`.
- API server running locally on port `3333` or another configured port.

## Setup

```bash
pnpm prisma:generate
pnpm dev:api
```

If implementation changes `packages/api/prisma/schema.prisma`, apply the
generated migration before manual validation:

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

Run repository-level gates before review:

```bash
pnpm typecheck
pnpm build
```

HTTP integration tests should be added if the implementation can use a clean
Fastify `inject` pattern without depending on a production database. Otherwise,
automated coverage should include domain/value-object tests, application use
case tests, and Zod schema tests, with endpoint behavior validated manually by
the scenarios below.

## Manual API Scenarios

Set the API URL and an existing plan ID:

```bash
API_URL=http://localhost:3333
PLAN_ID=<existing-subscription-plan-id>
```

### 1. Create an organization with address

```bash
curl -sS -X POST "$API_URL/backoffice/organizations" \
  -H "Content-Type: application/json" \
  -d '{
    "organization": {
      "tradeName": "ABECMED",
      "legalName": "Associacao Brasileira de Cannabis Medicinal",
      "cnpj": "11.222.333/0001-81",
      "primaryCnae": "8630-5/03",
      "secondaryCnaes": ["9499-5/00"],
      "currentPlanId": "'"$PLAN_ID"'"
    },
    "address": {
      "title": "Sede",
      "zipcode": "77000-000",
      "street": "Rua Exemplo",
      "neighborhood": "Centro",
      "complement": "Sala 01",
      "city": "Palmas",
      "state": "TO"
    }
  }'
```

Expected outcome:

- HTTP 201.
- Response includes organization `id`, normalized `cnpj`, normalized
  `primaryCnae`, normalized `secondaryCnaes`, `currentPlan`, `address`, and
  timestamps when available.
- `cnpj`, CNAE values, and `zipcode` are returned as digits only.

### 2. List organizations

```bash
curl -sS "$API_URL/backoffice/organizations"
```

Expected outcome:

- HTTP 200.
- Response shape is `{ "data": [...] }`.
- Created organizations include nested address and current plan summary.

### 3. Get organization by ID

```bash
ORG_ID=<id-from-create-response>
curl -sS "$API_URL/backoffice/organizations/$ORG_ID"
```

Expected outcome:

- HTTP 200 for an existing organization.
- HTTP 404 for an unknown ID.

### 4. Fully update organization and address

```bash
curl -sS -X PUT "$API_URL/backoffice/organizations/$ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "organization": {
      "tradeName": "Novo nome fantasia",
      "legalName": "Nova razao social",
      "cnpj": "11.222.333/0001-81",
      "primaryCnae": "8630-5/03",
      "secondaryCnaes": ["9499-5/00"],
      "currentPlanId": "'"$PLAN_ID"'"
    },
    "address": {
      "title": "Sede atualizada",
      "zipcode": "77000-000",
      "street": "Rua Atualizada",
      "neighborhood": "Centro",
      "complement": null,
      "city": "Palmas",
      "state": "TO"
    }
  }'
```

Expected outcome:

- HTTP 200.
- Response contains the updated organization fields and address fields.
- Missing required fields return HTTP 400 and do not change prior data.

### 5. Reject invalid document/activity/address data

```bash
curl -sS -X POST "$API_URL/backoffice/organizations" \
  -H "Content-Type: application/json" \
  -d '{
    "organization": {
      "tradeName": "Organizacao Invalida",
      "legalName": "Organizacao Invalida LTDA",
      "cnpj": "11.111.111/1111-11",
      "primaryCnae": "123",
      "secondaryCnaes": ["abcdefg"],
      "currentPlanId": "'"$PLAN_ID"'"
    },
    "address": {
      "zipcode": "123",
      "street": "Rua Exemplo",
      "neighborhood": "Centro",
      "city": "Palmas",
      "state": "XX"
    }
  }'
```

Expected outcome:

- HTTP 400 or 422 according to where validation rejects the data.
- No organization or address is created.

### 6. Reject duplicate CNPJ

Repeat scenario 1 with the same normalized CNPJ.

Expected outcome:

- HTTP 409.
- No second organization is created.

### 7. Reject missing plan

```bash
curl -sS -X POST "$API_URL/backoffice/organizations" \
  -H "Content-Type: application/json" \
  -d '{
    "organization": {
      "tradeName": "Sem Plano",
      "legalName": "Sem Plano LTDA",
      "cnpj": "04.252.011/0001-10",
      "primaryCnae": "8630-5/03",
      "secondaryCnaes": [],
      "currentPlanId": "missing-plan-id"
    },
    "address": {
      "zipcode": "77000-000",
      "street": "Rua Exemplo",
      "neighborhood": "Centro",
      "city": "Palmas",
      "state": "TO"
    }
  }'
```

Expected outcome:

- HTTP 404.
- No organization or address is created.

### 8. Delete organization

```bash
curl -i -X DELETE "$API_URL/backoffice/organizations/$ORG_ID"
```

Expected outcome:

- HTTP 204 with no response body.
- A later GET for the same ID returns HTTP 404.
- The address created for this organization is not exposed as an orphan through
  this resource.

## Contract Reference

See [contracts/organizations.openapi.yaml](./contracts/organizations.openapi.yaml)
for request and response shapes.

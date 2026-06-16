# Quickstart: Master Organization Form

This guide validates the first Master organization module end-to-end: shared
contracts, organization listing, plan lookup, and organization creation.

## Prerequisites

- PostgreSQL and the API environment are configured for local development.
- Organization registration migrations from the previous organization domain
  work are applied.
- Default subscription plans exist in the database.
- The temporary Master headers are used until the final authentication module is
  available:
  - `x-master-user-id: master_local`
  - `x-master-role: master`

## Setup

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
```

## Run Locally

In one terminal:

```bash
pnpm dev:api
```

In another terminal:

```bash
pnpm dev:web
```

Expected local targets:

- API: `http://localhost:3333`
- Web: `http://localhost:3000`
- Master organization list: `http://localhost:3000/organizations`
- New organization form: `http://localhost:3000/organizations/new`

## API Contract Checks

List plans:

```bash
curl -s http://localhost:3333/subscription-plans \
  -H 'x-master-user-id: master_local' \
  -H 'x-master-role: master'
```

Expected outcome: response contains Starter, Growth, and Unlimited with
`priceInCents` values and operator/user limits.

List organizations:

```bash
curl -s 'http://localhost:3333/organizations?page=1&perPage=20' \
  -H 'x-master-user-id: master_local' \
  -H 'x-master-role: master'
```

Expected outcome: response matches `ListOrganizationsResponse` in
`contracts/master-organizations.openapi.yaml`.

Create organization:

```bash
curl -s -X POST http://localhost:3333/organizations \
  -H 'content-type: application/json' \
  -H 'x-master-user-id: master_local' \
  -H 'x-master-role: master' \
  -d '{
    "company": {
      "legalName": "Associacao Medicinal Exemplo LTDA",
      "tradeName": "Associacao Exemplo",
      "cnpj": "11222333000181",
      "foundationDate": "2020-01-15",
      "primaryCnae": "9430800",
      "secondaryCnaes": ["9499500"],
      "institutionalEmail": "contato@associacao.org.br",
      "phone": "6333330000",
      "site": "https://associacao.org.br",
      "instagram": "https://instagram.com/associacao",
      "facebook": "https://facebook.com/associacao",
      "linkedin": "https://linkedin.com/company/associacao",
      "whatsapp": "63999990000"
    },
    "address": {
      "cep": "77001000",
      "logradouro": "Quadra 101 Sul",
      "number": "10",
      "complement": "",
      "neighborhood": "Plano Diretor Sul",
      "city": "Palmas",
      "state": "TO"
    },
    "subscriptionPlanId": "plan_starter"
  }'
```

Expected outcome: response status is `201`, response matches
`CreateOrganizationResponse`, and the organization appears in the list response.

## Web Validation Scenarios

1. Open `/organizations`.
2. Confirm the table shows loading, empty, error, or organization rows.
3. Use the primary action to open `/organizations/new`.
4. Try advancing with missing company data; field-level validation blocks the
   step.
5. Fill company data, address data, choose a plan, and review the summary.
6. Submit and confirm the success state shows organization name, CNPJ, and plan.
7. Return to `/organizations` and confirm the new organization appears.

## Automated Gates

```bash
pnpm test:api
pnpm test:web
pnpm typecheck
pnpm build
```

Expected outcome: API tests cover list/create/plan endpoints and Master header
authorization. Web tests cover table states, multi-step validation, plan
selection, submission success, and request error handling.

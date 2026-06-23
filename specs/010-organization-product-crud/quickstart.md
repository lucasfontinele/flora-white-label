# Quickstart: CRUD Backend de Produtos da Organizacao

This guide validates the backend product catalog slice after implementation.

## Prerequisites

- Dependencies installed with `pnpm install`.
- API environment configured with a valid `DATABASE_URL`.
- PostgreSQL available for Prisma migration tests.
- At least one organization exists, or create one through existing organization flows.

## Setup

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

## Run Static and Automated Checks

```bash
pnpm typecheck:api
pnpm --filter @flora/api lint
pnpm test:api
pnpm build:api
```

Targeted test runs during implementation:

```bash
pnpm --filter @flora/api test Product
pnpm --filter @flora/api test product-schemas
```

## Manual API Validation

Start the API:

```bash
pnpm dev:api
```

Set an organization id:

```bash
ORG_ID="<existing-organization-id>"
```

### 1. Create Product

```bash
curl -s -X POST "http://localhost:3333/organizations/$ORG_ID/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CBD Oil 1000mg",
    "description": "Frasco com 30ml.",
    "category": "OIL",
    "type": "CBD",
    "strainType": null,
    "thcPercentage": 0,
    "cbdPercentage": 10,
    "unit": "MILLILITER",
    "priceInCents": 15900
  }'
```

Expected outcome:

- Status `201`.
- Response contains `organizationId = ORG_ID`.
- Response contains `priceInCents = 15900`.
- Response contains `isActive = true`.
- Response does not contain stock, batch, expiration, upload, image, order, reservation, prescription, or payment fields.

### 2. List Products

```bash
curl -s "http://localhost:3333/organizations/$ORG_ID/products"
```

Expected outcome:

- Status `200`.
- Response shape is `{ "data": [...] }`.
- Only products for `ORG_ID` are returned.
- Active and inactive products are visible for management.

### 3. Get Product By ID

```bash
PRODUCT_ID="<created-product-id>"

curl -s "http://localhost:3333/organizations/$ORG_ID/products/$PRODUCT_ID"
```

Expected outcome:

- Status `200`.
- Response contains the requested product and same `organizationId`.

### 4. Update Product

```bash
curl -s -X PUT "http://localhost:3333/organizations/$ORG_ID/products/$PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CBD Oil 1500mg",
    "description": null,
    "category": "OIL",
    "type": "CBD",
    "strainType": null,
    "thcPercentage": 0,
    "cbdPercentage": 15,
    "unit": "MILLILITER",
    "priceInCents": 18900
  }'
```

Expected outcome:

- Status `200`.
- Catalog fields are updated.
- `organizationId` and `id` are unchanged.

### 5. Deactivate Product

```bash
curl -s -X PATCH "http://localhost:3333/organizations/$ORG_ID/products/$PRODUCT_ID/deactivate"
```

Expected outcome:

- Status `200`.
- Response contains `isActive = false`.

### 6. Activate Product

```bash
curl -s -X PATCH "http://localhost:3333/organizations/$ORG_ID/products/$PRODUCT_ID/activate"
```

Expected outcome:

- Status `200`.
- Response contains `isActive = true`.

### 7. Soft Delete Product

```bash
curl -s -X DELETE "http://localhost:3333/organizations/$ORG_ID/products/$PRODUCT_ID"
```

Expected outcome:

- Status `200`.
- Response contains `isActive = false`.
- Product remains available to management reads as inactive.

### 8. Validation Failures

Send invalid payload:

```bash
curl -s -X POST "http://localhost:3333/organizations/$ORG_ID/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": " ",
    "category": "INVALID",
    "type": "CBD",
    "unit": "UNIT",
    "priceInCents": -1
  }'
```

Expected outcome:

- Request is rejected with structured error.
- No product is created.

### 9. Tenant Isolation

Use a product ID from another organization:

```bash
OTHER_ORG_ID="<another-organization-id>"

curl -s "http://localhost:3333/organizations/$OTHER_ORG_ID/products/$PRODUCT_ID"
```

Expected outcome:

- Status `404`.
- Product data from `ORG_ID` is not exposed.

## Contract Reference

See [contracts/organization-products.openapi.yaml](./contracts/organization-products.openapi.yaml) for endpoint shapes, enums, request bodies, responses, and error contracts.

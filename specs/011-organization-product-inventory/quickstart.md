# Quickstart: Controle Backend de Estoque de Produtos da Organizacao

This guide validates the backend inventory slice after implementation.

## Prerequisites

- Dependencies installed with `pnpm install`.
- API environment configured with a valid `DATABASE_URL`.
- PostgreSQL available for Prisma migration tests.
- At least one organization and one product exist (create the product through the existing product CRUD).

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
pnpm --filter @flora/api test Quantity
pnpm --filter @flora/api test InventoryItem
pnpm --filter @flora/api test inventory-schemas
```

## Manual API Validation

Start the API:

```bash
pnpm dev:api
```

Set ids:

```bash
ORG_ID="<existing-organization-id>"
PRODUCT_ID="<existing-product-id>"
USER_ID="<acting-user-id>"
BASE="http://localhost:3333/organizations/$ORG_ID/products/$PRODUCT_ID/inventory"
```

### 1. Create Inventory Position

```bash
curl -s -X POST "$BASE" \
  -H "Content-Type: application/json" \
  -d '{
    "availableQuantity": 100,
    "minimumQuantity": 10,
    "reason": "Saldo inicial de implantacao.",
    "createdByUserId": "'"$USER_ID"'"
  }'
```

Expected outcome:

- Status `201`.
- Response contains `organizationId = ORG_ID`, `productId = PRODUCT_ID`.
- `availableQuantity = 100`, `reservedQuantity = 0`, `minimumQuantity = 10`, `belowMinimum = false`.
- An opening `IN` movement was recorded (visible in step 8).
- Response contains no batch, expiration, order, prescription, checkout, payment, upload, or image fields.

### 2. Duplicate Creation Is Rejected

```bash
curl -s -X POST "$BASE" \
  -H "Content-Type: application/json" \
  -d '{ "minimumQuantity": 10, "createdByUserId": "'"$USER_ID"'" }'
```

Expected outcome:

- Status `409`.
- No second position is created.

### 3. Get Inventory Position

```bash
curl -s "$BASE"
```

Expected outcome:

- Status `200`.
- Current balances for `PRODUCT_ID` are returned.

### 4. Add Stock (IN)

```bash
curl -s -X POST "$BASE/add-stock" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 50, "reason": "Compra de reposicao.", "createdByUserId": "'"$USER_ID"'" }'
```

Expected outcome:

- Status `200`.
- `availableQuantity` increased by 50.

### 5. Reserve (RESERVE)

```bash
curl -s -X POST "$BASE/reserve" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 20, "reason": "Separacao.", "createdByUserId": "'"$USER_ID"'" }'
```

Expected outcome:

- Status `200`.
- `availableQuantity` decreased by 20, `reservedQuantity` increased by 20.
- Reserving more than `availableQuantity` returns `422` and changes nothing.

### 6. Release Reservation (RELEASE)

```bash
curl -s -X POST "$BASE/release-reservation" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 5, "reason": "Cancelamento de separacao.", "createdByUserId": "'"$USER_ID"'" }'
```

Expected outcome:

- Status `200`.
- `reservedQuantity` decreased by 5, `availableQuantity` increased by 5.
- Releasing more than `reservedQuantity` returns `422` and changes nothing.

### 7. Confirm Stock-Out (OUT)

```bash
curl -s -X POST "$BASE/confirm-stock-out" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 15, "reason": "Dispensacao confirmada.", "createdByUserId": "'"$USER_ID"'" }'
```

Expected outcome:

- Status `200`.
- `reservedQuantity` decreased by 15; `availableQuantity` unchanged.
- Confirming more than `reservedQuantity` returns `422` and changes nothing.

### 8. Adjust (ADJUSTMENT)

```bash
curl -s -X POST "$BASE/adjust" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 95, "reason": "Correcao apos contagem fisica.", "createdByUserId": "'"$USER_ID"'" }'
```

Expected outcome:

- Status `200`.
- `availableQuantity` set to 95; `reservedQuantity` unchanged.
- A negative or non-integer adjustment returns `422` or `400` and changes nothing.

### 9. List Movements

```bash
curl -s "$BASE/movements"
```

Expected outcome:

- Status `200`.
- Response shape is `{ "data": [...] }`, most recent first.
- One movement exists per successful operation above (opening IN, IN, RESERVE, RELEASE, OUT, ADJUSTMENT).
- Each movement includes `type`, `quantity`, `reason`, `createdByUserId`, and `createdAt`.

### 10. Validation Failures

```bash
curl -s -X POST "$BASE/add-stock" \
  -H "Content-Type: application/json" \
  -d '{ "quantity": 0, "createdByUserId": " " }'
```

Expected outcome:

- Request is rejected with a structured error.
- No balances change and no movement is created.

### 11. Tenant Isolation

```bash
OTHER_ORG_ID="<another-organization-id>"

curl -s "http://localhost:3333/organizations/$OTHER_ORG_ID/products/$PRODUCT_ID/inventory"
```

Expected outcome:

- Status `404`.
- Inventory data from `ORG_ID` is not exposed.

### 12. Product Is Never Mutated

After all operations, fetch the product through the product CRUD and confirm no catalog field changed:

```bash
curl -s "http://localhost:3333/organizations/$ORG_ID/products/$PRODUCT_ID"
```

Expected outcome:

- Product fields are identical to before inventory operations.

## Contract Reference

See [contracts/organization-product-inventory.openapi.yaml](./contracts/organization-product-inventory.openapi.yaml) for endpoint shapes, the movement enum, request bodies, responses, and error contracts.

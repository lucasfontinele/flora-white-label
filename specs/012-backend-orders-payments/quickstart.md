# Quickstart: Pedidos e Pagamentos no Backend (Orders & Payments)

This guide validates the backend orders & payments slice after implementation.

## Prerequisites

- Dependencies installed with `pnpm install`.
- API environment configured with a valid `DATABASE_URL`.
- PostgreSQL available for Prisma migration tests.
- At least one organization, one patient (and optionally its guardian), and one or more active products exist (create products through the existing product CRUD).
- AbacatePay environment configured: `ABACATEPAY_API_KEY` and `ABACATEPAY_BASE_URL` (a dev default exists for `ABACATEPAY_BASE_URL`). For local validation without a real key, use the gateway fake in tests; for manual PIX validation against the sandbox, the AbacatePay devMode/`simulate-payment` flow can be used.

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
pnpm --filter @flora/api test DiscountRate
pnpm --filter @flora/api test Order
pnpm --filter @flora/api test OrderPayment
pnpm --filter @flora/api test AbacatePay
pnpm --filter @flora/api test order-schemas
```

## Manual API Validation

Start the API:

```bash
pnpm dev:api
```

Set ids:

```bash
ORG_ID="<existing-organization-id>"
PATIENT_ID="<existing-patient-id>"
GUARDIAN_ID="<patient-guardian-id-or-empty>"
PRODUCT_ID="<existing-active-product-id>"
BASE="http://localhost:3333/organizations/$ORG_ID/orders"
```

### 1. Create an Order

```bash
curl -s -X POST "$BASE" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "'"$PATIENT_ID"'",
    "deliveryType": "CORREIOS",
    "items": [
      { "productId": "'"$PRODUCT_ID"'", "quantity": 2 }
    ]
  }'
```

Expect `201` with `status = REQUESTED`, a readable `token` (e.g. `ORD-XXXXXX`), `itemsAmount = 2`, and each item carrying a frozen `unitPrice` in cents. Capture the `id`:

```bash
ORDER_ID="<order-id-from-response>"
```

### 2. List Orders

```bash
curl -s "$BASE"
```

Expect `200` with `{ "data": [ ... ] }` containing only this organization's orders.

### 3. Get One Order

```bash
curl -s "$BASE/$ORDER_ID"
```

Expect `200` with the order and its `items`.

### 4. Create a PIX Payment

```bash
curl -s -X POST "$BASE/$ORDER_ID/payments" \
  -H "Content-Type: application/json" \
  -d '{ "paymentMethod": "PIX", "discount": 0.1 }'
```

Expect `201` with `status = PENDING`, `totalPaid` = `round(gross * 0.9)` in cents, `externalPaymentId`, `pixQrCode` (copia-e-cola) and `pixQrCodeBase64` populated, `checkoutUrl = null`, and **no** gateway secret. Capture the payment id:

```bash
PAYMENT_ID="<payment-id-from-response>"
```

### 5. Create a Credit-Card Payment (alternative)

```bash
curl -s -X POST "$BASE/$ORDER_ID/payments" \
  -H "Content-Type: application/json" \
  -d '{ "paymentMethod": "CREDIT_CARD" }'
```

Expect `201` with `checkoutUrl` populated for redirect and `pixQrCode`/`pixQrCodeBase64 = null`.

### 6. List Payments of the Order

```bash
curl -s "$BASE/$ORDER_ID/payments"
```

Expect `200` with `{ "data": [ ... ] }`. No secrets in any item.

### 7. Get One Payment

```bash
curl -s "$BASE/$ORDER_ID/payments/$PAYMENT_ID"
```

Expect `200` with the payment fields and no gateway secret.

### 8. Sync Payment Status

```bash
curl -s -X PATCH "$BASE/$ORDER_ID/payments/$PAYMENT_ID/sync-status"
```

Expect `200` with `status` reflecting the AbacatePay status mapped to `PaymentStatus`. (In sandbox/devMode you can first simulate payment via the AbacatePay `simulate-payment` flow, then sync.)

### 9. Cancel the Order

```bash
curl -s -X PATCH "$BASE/$ORDER_ID/cancel"
```

Expect `200` with `status = CANCELLED`.

### 10. Negative Checks

```bash
# Order with no items -> 400/422
curl -s -X POST "$BASE" -H "Content-Type: application/json" \
  -d '{ "patientId": "'"$PATIENT_ID"'", "deliveryType": "PICKUP", "items": [] }'

# Payment with invalid discount -> 400/422
curl -s -X POST "$BASE/$ORDER_ID/payments" -H "Content-Type: application/json" \
  -d '{ "paymentMethod": "PIX", "discount": 1.5 }'

# Payment on a cancelled order -> 4xx (after step 9)
curl -s -X POST "$BASE/$ORDER_ID/payments" -H "Content-Type: application/json" \
  -d '{ "paymentMethod": "PIX" }'

# BOLETO -> structured "method not supported by gateway" error
curl -s -X POST "$BASE/$ORDER_ID/payments" -H "Content-Type: application/json" \
  -d '{ "paymentMethod": "BOLETO" }'

# Cross-organization access -> 404
curl -s "http://localhost:3333/organizations/<other-org-id>/orders/$ORDER_ID"
```

## What "Done" Looks Like

- All eight endpoints exist and are organization-scoped.
- Orders start `REQUESTED`, require >= 1 item, carry a readable unique `token`, compute `itemsAmount`, and freeze item `unitPrice`.
- Cancelling sets `CANCELLED`; cancelled orders reject changes and new payments.
- Payments start `PENDING`, compute `totalPaid` in cents with the discount applied, use `PaymentGatewayService`, store only non-sensitive gateway references, and never leak secrets.
- `sync-status` maps the AbacatePay status to `PaymentStatus` and does not change `Order` status.
- Domain has no Prisma/Fastify/Zod/AbacatePay/HTTP imports; application depends on interfaces and the gateway port; AbacatePay lives only in `AbacatePayPaymentGatewayService`.
- No inventory reservation/decrement, freight, Correios, split, refund, invoice, e-mail, prescription entity, webhook, or `packages/web` change.
- `pnpm prisma:generate`, `pnpm typecheck:api`, `pnpm --filter @flora/api lint`, `pnpm test:api`, and `pnpm build:api` all pass.

# Shared Contracts: Organization Registration

These contracts are the source of truth until `packages/shared` exists. When
the shared package is created, these shapes should move there as exported
TypeScript contracts and remain aligned with the OpenAPI contract.

## Address

Reusable by organization registration and future user registration.

```ts
type Address = {
  cep: string;
  logradouro: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
};
```

## Company Data

```ts
type OrganizationCompanyData = {
  legalName: string;
  tradeName: string;
  cnpj: string;
  foundationDate: string;
  primaryCnae: string;
  secondaryCnaes: string[];
  institutionalEmail: string;
  whatsapp: string;
};
```

## Money In Cents

All monetary fields in this feature use integer cents.

```ts
type MoneyInCents = number;
```

Rules:

- R$ 597,00 is represented as `59700`.
- R$ 997,00 is represented as `99700`.
- R$ 2.097,00 is represented as `209700`.
- Display formatting may convert cents to localized currency, but the form
  state and API contract keep cents as the source of truth.

## Subscription Plan

```ts
type SubscriptionPlanCode = "starter" | "growth" | "unlimited";
type OperatorLimitType = "limited" | "unlimited";

type SubscriptionPlan = {
  id: string;
  code: SubscriptionPlanCode;
  name: "Starter" | "Growth" | "Unlimited";
  priceInCents: MoneyInCents;
  maxActiveUsers: number;
  operatorLimitType: OperatorLimitType;
  maxOperators: number | null;
};
```

Default values:

```ts
const defaultSubscriptionPlans = [
  {
    code: "starter",
    name: "Starter",
    priceInCents: 59700,
    maxActiveUsers: 50,
    operatorLimitType: "limited",
    maxOperators: 10,
  },
  {
    code: "growth",
    name: "Growth",
    priceInCents: 99700,
    maxActiveUsers: 100,
    operatorLimitType: "limited",
    maxOperators: 30,
  },
  {
    code: "unlimited",
    name: "Unlimited",
    priceInCents: 209700,
    maxActiveUsers: 3000,
    operatorLimitType: "unlimited",
    maxOperators: null,
  },
] as const;
```

## Create Organization Input

```ts
type CreateOrganizationInput = {
  company: OrganizationCompanyData;
  address: Address;
  subscriptionPlanId: string;
};
```

## Created Organization

```ts
type Organization = {
  id: string;
  company: OrganizationCompanyData;
  address: Address & { id: string };
  subscriptionPlan: SubscriptionPlan;
  createdByMasterUserId: string;
  createdAt: string;
  updatedAt: string;
};
```

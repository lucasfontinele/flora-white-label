# Shared Type Contract: Master Organizations

The shared package will expose DTOs and enums used by `packages/web` and
`packages/api`. The package name should be `@flora/shared`, with organization
contracts exported from `@flora/shared/organizations` and re-exported from the
package root.

## Exports

```ts
export type PlanCode = "starter" | "growth" | "unlimited";

export type OperatorLimitType = "limited" | "unlimited";

export type SubscriptionPlanDto = {
  code: PlanCode;
  id: string;
  maxActiveUsers: number;
  maxOperators: number | null;
  name: "Starter" | "Growth" | "Unlimited";
  operatorLimitType: OperatorLimitType;
  priceInCents: number;
};

export type AddressDto = {
  cep: string;
  city: string;
  complement?: string;
  logradouro: string;
  neighborhood: string;
  number: string;
  state: string;
};

export type PersistedAddressDto = AddressDto & {
  id: string;
};

export type OrganizationCompanyDataDto = {
  cnpj: string;
  facebook?: string;
  foundationDate: string;
  instagram?: string;
  institutionalEmail: string;
  linkedin?: string;
  legalName: string;
  phone?: string;
  primaryCnae: string;
  secondaryCnaes: string[];
  site?: string;
  tradeName: string;
  whatsapp: string;
};

export type CreateOrganizationRequest = {
  address: AddressDto;
  company: OrganizationCompanyDataDto;
  subscriptionPlanId: string;
};

export type OrganizationDto = {
  address: PersistedAddressDto;
  company: OrganizationCompanyDataDto;
  createdAt: string;
  createdByMasterUserId: string;
  id: string;
  subscriptionPlan: SubscriptionPlanDto;
  updatedAt: string;
};

export type OrganizationListItemDto = {
  city: string;
  cnpj: string;
  createdAt: string;
  id: string;
  legalName: string;
  state: string;
  subscriptionPlan: SubscriptionPlanDto;
  tradeName: string;
};

export type PaginationDto = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type ListOrganizationsQuery = {
  page?: number;
  perPage?: number;
};

export type ListOrganizationsResponse = {
  data: OrganizationListItemDto[];
  pagination: PaginationDto;
};

export type CreateOrganizationResponse = {
  data: OrganizationDto;
};

export type ListSubscriptionPlansResponse = {
  data: SubscriptionPlanDto[];
};

export type ErrorResponseDto = {
  error: {
    code: string;
    details?: unknown;
    message: string;
  };
};
```

## Rules

- Shared types must not import React, Next.js, Fastify, Prisma, or web/API
  internals.
- API responses must conform to these DTOs before being returned from route
  handlers.
- Web request functions must use these DTOs instead of local duplicate API
  shapes.
- Runtime validation remains package-local: web validates form UX, API validates
  external input authoritatively.

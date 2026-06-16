# Implementation Plan: Master Organization Form

**Branch**: `feat/organization` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-master-organization-form/spec.md`

## Summary

Build the first Master housekeeping module for organizations as an end-to-end
Create + Read slice: a Master organization list table, a multi-step organization
registration screen, real integration with organization and plan endpoints, and
a new `packages/shared` package that owns the DTOs/enums used by `packages/web`
and `packages/api`. The first slice intentionally excludes edit/delete screens
because the user scope says to create only the list and registration screens.

## Technical Context

**Language/Version**: TypeScript 6.x, Node.js runtime for API, React 19 / Next.js
16 for web.

**Primary Dependencies**: `packages/web` uses Next.js, React, Tailwind CSS,
React Query, React Hook Form, Zod, and existing UI primitives. `packages/api`
uses Fastify, Prisma, PostgreSQL, and the current temporary Master header plugin.
`packages/shared` will be dependency-light TypeScript for shared DTOs, enums, and
contract helper types.

**Storage**: PostgreSQL via Prisma for organizations, addresses, and subscription
plans. Browser state holds only the active multi-step registration draft.

**Testing**: Vitest for API and web unit/component tests; repository gates are
`pnpm typecheck` and `pnpm build`, with package gates `pnpm test:api`,
`pnpm test:web`, `pnpm typecheck:api`, `pnpm typecheck:web`, `pnpm build:api`,
and `pnpm build:web`.

**Target Platform**: Next.js web app plus Fastify API runtime, with a shared
workspace package consumed by both.

**Project Type**: pnpm monorepo touching `packages/web`, `packages/api`,
`packages/shared`, root workspace metadata, and feature documentation.

**Performance Goals**: The Master organization list should show the first page
of organizations within 2 seconds in the local development environment. Form
step transitions and validation feedback should feel immediate for a typical
single organization registration.

**Constraints**: Monetary values remain integer cents at all package boundaries.
The first implementation uses the existing temporary Master headers
`x-master-user-id` and `x-master-role` until the final authentication module
exists. No package may import another package's private internals.

**Scale/Scope**: First Master organizations slice covers list/read and create
flows, including plan lookup. Update, delete, suspension, billing, analytics, and
full authentication are out of scope for this feature.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundaries**: Affected packages are `packages/shared` for contracts,
  `packages/api` for organization and plan endpoints, `packages/web` for the
  Master screens, and root workspace metadata so the shared package participates
  in pnpm filters and build/typecheck gates. The plan uses public package imports
  only.
- **Shared Contracts**: Shared contracts include `AddressDto`,
  `OrganizationCompanyDataDto`, `SubscriptionPlanDto`, `PlanCode`,
  `OperatorLimitType`, `CreateOrganizationRequest`,
  `CreateOrganizationResponse`, `OrganizationDto`,
  `OrganizationListItemDto`, `ListOrganizationsQuery`,
  `ListOrganizationsResponse`, `PaginationDto`, and `ErrorResponseDto`.
  These move out of web-local types and become the single contract source.
- **Tenant Isolation**: The Master module is platform-level and must never enter
  an organization tenant workspace. Create establishes the organization tenant
  boundary; list returns only Master-authorized organization summaries. Temporary
  Master headers preserve the role boundary until real authentication exists.
- **Clean Layering**: API changes stay in route, application use case,
  repository interface, domain mapper, and Prisma adapter layers. Web changes
  stay under `app/(master)/organizations` with `components/`, `requests/`,
  `queries/`, `schemas/`, and shared DTO imports. `packages/shared` contains no
  React, Fastify, Prisma, or database logic.
- **Verifiable Delivery**: US1 is verified by list endpoint tests and web table
  tests for loading/empty/error/data states. US2 is verified by step validation
  tests and form behavior tests. US3 is verified by plan lookup, create request,
  success state, and list refresh tests. Manual quickstart validates the full
  local flow.

**Gate Status**: PASS. No constitution violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/002-master-organization-form/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── master-organizations.openapi.yaml
│   └── shared-types.md
└── tasks.md
```

### Source Code (repository root)

```text
packages/
├── shared/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       └── organizations.ts
├── api/
│   ├── prisma/
│   └── src/
│       ├── application/
│       │   └── organizations/
│       │       ├── create-organization-use-case.ts
│       │       ├── list-organizations-use-case.ts
│       │       └── organization-repository.ts
│       ├── communication/
│       │   └── http/
│       │       ├── plugins/master-auth.ts
│       │       └── routes/organizations-routes.ts
│       ├── domain/
│       │   ├── addresses/
│       │   ├── organizations/
│       │   └── subscription-plans/
│       └── infrastructure/
│           └── database/
│               └── prisma-organization-repository.ts
└── web/
    ├── app/
    │   └── (master)/
    │       └── organizations/
    │           ├── components/
    │           │   ├── organization-list-table.tsx
    │           │   └── organization-registration-form.tsx
    │           ├── new/page.tsx
    │           ├── page.tsx
    │           ├── queries/
    │           │   ├── use-organizations.ts
    │           │   └── use-subscription-plans.ts
    │           ├── requests/
    │           │   ├── create-organization.ts
    │           │   ├── list-organizations.ts
    │           │   └── list-subscription-plans.ts
    │           ├── schemas/
    │           │   └── organization-registration-schema.ts
    │           └── types.ts
    └── lib/
        └── http.ts
```

**Structure Decision**: Create `packages/shared` now because organization DTOs
are already duplicated between web and API. Keep the web feature colocated under
`app/(master)/organizations`; keep API behavior in the existing layered
structure; keep `types.ts` as a local UI composition layer only when it adds UI
state shapes, not duplicate API contracts.

## Complexity Tracking

No constitution violations require justification.

## Post-Design Constitution Check

- **Monorepo Boundaries**: PASS. The design introduces a public shared package
  and keeps app-specific behavior inside each package.
- **Shared Contracts**: PASS. DTOs and enums are documented in contracts and
  mapped to `packages/shared/src/organizations.ts`.
- **Tenant Isolation**: PASS. Master headers are temporary but explicit; tenant
  operator routes are not reused for platform administration.
- **Clean Layering**: PASS. API list/create behavior remains layered and web
  list/create behavior remains route-group scoped.
- **Verifiable Delivery**: PASS. Quickstart and contracts define testable
  end-to-end validation.

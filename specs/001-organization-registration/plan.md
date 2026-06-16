# Implementation Plan: Organization Registration

**Branch**: `main` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-organization-registration/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement the first Organization domain slice for Master-created tenant
organizations. The feature records company data, reusable Brazilian address
data, and an initial subscription plan, while seeding the required Starter,
Growth, and Unlimited plan catalog values in integer cents. Organization is the
aggregate root for tenant identity and lifecycle. Address is a reusable
domain contract/value object that can be used by organization registration now
and user registration later. Subscription Plan is platform reference data
selected by organizations.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js >=20.9.0, pnpm 10.14.0

**Primary Dependencies**: Next.js 16, React 19, Tailwind CSS, React Query,
React Hook Form, Zod, Zustand, Fastify 5, Prisma 6, PostgreSQL, dotenv

**Storage**: PostgreSQL via Prisma for organizations, addresses, subscription
plans, and plan selection; local web form state only for in-progress input

**Testing**: Add package-level automated checks for critical domain/API behavior
using existing TypeScript tooling where possible; baseline gates remain
`pnpm typecheck`, `pnpm build`, and API Prisma generation/migration validation.
Manual quickstart validation covers the end-to-end Master registration flow.

**Target Platform**: Next.js web app and Fastify API runtime in the pnpm
monorepo

**Project Type**: Monorepo feature spanning `packages/api`, `packages/web`,
future `packages/shared`, Prisma schema/migrations, and feature documentation

**Performance Goals**: A Master user can complete organization registration in
under 5 minutes; plan selection and validation feedback are available during
the registration flow; plan catalog lookup supports the three default plans
without user-visible delay.

**Constraints**: Monetary values are integer cents everywhere; tenant scoping
starts at organization creation; only Master users may create organizations;
organization CNPJ is unique platform-wide; Unlimited plan means no operator cap
and does not mean zero operators.

**Scale/Scope**: One Master-facing organization creation workflow, three seeded
subscription plans, one reusable address contract, one organization aggregate,
and API/web contracts for create-and-read validation. Editing, deletion,
suspension, billing charge execution, and Master account creation are out of
scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundaries**: PASS. API/domain/persistence work belongs in
  `packages/api`; Master UI and form validation belong in `packages/web`; shared
  contracts are documented now and migrate to `packages/shared` when that
  package exists; root config changes are limited to workspace scripts if tests
  are added.
- **Shared Contracts**: PASS. Organization registration, Address, Company Data,
  Subscription Plan, and cent-based money contracts are captured in
  `contracts/organization-registration.openapi.yaml` and
  `contracts/shared-contracts.md`.
- **Tenant Isolation**: PASS. Organization is the tenant aggregate root.
  Organization-created data is scoped by the organization identifier, and Master
  administration remains above tenant organizations.
- **Clean Layering**: PASS. API work is planned through domain/application,
  communication/http, infrastructure/database, and exception layers. Web work is
  planned as a Master-facing route group and feature folder with schemas,
  requests, queries, components, and types.
- **Verifiable Delivery**: PASS. The design includes validation for Master-only
  creation, CNPJ uniqueness, default plan values, integer-cent money handling,
  tenant scoping, and aggregate-boundary decisions.

## Project Structure

### Documentation (this feature)

```text
specs/001-organization-registration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── organization-registration.openapi.yaml
│   └── shared-contracts.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
packages/
├── api/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── application/
│       │   └── organizations/
│       ├── communication/http/
│       │   └── routes/
│       ├── domain/
│       │   ├── addresses/
│       │   ├── organizations/
│       │   └── subscription-plans/
│       ├── exception/
│       └── infrastructure/
│           └── database/
├── web/
│   ├── app/
│   │   └── (master)/
│   │       └── organizations/
│   ├── components/
│   │   └── domain/
│   └── lib/
└── shared/              # Planned package for shared contracts/types
```

**Structure Decision**: Use the current `packages/api` and `packages/web`
packages. Introduce a Master-facing web route group for platform administration
instead of placing Master workflows under the existing organization operational
route group. Treat `packages/shared` as the target for reusable Address,
Organization registration, and Plan contracts once the package is created; until
then, keep the source of truth in the feature contracts and mirror types in the
owning packages.

## Complexity Tracking

No constitution violations or unjustified complexity are planned.

## Phase 0: Research

Research decisions are captured in [research.md](./research.md). All technical
context unknowns are resolved.

## Phase 1: Design and Contracts

- Data model: [data-model.md](./data-model.md)
- API contract: [contracts/organization-registration.openapi.yaml](./contracts/organization-registration.openapi.yaml)
- Shared contract guidance: [contracts/shared-contracts.md](./contracts/shared-contracts.md)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Monorepo Boundaries**: PASS. Design artifacts assign API, web, shared
  contract, and Prisma responsibilities without cross-package private imports.
- **Shared Contracts**: PASS. Contracts document reusable Address, Organization
  Registration, Company Data, Subscription Plan, and Money-in-Cents shapes.
- **Tenant Isolation**: PASS. Data model treats Organization as the aggregate
  root and tenant boundary; organization-owned rows reference `organizationId`
  after creation.
- **Clean Layering**: PASS. Data model separates aggregate/value/reference data;
  contracts separate interface shape from persistence details.
- **Verifiable Delivery**: PASS. Quickstart covers seeded plans, creation,
  validation failures, non-Master rejection, duplicate CNPJ rejection, and
  cent-based money verification.

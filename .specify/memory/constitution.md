<!--
Sync Impact Report
Version change: unratified template -> 1.0.0
Modified principles:
- Template Principle 1 -> I. Monorepo Package Boundaries
- Template Principle 2 -> II. TypeScript Contracts and Shared Types
- Template Principle 3 -> III. Tenant Isolation and White-Label Scope
- Template Principle 4 -> IV. Clean Code and Layered Architecture
- Template Principle 5 -> V. Verifiable Delivery and Operational Readiness
Added sections:
- Architecture Constraints
- Development Workflow and Quality Gates
Removed sections:
- None
Templates requiring updates:
- ✅ .specify/templates/plan-template.md
- ✅ .specify/templates/spec-template.md
- ✅ .specify/templates/tasks-template.md
- ✅ .specify/templates/commands/*.md (directory absent; no command templates to update)
Runtime docs requiring updates:
- ✅ README.md
Follow-up TODOs:
- None
-->
# FloraApp Constitution

## Core Principles

### I. Monorepo Package Boundaries
FloraApp MUST remain a pnpm workspace organized around deployable applications
and shared packages under `packages/*`. The front-end belongs in `packages/web`,
the API belongs in `packages/api`, and future cross-project contracts belong in
`packages/shared`. Packages MUST NOT import another package's private internals:
`packages/web` consumes API contracts and client abstractions, `packages/api`
owns server behavior, and shared DTOs, enums, and TypeScript types live in the
shared package once they are used by more than one package.

Rationale: clear workspace ownership keeps the monorepo scalable while avoiding
hidden coupling between the Next.js application, Fastify API, and shared domain
contracts.

### II. TypeScript Contracts and Shared Types
All production code MUST use TypeScript with explicit, meaningful types at
package boundaries. API payloads, DTOs, enums, order/member/product/document
status values, and cross-package interfaces MUST be defined once in
`packages/shared` when the shared package exists. Until that package is created,
contract changes MUST be documented in the feature contract artifacts and kept
consistent between `packages/web` and `packages/api`. External input MUST be
validated at runtime in the layer that receives it.

Rationale: a white-label, multi-tenant system depends on stable contracts; shared
types reduce drift between UI flows, API handlers, persistence, and business
rules.

### III. Tenant Isolation and White-Label Scope
Every feature that reads, writes, displays, or reports organization data MUST
enforce tenant scope from the start. Core domain entities MUST carry
`organizationId` or an explicitly justified equivalent tenant key. Queries,
commands, background work, reports, and UI state MUST NOT expose data across
organizations. White-label settings such as association name, logo, primary
color, custom domain, institutional data, and portal text MUST be tenant-scoped.

Rationale: tenant isolation is a product requirement and a data safety boundary;
adding it later creates migration risk and weakens user trust.

### IV. Clean Code and Layered Architecture
Code MUST be small, named after domain concepts, and placed in the layer that
owns the responsibility. The API MUST keep domain and application logic separate
from HTTP, Prisma, Stripe, storage, and other infrastructure adapters. The web
app MUST keep feature code close to the route group or feature folder, using
`components/`, `requests/`, `queries/`, `schemas/`, and `types.ts` consistently.
Shared UI primitives belong in `components/ui`, layout shells in
`components/layout`, and reusable domain presentation in `components/domain`.
Abstractions MUST be introduced only when they remove real duplication or isolate
a real dependency.

Rationale: clean code here means predictable boundaries, readable names, and
simple dependency direction, not extra ceremony.

### V. Verifiable Delivery and Operational Readiness
Every user story MUST be independently demonstrable and testable. Changes that
touch API contracts, tenant isolation, validation, persistence, authentication,
orders, documents, inventory, payments, or reports MUST include automated tests
or a documented reason with manual verification steps. The repository-wide
quality gates are `pnpm typecheck` and `pnpm build`; package-specific gates
MUST be used when a change is limited to one package. API changes MUST preserve
structured errors and health/readiness behavior.

Rationale: the system handles regulated operational workflows; delivery must
prove that important behavior works and that failures remain diagnosable.

## Architecture Constraints

FloraApp uses a pnpm monorepo with TypeScript as the default implementation
language across packages.

- `packages/web` contains the Next.js front-end with Tailwind CSS, React Query,
  React Hook Form, runtime validation with Zod or an approved equivalent, and
  route groups for authentication, associated users, and organization operators.
- `packages/api` contains the Node.js Fastify API using layered architecture,
  Prisma ORM, PostgreSQL, JWT/Auth, Stripe integration points, and centralized
  application exceptions.
- `packages/shared` is the planned home for DTOs, enums, API contracts, shared
  TypeScript interfaces, and domain status definitions used by both apps.
- The workspace MUST keep root scripts for common development gates, including
  dev, build, typecheck, Prisma generation, and Prisma migrations.
- Data models for principal organization-owned records MUST include tenant
  ownership and MUST be designed before API or UI behavior assumes global data.

## Development Workflow and Quality Gates

Feature specifications MUST identify affected packages, user roles, tenant
scope, white-label impact, contract changes, and independently testable user
stories. Plans MUST pass the Constitution Check before Phase 0 research and
again after Phase 1 design.

Implementation tasks MUST preserve package boundaries and story independence.
Tasks that alter API payloads, enums, or shared domain concepts MUST include
contract updates and a migration path to `packages/shared` when the shared
package exists. Tasks that alter persistence MUST include Prisma schema and
migration work. Tasks that alter UI behavior MUST include route-group placement
and validation details.

Before review or merge, the relevant quality gates MUST pass:

- Run `pnpm typecheck` for repository-wide TypeScript validation.
- Run `pnpm build` for repository-wide build validation.
- Run `pnpm typecheck:web` and `pnpm build:web` for web-only changes.
- Run `pnpm typecheck:api` and `pnpm build:api` for API-only changes.
- Run Prisma generation and migrations when the API schema changes.

## Governance

This constitution supersedes conflicting project practices, template defaults,
and ad hoc implementation preferences. Amendments MUST be proposed with a clear
reason, expected impact, affected templates/docs, and migration notes when
existing work must change.

Versioning follows semantic versioning:

- MAJOR for incompatible changes to principles, governance, package ownership,
  or tenant-safety requirements.
- MINOR for new principles, new mandatory sections, or materially expanded
  guidance.
- PATCH for clarifications, wording improvements, and non-semantic corrections.

Every feature spec, plan, task list, review, and pull request MUST check
constitution compliance. Violations are allowed only when documented in the
plan's Complexity Tracking section with a concrete reason and a simpler
alternative that was rejected.

**Version**: 1.0.0 | **Ratified**: 2026-06-16 | **Last Amended**: 2026-06-16

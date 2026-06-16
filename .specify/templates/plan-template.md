# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [TypeScript/Node.js versions or NEEDS CLARIFICATION]

**Primary Dependencies**: [Next.js/React/Tailwind/React Query/React Hook Form/Zod for web; Fastify/Prisma/PostgreSQL/JWT/Stripe for API; or NEEDS CLARIFICATION]

**Storage**: [PostgreSQL via Prisma, browser/local state, external service, or N/A]

**Testing**: [package-level tests/manual verification plus pnpm typecheck/build gates or NEEDS CLARIFICATION]

**Target Platform**: [Next.js web app, Fastify API runtime, or both]

**Project Type**: [pnpm monorepo package scope: web/api/shared/root config]

**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]

**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]

**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundaries**: Identify every affected package (`packages/web`,
  `packages/api`, future `packages/shared`, or root config). Confirm the plan
  does not import private internals across packages.
- **Shared Contracts**: List DTOs, enums, API payloads, status values, and
  TypeScript interfaces touched by the feature. Confirm shared concepts are
  documented in contracts and placed in `packages/shared` when available.
- **Tenant Isolation**: Explain how `organizationId` or equivalent tenant scope
  is enforced for reads, writes, reports, background work, and UI state.
- **Clean Layering**: Confirm API behavior stays within domain/application,
  communication/http, and infrastructure boundaries; confirm web behavior stays
  within route groups and feature folders.
- **Verifiable Delivery**: Define the independent test/demo for each user story
  and the automated or manual verification required for contracts, tenant
  isolation, validation, persistence, auth, and critical flows.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# FloraApp monorepo layout
packages/
├── web/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (associated)/
│   │   └── (organization)/
│   ├── components/
│   ├── lib/
│   └── styles/
├── api/
│   ├── prisma/
│   └── src/
│       ├── application/
│       ├── communication/
│       ├── domain/
│       ├── exception/
│       └── infrastructure/
└── shared/              # Planned package for shared contracts/types
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

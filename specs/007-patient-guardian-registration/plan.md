# Implementation Plan: Cadastro Backend de Pacientes/Guardiões

**Branch**: `(not set; spec directory 007-patient-guardian-registration)` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-patient-guardian-registration/spec.md`

## Summary

Build one API-only initial registration flow under
`POST /organizations/:organizationId/patient-registrations`. The endpoint must
accept an explicit discriminated `registrationType` (`Patient`,
`LegalGuardian`, or `PetTutor`) and create only the records required by that
type. Existing code already contains an older patient-registration slice based
on `isSelfResponsible` and `user.profile`; this feature replaces that contract
with the new `registrationType` contract, removes underprivileged approval work
from this slice, keeps hashing behind `HashService`, and keeps Prisma in
infrastructure.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Node.js runtime, ES2022 target,
NodeNext module resolution.

**Primary Dependencies**: `packages/api` uses Fastify 5.8.5, Prisma 6.19.3,
PostgreSQL, Zod 4.4.3, Vitest 4.1.9, and existing shared domain/application
helpers. `argon2` is isolated behind `Argon2HashService`; the use case must
depend only on `HashService`.

**Storage**: PostgreSQL through Prisma. `User`, `Guardian`, `Patient`, and
`PatientAssessment` exist in `packages/api/prisma/schema.prisma`, but this
feature must touch only `User`, `Guardian`, and `Patient`.

**Testing**: Vitest unit tests for domain invariants, use-case behavior, and Zod
schemas. Existing API tests are mostly `src/**/*.test.ts` unit/schema tests;
there is no established Fastify `buildApp().inject()` HTTP route-test pattern,
so route tests should be added only if they can be isolated without real
database coupling.

**Target Platform**: Fastify API runtime only.

**Project Type**: pnpm monorepo, API-only change in `packages/api` plus feature
documentation under `specs/007-patient-guardian-registration`.

**Performance Goals**: Valid registration attempts should complete in under 2
seconds for at least 95% of acceptance test attempts in a normal development or
staging environment.

**Constraints**: Do not alter `packages/web`. Do not implement authentication,
login, logout, cookies, IronSession, refresh token, authorization middleware,
full patient CRUD, full guardian CRUD, pets, uploads, prescriptions, orders,
pathologies, or underprivileged approval. Do not force a `Guardian` for
`registrationType: "Patient"`. Do not turn this slice into a broad aggregate
root refactor.

**Scale/Scope**: One initial registration endpoint, one registration use case,
one discriminated request schema, one response contract, route registration,
repository adjustments for organization-scoped uniqueness, and focused tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Monorepo Boundaries**: PASS. Implementation is limited to `packages/api`;
  `packages/web` is explicitly out of scope.
- **Shared Contracts**: PASS. The new `registrationType` values and request/
  response contracts are backend-owned for this API-only slice. If a future web
  implementation consumes them, promote shared DTOs to `packages/shared`.
- **Tenant Isolation**: PASS. All user, guardian, and patient reads/writes use
  the `organizationId` route parameter as tenant scope. Email and document
  uniqueness must be checked within that organization.
- **Clean Layering**: PASS. Zod/Fastify stay in presentation, orchestration stays
  in application, domain entities stay persistence-agnostic, and Prisma/Argon2
  stay in infrastructure.
- **Verifiable Delivery**: PASS. Each registration type has an independent test
  path. Verification covers validation, tenant-scoped uniqueness, password
  hashing through `HashService`, transactionality, response shape, and absence
  of frontend/auth/CRUD scope creep.

## Project Structure

### Documentation (this feature)

```text
specs/007-patient-guardian-registration/
├── plan.md
├── spec.md
├── tasks.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
packages/
└── api/
    ├── package.json
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/
    └── src/
        ├── modules/
        │   ├── guardians/
        │   │   ├── application/repositories/GuardianRepository.ts
        │   │   ├── domain/entities/Guardian.ts
        │   │   └── infrastructure/prisma/
        │   │       ├── GuardianMapper.ts
        │   │       └── PrismaGuardianRepository.ts
        │   ├── patients/
        │   │   ├── application/
        │   │   │   ├── repositories/PatientRepository.ts
        │   │   │   └── use-cases/CreatePatientRegistrationUseCase.ts
        │   │   ├── domain/
        │   │   │   ├── entities/Patient.ts
        │   │   │   └── enums/RegistrationType.ts
        │   │   ├── infrastructure/
        │   │   │   ├── create-patient-registration.factory.ts
        │   │   │   └── prisma/
        │   │   └── presentation/http/
        │   │       ├── patient-registration-routes.ts
        │   │       └── patient-registration-schemas.ts
        │   └── users/
        │       ├── application/repositories/UserRepository.ts
        │       ├── domain/
        │       │   ├── entities/User.ts
        │       │   ├── enums/UserProfile.ts
        │       │   └── value-objects/
        │       └── infrastructure/prisma/
        └── shared/
            ├── application/
            │   ├── cryptography/HashService.ts
            │   ├── errors/
            │   └── transaction/UnitOfWork.ts
            ├── domain/
            │   ├── enums/Gender.ts
            │   └── value-objects/Document.ts
            ├── infrastructure/
            │   ├── cryptography/Argon2HashService.ts
            │   └── database/prisma/
            └── presentation/http/fastify/app.ts
```

**Structure Decision**: Keep the registration flow inside `modules/patients`
because the endpoint is patient-registration-centric. Reuse the existing
`users`, `guardians`, and `shared` ports/value objects. Add presentation files
under `modules/patients/presentation/http` instead of expanding auth or
organization modules.

## Current Architecture Analysis

- **User**: `packages/api/src/modules/users/domain/entities/User.ts`. Current
  props already include `organizationId`, `email`, `passwordHash`, `profile`,
  optional `guardianId`, and optional `patientId`. Current invariants require a
  Guardian user to have `guardianId`, require a Patient user to have
  `patientId`, and reject `patientId` for non-Patient users.
- **Guardian**: `packages/api/src/modules/guardians/domain/entities/Guardian.ts`.
  Current entity has `organizationId`, `name`, `document`, `birthdate`, and
  `gender`. Its comment still states a responsible party always exists for a
  patient, which conflicts with the new `Patient` registration type and should
  be corrected.
- **Patient**: `packages/api/src/modules/patients/domain/entities/Patient.ts`.
  Current props already make `guardianId?: string`, reject only empty
  `guardianId`, and keep `underPrivileged` on the patient.
- **Email**:
  `packages/api/src/modules/users/domain/value-objects/Email.ts`. It trims,
  lowercases, and validates email format.
- **Document**:
  `packages/api/src/shared/domain/value-objects/Document.ts`. It strips mask
  characters and validates Brazilian CPF digits.
- **PasswordHash**:
  `packages/api/src/modules/users/domain/value-objects/PasswordHash.ts`. It
  wraps an already-hashed password and does not accept plaintext.
- **Gender**:
  `packages/api/src/shared/domain/enums/Gender.ts`. Domain values are `M`, `F`,
  `O`, and `N/A`; the requested payload examples use `M`, `F`, and `O`.
- **UserRepository**:
  `packages/api/src/modules/users/application/repositories/UserRepository.ts`.
  Current `findByEmail(email)` is not organization-scoped, while the new
  registration flow requires same-organization uniqueness.
- **GuardianRepository**:
  `packages/api/src/modules/guardians/application/repositories/GuardianRepository.ts`.
  Current `findByDocument(organizationId, document)` is already
  organization-scoped.
- **PatientRepository**:
  `packages/api/src/modules/patients/application/repositories/PatientRepository.ts`.
  Current `findByDocument(organizationId, document)` is already
  organization-scoped.
- **HashService**:
  `packages/api/src/shared/application/cryptography/HashService.ts`. It exposes
  `hash(value)` and `verify(hash, value)`.
- **Zod usage**: Presentation schemas use Zod in files such as
  `organization-schemas.ts` and `auth-schemas.ts`, with route handlers calling
  `safeParse`. The existing patient registration use case currently parses Zod
  inside application code and must be adjusted so the new discriminated request
  schema is in the HTTP/presentation boundary.
- **Fastify routes/handlers**: Routes live in
  `modules/*/presentation/http/*-routes.ts`, create use cases through module
  factories, validate `request.params`, `request.body`, or `request.query`, and
  register JSON schemas for docs/validation. Global registration happens in
  `packages/api/src/shared/presentation/http/fastify/app.ts`.
- **Patient.guardianId in Prisma**: `packages/api/prisma/schema.prisma` already
  has `Patient.guardianId String?` and `guardian Guardian?`. Migration
  `20260619123000_make_patient_guardian_nullable` already drops the NOT NULL
  constraint.
- **Migration need**: No new migration is expected for optional
  `Patient.guardianId`. A migration is only needed if implementation discovers
  schema drift from the checked-in Prisma schema or changes persistence beyond
  the current nullable guardian relation.

## Target Architecture

- Define `RegistrationType` for `PetTutor`, `LegalGuardian`, and `Patient`.
- Replace the current `isSelfResponsible`/`user.profile` input with a
  discriminated registration input where the server derives `UserProfile`.
- Move patient-registration Zod validation to
  `modules/patients/presentation/http/patient-registration-schemas.ts`.
- Keep `CreatePatientRegistrationUseCase` in application code, depending on
  `UserRepository`, `GuardianRepository`, `PatientRepository`, `HashService`,
  and `UnitOfWork`.
- Remove `PatientAssessmentRepository` and `PatientAssessment` creation from
  this use case because underprivileged approval is out of scope.
- Use `HashService.hash` before wrapping the value with `PasswordHash`.
- Use `UnitOfWork` so every multi-record registration is atomic.
- Add Fastify route `POST /organizations/:organizationId/patient-registrations`
  and register it in `buildApp()`.

## Implementation Order

1. Review `Patient` domain and tests for optional `guardianId`.
2. Review `User` invariants and tests for Guardian without `patientId` and
   Patient without `guardianId`.
3. Review Prisma schema and migration state for nullable `Patient.guardianId`.
4. Add `RegistrationType`.
5. Add Zod discriminated union schemas and JSON schemas.
6. Add or adjust organization-scoped `UserRepository` email lookup.
7. Verify `GuardianRepository.findByDocument` organization scoping.
8. Verify `PatientRepository.findByDocument` organization scoping.
9. Refactor `CreatePatientRegistrationUseCase` for the new contract.
10. Implement `Patient` registration behavior.
11. Implement `LegalGuardian` registration behavior.
12. Implement `PetTutor` registration behavior.
13. Verify password hashing through `HashService`.
14. Verify transaction boundaries through `UnitOfWork`.
15. Add Fastify handler/route.
16. Register the route in the Fastify app.
17. Add unit tests for the use case.
18. Add HTTP tests only if an isolated route-test pattern is feasible.
19. Run `pnpm typecheck:api`.
20. Run `pnpm --filter @flora/api lint`.
21. Run `pnpm test:api`.

## Risks

- **Existing old contract**: The current use case accepts `isSelfResponsible`
  and `user.profile`; leaving it in place would not meet the explicit
  `registrationType` contract.
- **Out-of-scope assessment creation**: Current use-case behavior can create
  `PatientAssessment` for underprivileged patients, but this spec excludes
  underprivileged approval.
- **Repository scope mismatch**: `UserRepository.findByEmail(email)` is global,
  while registration requires same-organization uniqueness.
- **HTTP test friction**: No existing Fastify route test pattern is present;
  route tests should be attempted only if they can be isolated cleanly.

## Commands de Validação

```bash
pnpm prisma:generate
pnpm typecheck:api
pnpm --filter @flora/api lint
pnpm test:api
pnpm build:api
git diff -- packages/web
```

`pnpm prisma:generate` is needed if generated Prisma client state is stale.
No Prisma migration is expected unless schema drift is found.

## Post-Design Constitution Check

- **Monorepo Boundaries**: PASS. Planned changes are API-only.
- **Shared Contracts**: PASS. Contracts remain documented in feature artifacts;
  no frontend consumer exists in this scope.
- **Tenant Isolation**: PASS. All uniqueness checks and writes are scoped by
  route `organizationId`.
- **Clean Layering**: PASS. Zod/Fastify remain presentation concerns, Prisma and
  Argon2 remain infrastructure concerns, and application code consumes ports.
- **Verifiable Delivery**: PASS. Tasks include tests and validation gates for
  all three registration types and scope exclusions.

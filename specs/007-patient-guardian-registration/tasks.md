# Tasks: Cadastro Backend de Pacientes/Guardiões

**Input**: Design documents from `specs/007-patient-guardian-registration/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md)

**Tests**: Automated tests are required because this feature changes API contracts, tenant-scoped validation, persistence behavior, password hashing, and registration flows. HTTP route tests are conditional because no existing Fastify route-test pattern was found in `packages/api/src/**/*.test.ts`.

**Organization**: Tasks are grouped by setup/foundation first, then by the three independently testable registration stories: `Patient`, `LegalGuardian`, and `PetTutor`.

## Phase 1: Setup and Scope Guard

**Purpose**: Confirm the current architecture baseline and protect the explicit backend-only scope before code work begins.

- [X] T001 Review current patient-registration implementation in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.ts` (Objetivo: identify old `isSelfResponsible`/`user.profile`/`PatientAssessment` behavior to replace; Dependências: none; Aceite: implementation notes list every out-of-spec behavior before editing).
- [X] T002 [P] Confirm no frontend work is required by checking `packages/web` status with `git diff -- packages/web` (Objetivo: preserve backend-only scope; Dependências: none; Aceite: no planned task requires `packages/web` edits).
- [X] T003 [P] Review API scripts in `package.json` and `packages/api/package.json` (Objetivo: confirm validation commands for typecheck, lint, test, build; Dependências: none; Aceite: final validation uses existing scripts only).

---

## Phase 2: Foundational Domain, Persistence, Contracts, and Repositories

**Purpose**: Blocking prerequisites that must be complete before any registration story is implemented.

**Critical**: No user-story flow should be implemented until T004 through T014 are complete.

- [X] T004 Review `Patient.guardianId` optional behavior in `packages/api/src/modules/patients/domain/entities/Patient.ts` and `packages/api/src/modules/patients/domain/entities/Patient.test.ts` (Objetivo: ensure patients can exist without guardian; Dependências: T001; Aceite: entity/tests allow undefined `guardianId` and reject only empty string).
- [X] T005 Review `User` profile link invariants in `packages/api/src/modules/users/domain/entities/User.ts` and `packages/api/src/modules/users/domain/entities/User.test.ts` (Objetivo: allow Guardian without `patientId` and Patient without `guardianId`; Dependências: T001; Aceite: Guardian requires only `guardianId`, Patient requires only `patientId`, and non-Patient users cannot have `patientId`).
- [X] T006 Review Prisma optional guardian mapping in `packages/api/prisma/schema.prisma` and `packages/api/prisma/migrations/20260619123000_make_patient_guardian_nullable/migration.sql` (Objetivo: decide if a new migration is needed; Dependências: T004; Aceite: `Patient.guardianId String?` and `Guardian?` relation are confirmed, or a precise migration task is added before implementation).
- [X] T007 Create `RegistrationType` in `packages/api/src/modules/patients/domain/enums/RegistrationType.ts` (Objetivo: define `PetTutor`, `LegalGuardian`, and `Patient` once for the backend slice; Dependências: T004-T006; Aceite: use case and presentation can import the enum/type without string duplication).
- [X] T008 Create discriminated Zod request and params schemas in `packages/api/src/modules/patients/presentation/http/patient-registration-schemas.ts` (Objetivo: validate `registrationType` variants at the HTTP boundary; Dependências: T007; Aceite: `Patient` accepts only user+patient, `LegalGuardian` accepts user+guardian+patient, and `PetTutor` accepts only user+guardian).
- [X] T009 Create Fastify JSON schemas and response/error schemas in `packages/api/src/modules/patients/presentation/http/patient-registration-schemas.ts` (Objetivo: document and validate route body/params/response; Dependências: T008; Aceite: schemas cover `POST /organizations/:organizationId/patient-registrations` and `CreatePatientRegistrationResponse`).
- [X] T010 Add organization-scoped email lookup to `packages/api/src/modules/users/application/repositories/UserRepository.ts` and `packages/api/src/modules/users/infrastructure/prisma/PrismaUserRepository.ts` (Objetivo: enforce email uniqueness within the route organization without breaking login; Dependências: T005; Aceite: registration can check normalized email by `organizationId`, while existing auth usage still compiles).
- [X] T011 Review guardian document lookup in `packages/api/src/modules/guardians/application/repositories/GuardianRepository.ts` and `packages/api/src/modules/guardians/infrastructure/prisma/PrismaGuardianRepository.ts` (Objetivo: confirm organization-scoped uniqueness; Dependências: T006; Aceite: lookup uses both `organizationId` and normalized `Document.value`).
- [X] T012 Review patient document lookup in `packages/api/src/modules/patients/application/repositories/PatientRepository.ts` and `packages/api/src/modules/patients/infrastructure/prisma/PrismaPatientRepository.ts` (Objetivo: confirm organization-scoped uniqueness; Dependências: T006; Aceite: lookup uses both `organizationId` and normalized `Document.value`).
- [X] T013 Refactor `CreatePatientRegistrationUseCase` input/output contract in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.ts` (Objetivo: replace `isSelfResponsible` and caller-provided `user.profile` with server-derived `registrationType`; Dependências: T007-T012; Aceite: exported input matches the spec payload and output includes `userId`, nullable/optional `guardianId`, nullable/optional `patientId`, and `registrationType`).
- [X] T014 Remove out-of-scope assessment dependency from `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.ts` and `packages/api/src/modules/patients/infrastructure/create-patient-registration.factory.ts` (Objetivo: exclude underprivileged approval from this feature; Dependências: T013; Aceite: use case no longer imports or writes `PatientAssessment`/`PatientAssessmentRepository`).

**Checkpoint**: Foundation ready; stories can now be implemented against the new contract.

---

## Phase 3: User Story 1 - Paciente realiza cadastro próprio (Priority: P1) MVP

**Goal**: Register a user who is the patient, without creating a guardian and without requiring `Patient.guardianId`.

**Independent Test**: Submit a valid `registrationType: "Patient"` request for an existing organization and verify that only `User` and `Patient` records are created, with `user.patientId` set and `user.guardianId` empty.

- [X] T015 [US1] Implement `Patient` branch in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.ts` (Objetivo: create `User` + `Patient` only; Dependências: T013-T014; Aceite: `UserProfile.Patient`, `user.patientId`, no `Guardian`, and `patient.guardianId` undefined/null).
- [X] T016 [US1] Add `Patient` variant schema coverage in `packages/api/src/modules/patients/presentation/http/patient-registration-schemas.test.ts` (Objetivo: prove discriminated validation for self-patient payloads; Dependências: T008-T009; Aceite: valid Patient payload passes and extra `guardian` section fails).
- [X] T017 [US1] Add Patient use-case unit tests in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.test.ts` (Objetivo: verify user+patient creation and response shape; Dependências: T015; Aceite: tests assert no guardian creation and no raw password exposure).
- [X] T018 [US1] Verify Patient duplicate email/document conflicts in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.test.ts` (Objetivo: enforce same-organization uniqueness; Dependências: T010-T012,T015; Aceite: duplicate normalized email or patient document rejects without partial records).
- [X] T019 [US1] Verify password hashing for Patient flow in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.test.ts` (Objetivo: ensure use case calls `HashService.hash`; Dependências: T015; Aceite: stored `PasswordHash.value` comes from the fake hash service and plaintext is never stored).
- [X] T020 [US1] Verify transaction boundaries for Patient flow in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.test.ts` (Objetivo: ensure user+patient creation is atomic; Dependências: T015; Aceite: repository writes occur inside `UnitOfWork.execute`).

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Responsável legal cadastra paciente vinculado (Priority: P2)

**Goal**: Register a legal guardian user and a patient linked to that created guardian.

**Independent Test**: Submit a valid `registrationType: "LegalGuardian"` request and verify that `User`, `Guardian`, and `Patient` are created with `patient.guardianId` and `user.guardianId` pointing to the created guardian.

- [X] T021 [US2] Implement `LegalGuardian` branch in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.ts` (Objetivo: create `User` + `Guardian` + linked `Patient`; Dependências: T013-T014,T015; Aceite: `UserProfile.Guardian`, `user.guardianId`, no `user.patientId`, and `patient.guardianId` set).
- [X] T022 [US2] Add LegalGuardian variant schema coverage in `packages/api/src/modules/patients/presentation/http/patient-registration-schemas.test.ts` (Objetivo: prove guardian and patient sections are required; Dependências: T008-T009; Aceite: valid LegalGuardian payload passes and missing `guardian` or `patient` fails).
- [X] T023 [US2] Add LegalGuardian use-case unit tests in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.test.ts` (Objetivo: verify all links and response identifiers; Dependências: T021; Aceite: tests assert created guardian, linked patient, and response `registrationType: "LegalGuardian"`).
- [X] T024 [US2] Verify Guardian document conflict in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.test.ts` (Objetivo: enforce same-organization guardian document uniqueness; Dependências: T011,T021; Aceite: duplicate normalized guardian document rejects without user or patient creation).
- [X] T025 [US2] Verify transaction boundaries for LegalGuardian flow in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.test.ts` (Objetivo: ensure user+guardian+patient creation is atomic; Dependências: T021; Aceite: all writes execute within one `UnitOfWork.execute` call).

**Checkpoint**: User Story 2 works without changing User Story 1 behavior.

---

## Phase 5: User Story 3 - Tutor de pet realiza cadastro inicial (Priority: P3)

**Goal**: Register a pet tutor user as a guardian without creating a human patient or pet.

**Independent Test**: Submit a valid `registrationType: "PetTutor"` request and verify that only `User` and `Guardian` are created, with no `Patient`.

- [X] T026 [US3] Implement `PetTutor` branch in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.ts` (Objetivo: create `User` + `Guardian` only; Dependências: T013-T014,T021; Aceite: `UserProfile.Guardian`, `user.guardianId`, no `user.patientId`, no `Patient` creation, and no pet creation).
- [X] T027 [US3] Add PetTutor variant schema coverage in `packages/api/src/modules/patients/presentation/http/patient-registration-schemas.test.ts` (Objetivo: prove patient data is rejected for pet tutor registrations; Dependências: T008-T009; Aceite: valid PetTutor payload passes and extra `patient` section fails).
- [X] T028 [US3] Add PetTutor use-case unit tests in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.test.ts` (Objetivo: verify guardian-only registration and response shape; Dependências: T026; Aceite: tests assert no patient creation and response `registrationType: "PetTutor"`).
- [X] T029 [US3] Verify Guardian document conflict for PetTutor in `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.test.ts` (Objetivo: enforce same-organization guardian uniqueness for pet tutors; Dependências: T011,T026; Aceite: duplicate normalized guardian document rejects without user creation).

**Checkpoint**: All three registration stories are independently functional.

---

## Phase 6: Presentation, Route Registration, and Conditional HTTP Tests

**Purpose**: Expose the completed use case through the single allowed backend endpoint.

- [X] T030 Create Fastify handler in `packages/api/src/modules/patients/presentation/http/patient-registration-routes.ts` (Objetivo: add only `POST /organizations/:organizationId/patient-registrations`; Dependências: T015-T029; Aceite: route validates params/body with Zod `safeParse`, calls `CreatePatientRegistrationUseCase`, returns 201, and exposes no password/hash).
- [X] T031 Register patient registration route in `packages/api/src/shared/presentation/http/fastify/app.ts` (Objetivo: make endpoint available in the API app; Dependências: T030; Aceite: `buildApp()` registers the new route without adding auth middleware or changing existing route behavior).
- [X] T032 Update factory wiring in `packages/api/src/modules/patients/infrastructure/create-patient-registration.factory.ts` (Objetivo: compose Prisma repositories, `Argon2HashService` through `HashService`, and `PrismaTransactionManager`; Dependências: T010-T014,T030; Aceite: factory has no direct HTTP logic and no `PatientAssessmentRepository` dependency).
- [X] T033 Evaluate HTTP route test feasibility in `packages/api/src/modules/patients/presentation/http/patient-registration-routes.test.ts` (Objetivo: add isolated Fastify tests only if a clean pattern can be introduced without real database coupling; Dependências: T030-T032; Aceite: either route tests cover 201/400 for the three variants or implementation notes state no existing HTTP test pattern was available and schema/use-case tests cover behavior).

Implementation note: no existing isolated Fastify route-test pattern is present in `packages/api/src/**/*.test.ts`; route behavior is covered by discriminated Zod schema tests and use-case tests for all three variants.

---

## Phase 7: Polish and Validation

**Purpose**: Prove the implementation meets the spec and did not expand scope.

- [X] T034 [P] Remove stale registration-contract references from `packages/api/src/modules/patients/application/use-cases/CreatePatientRegistrationUseCase.ts` comments/types (Objetivo: avoid old `isSelfResponsible` terminology; Dependências: T015-T029; Aceite: no production code references `isSelfResponsible` for this feature).
- [X] T035 [P] Update or add presenter-free response mapping in `packages/api/src/modules/patients/presentation/http/patient-registration-routes.ts` (Objetivo: return exactly `CreatePatientRegistrationResponse`; Dependências: T030; Aceite: response contains `userId`, `registrationType`, and nullable/optional `guardianId`/`patientId` only).
- [X] T036 Run Prisma generation for `packages/api/prisma/schema.prisma` with `pnpm prisma:generate` (Objetivo: ensure generated client matches checked-in schema; Dependências: T006,T031; Aceite: command completes or reports no schema/client drift).
- [X] T037 Run API typecheck for `packages/api/tsconfig.json` with `pnpm typecheck:api` (Objetivo: verify TypeScript contracts after repository/use-case/route changes; Dependências: T030-T036; Aceite: command exits successfully).
- [X] T038 Run API lint for `packages/api/eslint.config.js` with `pnpm --filter @flora/api lint` (Objetivo: verify style and static lint rules; Dependências: T030-T036; Aceite: command exits successfully).
- [X] T039 Run API tests for `packages/api/vitest.config.ts` with `pnpm test:api` (Objetivo: verify domain, schema, use-case, and optional HTTP coverage; Dependências: T016-T029,T033; Aceite: command exits successfully).
- [X] T040 Run API build for `packages/api/tsconfig.build.json` with `pnpm build:api` (Objetivo: verify production build; Dependências: T037-T039; Aceite: command exits successfully).
- [X] T041 Confirm frontend remains untouched with `git diff -- packages/web` (Objetivo: enforce backend-only scope; Dependências: T030-T040; Aceite: no diff is shown for `packages/web`).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies.
- **Phase 2**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2 and should run after US1 if one developer is implementing sequentially.
- **Phase 5 (US3)**: Depends on Phase 2 and should run after US2 if one developer is implementing sequentially.
- **Phase 6**: Depends on all selected story flows.
- **Phase 7**: Depends on completed implementation and tests.

### User Story Dependencies

- **US1 Patient**: MVP and lowest dependency path after foundation.
- **US2 LegalGuardian**: Independent business flow after foundation, but shares use-case and schema contracts with US1.
- **US3 PetTutor**: Independent business flow after foundation, but shares guardian creation behavior with US2.

### Parallel Opportunities

- T002 and T003 can run in parallel with T001.
- T004, T005, and T006 can be reviewed in parallel after T001.
- T011 and T012 can run in parallel after T006.
- Schema tests T016, T022, and T027 can be prepared in parallel after T008-T009.
- Use-case tests for distinct variants can be prepared in parallel once T013-T014 are complete.
- T037, T038, and T041 are independent validation checks after implementation, though T039/T040 should follow code completion.

---

## Parallel Example: Foundation

```text
Task: "Review Patient.guardianId optional behavior in packages/api/src/modules/patients/domain/entities/Patient.ts and packages/api/src/modules/patients/domain/entities/Patient.test.ts"
Task: "Review User profile link invariants in packages/api/src/modules/users/domain/entities/User.ts and packages/api/src/modules/users/domain/entities/User.test.ts"
Task: "Review Prisma optional guardian mapping in packages/api/prisma/schema.prisma and packages/api/prisma/migrations/20260619123000_make_patient_guardian_nullable/migration.sql"
```

## Parallel Example: Schema Coverage

```text
Task: "Add Patient variant schema coverage in packages/api/src/modules/patients/presentation/http/patient-registration-schemas.test.ts"
Task: "Add LegalGuardian variant schema coverage in packages/api/src/modules/patients/presentation/http/patient-registration-schemas.test.ts"
Task: "Add PetTutor variant schema coverage in packages/api/src/modules/patients/presentation/http/patient-registration-schemas.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Implement Phase 3 for `registrationType: "Patient"`.
3. Validate that a patient can be created without a guardian.
4. Stop and confirm no frontend/auth/CRUD scope has been introduced.

### Incremental Delivery

1. Add `Patient` registration first.
2. Add `LegalGuardian` registration with linked patient.
3. Add `PetTutor` guardian-only registration.
4. Expose the endpoint and run validation gates.

### Scope Control

- Do not create frontend tasks.
- Do not add login/logout/session/refresh-token tasks.
- Do not add full CRUD tasks.
- Do not add pets or underprivileged approval tasks.
- Do not require `Guardian` for `registrationType: "Patient"`.

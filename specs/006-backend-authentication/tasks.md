# Tasks: Autenticação Backend

**Input**: Design documents from `/specs/006-backend-authentication/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-login.openapi.yaml, quickstart.md

**Tests**: Automated tests are included because this feature changes authentication, API contract behavior, validation, tenant context, and structured error handling. Existing project coverage is unit/schema oriented; no existing Fastify HTTP route-test pattern was found, so HTTP behavior is validated through route/schema coverage and quickstart manual scenarios unless implementation introduces a local stub-friendly route test pattern.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. No task includes frontend, cookies, IronSession, logout, refresh token, `/me`, RBAC, authorization middleware, registration, or password recovery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel after its dependencies are complete
- **[Story]**: User story label for story-scoped work
- Every task includes exact file paths

## Phase 1: Setup (Shared Infrastructure Review)

**Purpose**: Confirm existing user, repository, and hashing primitives before adding auth behavior.

- [X] T001 Review `User`, `UserProfile`, `Email`, and `PasswordHash` invariants for login inputs/outputs in `packages/api/src/modules/users/domain/entities/User.ts`, `packages/api/src/modules/users/domain/enums/UserProfile.ts`, `packages/api/src/modules/users/domain/value-objects/Email.ts`, and `packages/api/src/modules/users/domain/value-objects/PasswordHash.ts`
- [X] T002 Review `UserRepository.findByEmail` contract and `PrismaUserRepository.findByEmail` behavior for normalized email lookup in `packages/api/src/modules/users/application/repositories/UserRepository.ts` and `packages/api/src/modules/users/infrastructure/prisma/PrismaUserRepository.ts`
- [X] T003 Review `HashService.verify` and `Argon2HashService.verify` behavior for wrong-password and malformed-hash cases in `packages/api/src/shared/application/cryptography/HashService.ts` and `packages/api/src/shared/infrastructure/cryptography/Argon2HashService.ts`
- [X] T004 Review absence of `JwtService.sign` and confirm required new token port/adapter paths in `packages/api/src/shared/application/tokens/JwtService.ts` and `packages/api/src/shared/infrastructure/tokens/JoseJwtService.ts`
- [X] T005 Review existing Zod route validation and local 400 response pattern in `packages/api/src/modules/organizations/presentation/http/organization-routes.ts`, `packages/api/src/modules/organizations/presentation/http/organization-schemas.ts`, and `packages/api/src/modules/subscription-plans/presentation/http/subscription-plan-routes.ts`
- [X] T006 Review existing error-handler mappings for 400/401/500 integration point in `packages/api/src/shared/presentation/http/fastify/plugins/error-handler.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add shared auth primitives required before any user story can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Add token signing dependency for Jose in `packages/api/package.json`
- [X] T008 Add JWT environment variables and validation for signing secret/expiration in `packages/api/src/config/env.ts`
- [X] T009 Create `JwtPayload` and `JwtService` port with `sign` and `verify` methods in `packages/api/src/shared/application/tokens/JwtService.ts`
- [X] T010 Create `JoseJwtService` implementing `JwtService.sign` and `JwtService.verify` in `packages/api/src/shared/infrastructure/tokens/JoseJwtService.ts`
- [X] T011 [P] Add unit tests for `JoseJwtService.sign` and `JoseJwtService.verify` in `packages/api/src/shared/infrastructure/tokens/JoseJwtService.test.ts`
- [X] T012 Create generic invalid-credentials `AuthenticationError` in `packages/api/src/shared/application/errors/AuthenticationError.ts`
- [X] T013 Map `AuthenticationError` to HTTP 401 with generic message without changing existing 400/404/409/422/500 mappings in `packages/api/src/shared/presentation/http/fastify/plugins/error-handler.ts`

**Checkpoint**: Token signing and generic 401 error handling are available behind application ports.

---

## Phase 3: User Story 1 - Login de Usuário Existente (Priority: P1) MVP

**Goal**: Existing Master, Organization, Patient, and Guardian users can authenticate with e-mail/password and receive `accessToken`, public `user`, and derived `context`.

**Independent Test**: Create/use existing users for each profile, submit valid credentials to the login flow, and confirm token plus context view mapping.

### Tests for User Story 1

- [X] T014 [P] [US1] Create use-case tests for valid Master, Organization, Guardian, Patient, email normalization, `HashService.verify` call, and `JwtService.sign` payload in `packages/api/src/modules/auth/application/use-cases/AuthenticateUserUseCase.test.ts`
- [X] T015 [P] [US1] Create schema tests for valid login body, trim/lowercase email behavior, strict extra-field rejection, and login response shape in `packages/api/src/modules/auth/presentation/http/auth-schemas.test.ts`

### Implementation for User Story 1

- [X] T016 [P] [US1] Create login input/output types, `AuthView`, `AuthTokenPayload`, and `LoginResponse` in `packages/api/src/modules/auth/application/use-cases/AuthenticateUserUseCase.ts`
- [X] T017 [US1] Implement `AuthenticateUserUseCase` success flow using `Email.create`, `UserRepository.findByEmail`, `HashService.verify`, `JwtService.sign`, and profile-to-view mapping in `packages/api/src/modules/auth/application/use-cases/AuthenticateUserUseCase.ts`
- [X] T018 [P] [US1] Create auth presenter that returns only `accessToken`, public `user`, and `context` in `packages/api/src/modules/auth/presentation/http/auth-presenter.ts`
- [X] T019 [US1] Create auth use-case factory wiring `PrismaUserRepository`, `Argon2HashService`, and `JoseJwtService` in `packages/api/src/modules/auth/infrastructure/create-auth-use-cases.factory.ts`

**Checkpoint**: User Story 1 is independently testable at use-case level and produces the required login response without password material.

---

## Phase 4: User Story 2 - Rejeitar Credenciais Inválidas Sem Vazamento (Priority: P2)

**Goal**: Unknown e-mail, wrong password, and invalid payload are rejected without account enumeration or secret exposure.

**Independent Test**: Attempt login with unknown e-mail, wrong password, and invalid body; verify unknown e-mail and wrong password return the same generic 401 while invalid body returns structured 400.

### Tests for User Story 2

- [X] T020 [P] [US2] Add use-case tests for unknown e-mail, wrong password, no token signing after failure, and identical `AuthenticationError` behavior in `packages/api/src/modules/auth/application/use-cases/AuthenticateUserUseCase.test.ts`
- [X] T021 [P] [US2] Add schema tests for missing email, invalid email, blank password, non-object body, and extra fields in `packages/api/src/modules/auth/presentation/http/auth-schemas.test.ts`

### Implementation for User Story 2

- [X] T022 [US2] Update `AuthenticateUserUseCase` to throw generic `AuthenticationError` for missing user and failed `HashService.verify` without revealing which condition failed in `packages/api/src/modules/auth/application/use-cases/AuthenticateUserUseCase.ts`
- [X] T023 [US2] Create login Zod body schema, login JSON body schema, validation error schema, auth error schema, and internal error schema in `packages/api/src/modules/auth/presentation/http/auth-schemas.ts`
- [X] T024 [US2] Create `POST /auth/login` handler with Zod `safeParse`, local 400 validation response, and use-case execution in `packages/api/src/modules/auth/presentation/http/auth-routes.ts`

**Checkpoint**: User Story 2 rejects invalid credentials and invalid payloads with the expected structured responses and no account enumeration.

---

## Phase 5: User Story 3 - Entregar Contexto Consistente Para Sessão Futura (Priority: P3)

**Goal**: The API exposes the stable login contract and route registration needed by future session storage without adding session, cookie, or frontend behavior.

**Independent Test**: Validate the route response shape for Master, Organization, Patient, and Guardian against the OpenAPI contract and verify no `passwordHash`, cookies, IronSession, `/me`, refresh, logout, or RBAC behavior was added.

### Tests for User Story 3

- [X] T025 [P] [US3] Create auth presenter tests ensuring `passwordHash` is absent and nullable `guardianId`/`patientId` are represented consistently in `packages/api/src/modules/auth/presentation/http/auth-presenter.test.ts`
- [X] T026 [P] [US3] Add OpenAPI contract consistency checks against login schema enums and response fields in `packages/api/src/modules/auth/presentation/http/auth-schemas.test.ts`

### Implementation for User Story 3

- [X] T027 [US3] Register response schemas for 200, 400, 401, and 500 on `POST /auth/login` in `packages/api/src/modules/auth/presentation/http/auth-routes.ts`
- [X] T028 [US3] Register `authRoutes` in the Fastify app without changing existing route behavior in `packages/api/src/shared/presentation/http/fastify/app.ts`
- [X] T029 [US3] Verify `POST /auth/login` contract remains aligned with `specs/006-backend-authentication/contracts/auth-login.openapi.yaml`

**Checkpoint**: User Story 3 exposes the backend-only login route with stable response shape for future frontend session work.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate scope, quality gates, and implementation boundaries.

- [X] T030 Confirm no frontend, cookies, IronSession, logout, refresh token, `/me`, RBAC, authorization middleware, registration, or password recovery files/behavior were added by reviewing `packages/web`, `packages/api/src/modules/auth`, and `packages/api/src/shared/presentation/http/fastify/app.ts`
- [X] T031 Run Prisma generation if dependency/schema state requires it with `pnpm prisma:generate` for `packages/api/prisma/schema.prisma`
- [X] T032 Run API typecheck with `pnpm typecheck:api` for `packages/api/tsconfig.json`
- [X] T033 Run API lint with `pnpm --filter @flora/api lint` for `packages/api/package.json`
- [X] T034 Run API tests with `pnpm test:api` for `packages/api/vitest.config.ts`
- [X] T035 Run API build with `pnpm build:api` for `packages/api/tsconfig.build.json`
- [ ] T036 Run quickstart manual login scenarios for valid Master, valid Organization, valid Guardian, valid Patient, unknown e-mail, wrong password, and invalid payload from `specs/006-backend-authentication/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies; start here to confirm current architecture.
- **Phase 2 Foundational**: Depends on Phase 1; blocks all user-story implementation.
- **Phase 3 US1**: Depends on Phase 2; MVP scope.
- **Phase 4 US2**: Depends on Phase 3 use-case shape and `AuthenticationError` foundation.
- **Phase 5 US3**: Depends on Phases 3 and 4 because it exposes the final route contract.
- **Phase 6 Polish**: Depends on desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after foundational JWT/error primitives are ready.
- **US2 (P2)**: Builds on the same use case and error primitive; can add failure tests in parallel with schemas after US1 interfaces exist.
- **US3 (P3)**: Requires stable use-case output and schemas before route registration is meaningful.

### Within Each User Story

- Tests listed for the story should be written before implementation tasks in that story.
- Application types and use case come before presenter/route wiring.
- Zod schemas come before route handler response schema registration.
- App route registration comes after the auth route plugin exists.

## Parallel Opportunities

- T011 can run in parallel with T012 after T009 and T010 are defined.
- T014 and T015 can run in parallel after foundational tasks are complete.
- T018 can run in parallel with T019 after T016 defines the output shape.
- T020 and T021 can run in parallel after US1 test scaffolding exists.
- T025 and T026 can run in parallel after auth presenter/schemas exist.
- Final validation commands T032, T033, T034, and T035 should run after implementation is complete; run sequentially when diagnosing failures.

## Parallel Example: User Story 1

```bash
Task: "T014 [P] [US1] Create use-case tests for valid Master, Organization, Guardian, Patient, email normalization, HashService.verify call, and JwtService.sign payload in packages/api/src/modules/auth/application/use-cases/AuthenticateUserUseCase.test.ts"
Task: "T015 [P] [US1] Create schema tests for valid login body, trim/lowercase email behavior, strict extra-field rejection, and login response shape in packages/api/src/modules/auth/presentation/http/auth-schemas.test.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T020 [P] [US2] Add use-case tests for unknown e-mail, wrong password, no token signing after failure, and identical AuthenticationError behavior in packages/api/src/modules/auth/application/use-cases/AuthenticateUserUseCase.test.ts"
Task: "T021 [P] [US2] Add schema tests for missing email, invalid email, blank password, non-object body, and extra fields in packages/api/src/modules/auth/presentation/http/auth-schemas.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T025 [P] [US3] Create auth presenter tests ensuring passwordHash is absent and nullable guardianId/patientId are represented consistently in packages/api/src/modules/auth/presentation/http/auth-presenter.test.ts"
Task: "T026 [P] [US3] Add OpenAPI contract consistency checks against login schema enums and response fields in packages/api/src/modules/auth/presentation/http/auth-schemas.test.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup review.
2. Complete Phase 2 foundational JWT/error primitives.
3. Complete Phase 3 User Story 1.
4. Stop and validate `AuthenticateUserUseCase` tests for valid login and response shape.

### Incremental Delivery

1. Deliver US1 valid login behavior.
2. Add US2 invalid credentials and invalid payload behavior.
3. Add US3 route registration and contract consistency.
4. Run Phase 6 validation and quickstart scenarios.

### Scope Guardrails

- Do not add or modify `packages/web`.
- Do not create cookies, IronSession integration, logout, refresh token, `/me`, RBAC, authorization middleware, registration, or password recovery.
- Do not import Argon2 or Jose directly from domain or use-case code.
- Do not return `passwordHash` or any password/token secret in responses.

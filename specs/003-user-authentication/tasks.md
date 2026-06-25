# Tasks: User Authentication

**Input**: Design documents from `/specs/003-user-authentication/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated tests are required because this feature changes authentication, persistence, validation, tenant scope, shared contracts, API routes, and browser session handling.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `packages/web/app`, `packages/web/components`, `packages/web/lib`
- **API**: `packages/api/src`, `packages/api/prisma`
- **Shared contracts**: `packages/shared/src`
- **Root config**: `package.json`, `pnpm-lock.yaml`, workspace package metadata

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add required dependencies and environment configuration for auth implementation.

- [X] T001 Add `argon2` and `jose` API dependencies in `packages/api/package.json` and `pnpm-lock.yaml`
- [X] T002 Add `iron-session` web dependency in `packages/web/package.json` and `pnpm-lock.yaml`
- [X] T003 [P] Add JWT auth variables to `packages/api/.env.example`
- [X] T004 [P] Create web session environment example in `packages/web/.env.example`
- [X] T005 [P] Extend API environment parsing for JWT secrets and lifetimes in `packages/api/src/infrastructure/config/env.ts`
- [X] T006 [P] Create typed IronSession configuration shell in `packages/web/lib/session.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core contracts, persistence, domain primitives, security adapters, and repository boundaries needed by every auth story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 [P] Define auth DTOs and `UserType` in `packages/shared/src/authentication.ts`
- [X] T008 Export auth contracts from `packages/shared/src/index.ts`
- [X] T009 Add `UserType`, `UserSessionStatus`, `RefreshTokenStatus`, `AuthenticationAuditEventType`, `User`, `UserSession`, `RefreshToken`, `AuthenticationAuditEvent`, and organization active-status support in `packages/api/prisma/schema.prisma`
- [X] T010 Create auth schema migration in `packages/api/prisma/migrations/20260617000000_user_authentication/migration.sql`
- [X] T011 Add Prisma seed command metadata in `packages/api/package.json`
- [X] T012 Create auth seed scaffold for three test users in `packages/api/prisma/seed.ts`
- [X] T013 [P] Implement authentication user domain model and user type invariants in `packages/api/src/domain/authentication/user.ts`
- [X] T014 [P] Implement password policy and password hash value object in `packages/api/src/domain/authentication/user-password.ts`
- [X] T015 [P] Implement user session lifecycle domain model in `packages/api/src/domain/authentication/user-session.ts`
- [X] T016 [P] Implement refresh token lifecycle domain model in `packages/api/src/domain/authentication/refresh-token.ts`
- [X] T017 [P] Implement authentication audit event domain model in `packages/api/src/domain/authentication/authentication-audit-event.ts`
- [X] T018 Define authentication repository contract in `packages/api/src/application/authentication/authentication-repository.ts`
- [X] T019 [P] Implement argon2 password hasher adapter in `packages/api/src/infrastructure/security/argon2-password-hasher.ts`
- [X] T020 [P] Implement refresh token hashing adapter in `packages/api/src/infrastructure/security/refresh-token-hasher.ts`
- [X] T021 Implement JWT access and refresh token service in `packages/api/src/infrastructure/security/jwt-token-service.ts`
- [X] T022 Implement Prisma authentication repository adapter in `packages/api/src/infrastructure/database/prisma-authentication-repository.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in priority order or in parallel by separate implementers.

---

## Phase 3: User Story 1 - Sign In With Existing Account (Priority: P1) MVP

**Goal**: Existing active users can sign in with email and password, receive an authenticated session, and land in the correct application area for their user type.

**Independent Test**: Seed active users for `MASTER`, `ORGANIZATION`, and `STANDARD`, submit valid and invalid credentials through API and web login, and confirm that valid credentials create sessions while invalid credentials return a generic failure.

### Tests for User Story 1

- [X] T023 [P] [US1] Add password policy and user invariant tests in `packages/api/src/domain/authentication/user-password.test.ts`
- [X] T024 [P] [US1] Add login use case tests for success, inactive user, inactive organization, wrong password, and generic failure in `packages/api/src/application/authentication/login-use-case.test.ts`
- [X] T025 [P] [US1] Add `POST /auth/login` route contract tests in `packages/api/src/communication/http/routes/authentication-routes.login.test.ts`
- [X] T026 [P] [US1] Add login schema and form behavior tests in `packages/web/app/(auth)/entrar/login-form.test.tsx`
- [X] T027 [P] [US1] Add web `POST /api/auth/login` route tests for storing only server-side session tokens in `packages/web/app/api/auth/login/route.test.ts`

### Implementation for User Story 1

- [X] T028 [US1] Implement login credential parsing and normalization in `packages/api/src/domain/authentication/login-credentials.ts`
- [X] T029 [US1] Implement login use case with argon2 verification, session creation, token pair issuance, and audit events in `packages/api/src/application/authentication/login-use-case.ts`
- [X] T030 [US1] Implement `POST /auth/login` handler in `packages/api/src/communication/http/routes/authentication-routes.ts`
- [X] T031 [US1] Register authentication routes in `packages/api/src/communication/http/build-server.ts`
- [X] T032 [US1] Complete `MASTER`, `ORGANIZATION`, and `STANDARD` seed users with `Acesso@123` and demo organization reuse/creation in `packages/api/prisma/seed.ts`
- [X] T033 [US1] Implement login form schema with email and password rules in `packages/web/app/(auth)/entrar/schemas/login-schema.ts`
- [X] T034 [US1] Implement client sign-in request helper in `packages/web/app/(auth)/entrar/requests/sign-in.ts`
- [X] T035 [US1] Implement same-origin IronSession login route that calls the API and stores token state in `packages/web/app/api/auth/login/route.ts`
- [X] T036 [US1] Replace placeholder login buttons with a real submit flow and generic auth errors in `packages/web/app/(auth)/entrar/login-form.tsx`
- [X] T037 [US1] Implement user-type landing route mapping in `packages/web/lib/auth-redirects.ts`
- [X] T038 [US1] Add an option to skip temporary Master headers for auth-specific requests while preserving existing Master requests in `packages/web/lib/http.ts`

**Checkpoint**: User Story 1 should be fully functional and testable independently as the MVP.

---

## Phase 4: User Story 2 - Continue Session Safely (Priority: P2)

**Goal**: Authenticated users remain signed in across reloads and normal navigation while valid sessions can be refreshed and invalid sessions are cleared.

**Independent Test**: After signing in, reload the browser, call current-session lookup, refresh an expired access state with a valid refresh token, and confirm expired, revoked, inactive, or reused refresh state signs the user out.

### Tests for User Story 2

- [X] T039 [P] [US2] Add current-session use case tests for valid, expired, revoked, inactive user, and tenant-scope mismatch in `packages/api/src/application/authentication/get-current-session-use-case.test.ts`
- [X] T040 [P] [US2] Add refresh use case tests for rotation, expiry, revocation, inactive user, inactive organization, and reuse invalidation in `packages/api/src/application/authentication/refresh-session-use-case.test.ts`
- [X] T041 [P] [US2] Add `GET /auth/me` and `POST /auth/refresh` route tests in `packages/api/src/communication/http/routes/authentication-routes.session.test.ts`
- [X] T042 [P] [US2] Add web `GET /api/auth/session` route tests for valid session, refresh success, and refresh failure clearing state in `packages/web/app/api/auth/session/route.test.ts`

### Implementation for User Story 2

- [X] T043 [US2] Implement current session use case in `packages/api/src/application/authentication/get-current-session-use-case.ts`
- [X] T044 [US2] Implement refresh session use case with refresh token rotation and reuse detection in `packages/api/src/application/authentication/refresh-session-use-case.ts`
- [X] T045 [US2] Add `GET /auth/me` and `POST /auth/refresh` handlers in `packages/api/src/communication/http/routes/authentication-routes.ts`
- [X] T046 [US2] Extend JWT token verification and claim mapping for access and refresh flows in `packages/api/src/infrastructure/security/jwt-token-service.ts`
- [X] T047 [US2] Extend Prisma repository methods for session lookup, refresh rotation, reuse marking, and last-used updates in `packages/api/src/infrastructure/database/prisma-authentication-repository.ts`
- [X] T048 [US2] Extend IronSession helpers for token expiry checks, refresh updates, and safe client summaries in `packages/web/lib/session.ts`
- [X] T049 [US2] Implement same-origin current-session route with automatic refresh behavior in `packages/web/app/api/auth/session/route.ts`
- [X] T050 [US2] Add current-session request helper for client components in `packages/web/app/(auth)/entrar/requests/get-current-session.ts`

**Checkpoint**: User Stories 1 and 2 should both work independently: users can sign in and remain signed in while session state is valid.

---

## Phase 5: User Story 3 - Sign Out And Invalidate Current Session (Priority: P3)

**Goal**: Authenticated users can sign out of the current browser session, invalidating the server-side session and clearing browser authentication state.

**Independent Test**: Sign in, call sign-out from the browser, confirm the session is revoked, confirm the IronSession cookie is cleared, and confirm the same credentials cannot continue without signing in again.

### Tests for User Story 3

- [X] T051 [P] [US3] Add logout use case tests for active, already revoked, expired, and missing sessions in `packages/api/src/application/authentication/logout-use-case.test.ts`
- [X] T052 [P] [US3] Add `POST /auth/logout` route tests in `packages/api/src/communication/http/routes/authentication-routes.logout.test.ts`
- [X] T053 [P] [US3] Add web `POST /api/auth/logout` route tests for API invalidation and IronSession clearing in `packages/web/app/api/auth/logout/route.test.ts`
- [X] T054 [P] [US3] Add sign-out button interaction tests in `packages/web/components/layout/sign-out-button.test.tsx`

### Implementation for User Story 3

- [X] T055 [US3] Implement logout use case with current-session revocation and audit event recording in `packages/api/src/application/authentication/logout-use-case.ts`
- [X] T056 [US3] Add `POST /auth/logout` handler in `packages/api/src/communication/http/routes/authentication-routes.ts`
- [X] T057 [US3] Extend Prisma repository methods for current-session revocation and refresh-token revocation in `packages/api/src/infrastructure/database/prisma-authentication-repository.ts`
- [X] T058 [US3] Implement same-origin logout route that calls the API and clears IronSession state in `packages/web/app/api/auth/logout/route.ts`
- [X] T059 [US3] Create reusable sign-out button component in `packages/web/components/layout/sign-out-button.tsx`
- [X] T060 [US3] Wire sign-out control into the shared application shell in `packages/web/components/layout/app-shell.tsx`

**Checkpoint**: User Stories 1, 2, and 3 should all work independently: sign in, continue while valid, and sign out current session.

---

## Phase 6: User Story 4 - Prepare Protected Access Enforcement (Priority: P4)

**Goal**: Provide a reusable authorization marker for future protected endpoints without applying it to any existing production endpoint in this feature.

**Independent Test**: Attach the marker only to an isolated test route, verify missing/invalid/expired/revoked sessions are rejected and valid sessions expose auth context, then verify existing production endpoints keep their current access behavior.

### Tests for User Story 4

- [X] T061 [P] [US4] Add authorization marker tests using an isolated protected test route in `packages/api/src/communication/http/decorators/authorization.test.ts`
- [X] T062 [P] [US4] Add authentication plugin context tests for bearer parsing and request auth context in `packages/api/src/communication/http/plugins/authentication.test.ts`
- [X] T063 [P] [US4] Add regression tests proving existing organization and subscription-plan endpoints are not protected by the new marker in `packages/api/src/communication/http/routes/authentication-regression.test.ts`

### Implementation for User Story 4

- [X] T064 [US4] Implement authenticated request context plugin without auto-protecting routes in `packages/api/src/communication/http/plugins/authentication.ts`
- [X] T065 [US4] Implement `Authorization` marker/preHandler with optional `allowedUserTypes` in `packages/api/src/communication/http/decorators/authorization.ts`
- [X] T066 [US4] Register the authentication context plugin in `packages/api/src/communication/http/build-server.ts`
- [X] T067 [US4] Export reusable auth context types for future route modules in `packages/api/src/communication/http/plugins/authentication.ts`
- [X] T068 [US4] Document that no existing endpoint should apply the marker in `packages/api/src/communication/http/decorators/README.md`

**Checkpoint**: All user stories should now be independently functional and the authorization marker should be ready for future endpoint policy work.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, documentation alignment, and repository validation after story delivery.

- [X] T069 [P] Add secret-redaction and no-token-logging coverage notes to auth route tests in `packages/api/src/communication/http/routes/authentication-routes.login.test.ts`
- [X] T070 [P] Update implementation notes in `specs/003-user-authentication/quickstart.md`
- [X] T071 [P] Update API environment documentation for auth variables in `packages/api/.env.example`
- [X] T072 [P] Update web environment documentation for IronSession variables in `packages/web/.env.example`
- [X] T073 Run `pnpm prisma:generate` and confirm generated Prisma client compatibility using `packages/api/prisma/schema.prisma`
- [X] T074 Run `pnpm test:api` and fix failures in `packages/api/src`
- [X] T075 Run `pnpm test:web` and fix failures in `packages/web`
- [X] T076 Run `pnpm typecheck` and fix package boundary/type failures in root `package.json`
- [X] T077 Run `pnpm build` and fix build failures in root `package.json`
- [X] T078 Execute the quickstart validation scenarios and record results in `specs/003-user-authentication/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational completion.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational and is the MVP. No dependency on other stories.
- **User Story 2 (P2)**: Starts after Foundational; integrates naturally after US1 because it needs an authenticated session, but API refresh/current-session behavior can be built independently with seeded sessions.
- **User Story 3 (P3)**: Starts after Foundational; integrates naturally after US1 because it invalidates a signed-in session, but the logout use case can be tested independently with seeded sessions.
- **User Story 4 (P4)**: Starts after Foundational; uses token/session primitives but must not apply the marker to production endpoints.

### Within Each User Story

- Tests required by the constitution must be written first and should fail before implementation.
- Shared contracts and persistence model before application services.
- Domain/application services before API route handlers.
- API behavior before web integration where web depends on API behavior.
- Story checkpoint validation before moving to the next priority.

### Parallel Opportunities

- Setup tasks T003, T004, T005, and T006 can run in parallel.
- Foundational domain tasks T013, T014, T015, T016, and T017 can run in parallel after Prisma model shape is understood.
- Security adapters T019 and T020 can run in parallel; T021 depends on token decisions.
- Tests within each user story marked [P] can run in parallel before implementation.
- US2, US3, and US4 can proceed in parallel after Foundational when separate implementers are available.

---

## Parallel Example: User Story 1

```bash
Task: "T023 Add password policy and user invariant tests in packages/api/src/domain/authentication/user-password.test.ts"
Task: "T024 Add login use case tests for success, inactive user, inactive organization, wrong password, and generic failure in packages/api/src/application/authentication/login-use-case.test.ts"
Task: "T025 Add POST /auth/login route contract tests in packages/api/src/communication/http/routes/authentication-routes.login.test.ts"
Task: "T026 Add login schema and form behavior tests in packages/web/app/(auth)/entrar/login-form.test.tsx"
Task: "T027 Add web POST /api/auth/login route tests for storing only server-side session tokens in packages/web/app/api/auth/login/route.test.ts"
```

---

## Parallel Example: User Story 2

```bash
Task: "T039 Add current-session use case tests in packages/api/src/application/authentication/get-current-session-use-case.test.ts"
Task: "T040 Add refresh use case tests in packages/api/src/application/authentication/refresh-session-use-case.test.ts"
Task: "T041 Add GET /auth/me and POST /auth/refresh route tests in packages/api/src/communication/http/routes/authentication-routes.session.test.ts"
Task: "T042 Add web GET /api/auth/session route tests in packages/web/app/api/auth/session/route.test.ts"
```

---

## Parallel Example: User Story 3

```bash
Task: "T051 Add logout use case tests in packages/api/src/application/authentication/logout-use-case.test.ts"
Task: "T052 Add POST /auth/logout route tests in packages/api/src/communication/http/routes/authentication-routes.logout.test.ts"
Task: "T053 Add web POST /api/auth/logout route tests in packages/web/app/api/auth/logout/route.test.ts"
Task: "T054 Add sign-out button interaction tests in packages/web/components/layout/sign-out-button.test.tsx"
```

---

## Parallel Example: User Story 4

```bash
Task: "T061 Add authorization marker tests using packages/api/src/communication/http/decorators/authorization.test.ts"
Task: "T062 Add authentication plugin context tests in packages/api/src/communication/http/plugins/authentication.test.ts"
Task: "T063 Add regression tests in packages/api/src/communication/http/routes/authentication-regression.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate sign-in independently with all three seeded user types.
5. Demo the login flow before adding refresh, logout, or authorization-marker behavior.

### Incremental Delivery

1. Complete Setup + Foundational -> auth contracts, schema, security adapters, and repositories ready.
2. Add User Story 1 -> login works and can be demonstrated as the MVP.
3. Add User Story 2 -> sessions survive reloads and refresh safely.
4. Add User Story 3 -> current session can be invalidated and browser state cleared.
5. Add User Story 4 -> reusable authorization marker is available without changing existing endpoint access policy.

### Parallel Team Strategy

With multiple implementers:

1. Complete Setup + Foundational together.
2. After Foundational:
   - Developer A: User Story 1 login flow.
   - Developer B: User Story 2 refresh/current-session flow using seeded sessions.
   - Developer C: User Story 3 logout flow and User Story 4 authorization marker tests.
3. Integrate through shared auth repository, token service, and web session helper.

---

## Notes

- [P] tasks use different files or can be worked in parallel without depending on incomplete task output.
- [US1], [US2], [US3], and [US4] map directly to the prioritized user stories in `spec.md`.
- Existing production endpoints must not apply the new `Authorization` marker in this feature.
- Cadastro remains out of scope; do not add public registration tasks to this feature.
- Raw access tokens, raw refresh tokens, password hashes, and plaintext passwords must not be returned to client components or written to logs.

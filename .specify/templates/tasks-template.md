---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Include automated tests when a story changes API contracts, tenant isolation, validation, persistence, auth, payments, documents, inventory, reports, or other critical behavior. Otherwise include explicit manual verification tasks tied to the independent test in spec.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `packages/web/app`, `packages/web/components`, `packages/web/lib`
- **API**: `packages/api/src`, `packages/api/prisma`
- **Shared contracts**: `packages/shared` once the shared package exists
- **Root config**: `package.json`, `pnpm-workspace.yaml`, shared TypeScript/tooling config
- Paths shown below are examples - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Define or update shared contracts/DTOs/enums in specs contracts or packages/shared
- [ ] T005 Setup database schema and Prisma migrations for tenant-owned entities
- [ ] T006 [P] Implement authentication/authorization and organization scoping framework
- [ ] T007 [P] Setup API routing, middleware, and structured error handling
- [ ] T008 Create base domain entities/use cases that all stories depend on
- [ ] T009 Configure environment, logging, health, and readiness concerns

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (include when required by constitution) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Contract/API test for [endpoint] in packages/api/src/[path]/[name].test.ts
- [ ] T011 [P] [US1] Integration or component test for [user journey] in packages/web/[path]/[name].test.tsx
- [ ] T012 [US1] Verify tenant isolation for [organization-owned behavior]

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create/update [Entity1] model or Prisma schema in packages/api/prisma/schema.prisma
- [ ] T014 [P] [US1] Create/update shared contract/type in packages/shared or specs contracts
- [ ] T015 [US1] Implement use case/service in packages/api/src/application/[path]/[service].ts
- [ ] T016 [US1] Implement route/controller in packages/api/src/communication/[path]/[file].ts
- [ ] T017 [US1] Implement web route/feature code in packages/web/app/[route]/[feature]
- [ ] T018 [US1] Add validation, structured errors, and logging for user story 1 operations

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (include when required by constitution) ⚠️

- [ ] T019 [P] [US2] Contract/API test for [endpoint] in packages/api/src/[path]/[name].test.ts
- [ ] T020 [P] [US2] Integration or component test for [user journey] in packages/web/[path]/[name].test.tsx

### Implementation for User Story 2

- [ ] T021 [P] [US2] Create/update [Entity] model or contract in the owning package
- [ ] T022 [US2] Implement [Service] in packages/api/src/application/[path]/[service].ts
- [ ] T023 [US2] Implement [endpoint/feature] in packages/api/src/communication/[path]/[file].ts
- [ ] T024 [US2] Integrate web feature in packages/web/app/[route]/[feature] if needed

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (include when required by constitution) ⚠️

- [ ] T025 [P] [US3] Contract/API test for [endpoint] in packages/api/src/[path]/[name].test.ts
- [ ] T026 [P] [US3] Integration or component test for [user journey] in packages/web/[path]/[name].test.tsx

### Implementation for User Story 3

- [ ] T027 [P] [US3] Create/update [Entity] model or contract in the owning package
- [ ] T028 [US3] Implement [Service] in packages/api/src/application/[path]/[service].ts
- [ ] T029 [US3] Implement [endpoint/feature] in packages/api/src/communication/[path]/[file].ts
- [ ] T030 [US3] Implement web route/feature code in packages/web/app/[route]/[feature]

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Clean-code pass for naming, layering, duplication, and package boundaries
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional tests or manual verification notes required by constitution
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation
- [ ] TXXX Run `pnpm typecheck`
- [ ] TXXX Run `pnpm build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests required by constitution MUST be written and FAIL before implementation
- Contracts and tenant model before services
- Domain/application services before endpoints
- API endpoint behavior before web integration when the web depends on new API behavior
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (when required):
Task: "Contract/API test for [endpoint] in packages/api/src/[path]/[name].test.ts"
Task: "Integration/component test for [journey] in packages/web/[path]/[name].test.tsx"

# Launch independent model/contract tasks together:
Task: "Update Prisma model in packages/api/prisma/schema.prisma"
Task: "Update shared contract in packages/shared or specs contracts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

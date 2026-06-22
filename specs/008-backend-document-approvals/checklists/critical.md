# Critical Pre-Implementation Checklist: Backend de Documentos Obrigatórios e Aprovações

**Purpose**: Validate whether spec, plan, and tasks are ready for implementation without scope drift or architectural violations.
**Created**: 2026-06-22
**Feature**: [spec.md](../spec.md)

**Note**: This checklist was generated and executed before implementation. Items marked `[x]` passed. Items left unchecked require adjustment before implementation.

## Scope Boundaries

- [x] CHK001 Are the requirements explicitly limited to backend-only behavior? [Completeness, Spec §Input, Spec §Constitution Alignment, Plan §Summary]
- [x] CHK002 Are upload, cloud, storage, presigned URL, download, preview, OCR, and real file-validation concerns explicitly excluded from scope? [Completeness, Spec §FR-033, Spec §SC-010, Plan §Constraints]
- [x] CHK003 Is frontend work explicitly excluded in spec, plan, and tasks? [Consistency, Spec §FR-033, Spec §SC-011, Plan §Monorepo Boundaries, Tasks §Scope Guardrails]
- [x] CHK004 Are authentication, RBAC, authorization middleware, permission validation, and auth changes explicitly out of scope? [Consistency, Spec §FR-031, Plan §Constraints, Tasks §Scope Guardrails]

## Domain Requirements

- [x] CHK005 Does the spec clearly define `OrganizationRequiredDocument` as organization document configuration rather than an uploaded file? [Clarity, Spec §FR-010, Spec §Key Entities]
- [x] CHK006 Are uniqueness requirements for `OrganizationRequiredDocument.name` scoped to one organization and explicitly allowed across different organizations? [Clarity, Spec §FR-003, Spec §FR-004, Spec §US1]
- [x] CHK007 Does the spec clearly define `OrganizationDocumentPatientApproval` as the workflow state for one patient and one required document? [Clarity, Spec §Key Entities, Spec §DM-001]
- [x] CHK008 Is the maximum-one-approval rule for `documentId + patientId` explicitly specified and testable? [Measurability, Spec §FR-015, Spec §US2]
- [x] CHK009 Are the allowed status values `PENDING`, `REJECTED`, and `APPROVED` explicitly defined in requirements and domain guidance? [Completeness, Spec §FR-017, Spec §DM-004]
- [x] CHK010 Is the rejection reason requirement for `REJECTED` approvals explicit, non-empty, and objectively verifiable? [Clarity, Spec §FR-019, Spec §FR-020]
- [x] CHK011 Is the requirement for approve to clear `rejectedReason` explicitly defined? [Completeness, Spec §FR-018, Spec §US3]
- [x] CHK012 Is reset/resubmission behavior explicitly defined as returning to `PENDING` and clearing `rejectedReason`? [Completeness, Spec §FR-021, Spec §FR-022, Spec §Assumptions]

## Audit Requirements

- [x] CHK013 Are audit-log requirements for approve, reject, and reset explicitly defined? [Completeness, Spec §FR-023, Spec §FR-024, Spec §FR-025]
- [x] CHK014 Are logs explicitly required to be append-only, with no update/delete behavior? [Clarity, Spec §FR-027, Spec §Edge Cases]
- [x] CHK015 Is `organizationUserId` explicitly required as the audit actor for approve, reject, and reset logs? [Completeness, Spec §FR-026, Spec §FR-029, Spec §Expected Payloads]

## Tenant Isolation

- [x] CHK016 Is the requirement that `documentId` belongs to the route organization explicitly specified? [Coverage, Spec §FR-011, Spec §US2]
- [x] CHK017 Is the requirement that `patientId` belongs to the route organization explicitly specified? [Coverage, Spec §FR-012, Spec §US2]

## Architecture Boundaries

- [x] CHK018 Are domain-layer dependency boundaries specified so domain does not depend on Prisma, Fastify, Zod, HTTP, or file-storage services? [Consistency, Spec §FR-034, Spec §Clean-Code Boundaries, Plan §Clean Layering]
- [x] CHK019 Are application-layer dependency boundaries specified so use cases depend on repository interfaces rather than Prisma directly? [Consistency, Spec §Application, Plan §Summary, Plan §Clean Layering]
- [x] CHK020 Is infrastructure ownership of Prisma repositories and mappers explicitly planned? [Completeness, Plan §Project Structure, Plan §Target Architecture, Tasks T019-T020 and T038-T041]
- [x] CHK021 Is presentation ownership of Fastify routes/handlers and Zod schemas explicitly planned? [Completeness, Plan §Target Architecture, Tasks T025-T030, T045-T048, T061-T064]
- [x] CHK022 Are Prisma migrations explicitly planned for required documents, approvals, logs, and approval status enum? [Completeness, Plan §Migration Plan, Tasks T005-T007]

## Task Readiness

- [x] CHK023 Are tasks consistently small and non-overlapping across domain, application, infrastructure, presentation, and tests? [Resolved, Tasks T012-T016 and T065-T070]
  - Recheck: T012-T015 now split create, list, update, and delete use-case tests into separate application tasks; T016 keeps presentation schema tests separate; T065-T070 now only run validation gates and do not redefine new tests.
- [x] CHK024 Is rollback planning explicit and scoped to routes, source module removal, Prisma migration/schema reversal, and no cloud/frontend cleanup? [Completeness, Plan §Rollback Strategy]
- [x] CHK025 Are minimum tests planned for uniqueness, delete-blocked, pending creation, duplicate approval, approve, reject, reset, logs, optional HTTP tests, typecheck, lint, and test execution? [Coverage, Tasks T012, T015, T032, T049-T054, T066-T068]

## Classification

**Result**: Pode implementar agora.

**Reason**: Spec, plan, and adjusted tasks are aligned for backend-only implementation. Test ownership is split by layer and final tasks only run validation commands.

## Recommended Task Adjustments

- No pending task adjustments.

# Feature Specification: Master Organization Form

**Feature Branch**: `feat/organization`

**Created**: 2026-06-16

**Status**: Draft

**Input**: Master users need the first housekeeping screens for managing
organizations. This module must follow the existing backoffice visual style,
share organization contracts across packages, list registered organizations in a
table, and create organizations through a multi-step flow that captures company
data, address data, and selected subscription plan. The first implementation
slice must integrate the front-end with the back-end endpoints even before the
final authentication module exists.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - List Organizations as Master (Priority: P1)

As a Master user of the platform, I want to access a dedicated housekeeping
screen that lists registered organizations so that I can inspect tenants and
their selected plans from a platform-level area without entering an organization
tenant workspace.

**Why this priority**: This is the first Master access screen and the entry
point for controlling organizations above tenant boundaries.

**Independent Test**: A Master user can open the Master organizations screen,
see the same backoffice-style layout used by operational areas, and inspect a
table of organizations with relevant company and plan information.

**Acceptance Scenarios**:

1. **Given** an authenticated Master user, **When** they open the Master
   organizations screen, **Then** they see a housekeeping area with
   backoffice-style navigation and a table focused on organizations.
2. **Given** a user who is not a Master, **When** they attempt to access the
   Master organizations screen, **Then** access is denied or they are redirected
   without seeing Master organization controls.
3. **Given** organizations exist, **When** the Master opens the list, **Then**
   the table shows relevant organization information including trade name, CNPJ,
   city and state, selected plan, and creation date.
4. **Given** no organizations exist, **When** the Master opens the list, **Then**
   the screen shows an empty state with a clear action to register an
   organization.

---

### User Story 2 - Register Organization by Steps (Priority: P2)

As a Master user, I want the organization form split into clear steps so that I
can fill company and address data with field-level validation before choosing a
plan and submitting the registration.

**Why this priority**: Organization registration contains many required fields;
splitting the flow reduces input errors and follows the existing patient
registration experience.

**Independent Test**: A Master user can complete each step with valid data,
cannot advance when required information is invalid, and can return to earlier
steps without losing entered values.

**Acceptance Scenarios**:

1. **Given** a Master user starts a new registration from the list screen,
   **When** the form loads, **Then** the flow shows distinct steps for company
   data, address, plan selection, and final review.
2. **Given** the Master is on the company data step, **When** required company
   fields are missing or invalid, **Then** the flow prevents advancing and shows
   which fields need correction.
3. **Given** the Master is on the address step, **When** required address fields
   are missing or invalid, **Then** the flow prevents advancing and preserves
   all valid information already entered.
4. **Given** the Master moves forward and backward between steps, **When** they
   return to a previous step, **Then** the previously entered values are still
   present during the active registration session.

---

### User Story 3 - Choose Plan and Confirm Registration (Priority: P3)

As a Master user, I want to choose the organization's subscription plan and
review all registration data before submitting so that the organization starts
with the correct commercial limits and accurate company information.

**Why this priority**: The selected plan determines organization limits, and a
review step reduces errors before tenant creation.

**Independent Test**: A Master user can select one available plan, review
company data, address data, and plan details, then submit the registration and
see a confirmation state.

**Acceptance Scenarios**:

1. **Given** available subscription plans exist, **When** the Master reaches plan
   selection, **Then** the screen displays each plan with name, price, operator
   limit, and active user limit.
2. **Given** no plan is selected, **When** the Master attempts to continue,
   **Then** the flow blocks progression until one available plan is selected.
3. **Given** the Master reaches final review, **When** they inspect the summary,
   **Then** it includes company data, address data, and selected plan details.
4. **Given** all required data is valid, **When** the Master submits the form,
   **Then** the organization registration is completed and the screen shows a
   success state with a summary of the created organization.
5. **Given** the organization was registered successfully, **When** the Master
   returns to the organization list, **Then** the new organization appears with
   its selected plan.

### Edge Cases

- A user with an organization tenant role attempts to open or submit the Master
  organization list or registration flow.
- The list endpoint returns no organizations, fails, or returns a partial page
  of organizations.
- A CNPJ is invalid, already registered, or entered with formatting that needs
  normalization.
- The foundation date is in the future.
- Institutional email or WhatsApp is malformed.
- Required address fields are missing, the CEP is invalid, or the state value is
  not a valid Brazilian state.
- Complement and secondary CNAEs are omitted; the flow remains valid because
  those fields are optional.
- Available plans cannot be loaded or the selected plan becomes unavailable
  before submission.
- Plan prices must be displayed as Brazilian currency while preserving cent-based
  monetary values as the source of truth.
- Long company names, trade names, address values, or CNAE descriptions must not
  make the form unreadable.
- A submission fails after final review; entered values and selected plan remain
  available for correction or retry.
- Organization tenant data must not appear inside the Master registration flow
  or list unless it is explicitly part of platform-level organization
  administration.
- Missing organization branding or tenant settings must not affect this Master
  screen because it belongs to the platform-level housekeeping area.
- Shared organization contracts change in one package; the feature must avoid
  drift between front-end request/response types and back-end payloads.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Master-only housekeeping module for listing
  and registering organizations.
- **FR-002**: System MUST prevent non-Master users from viewing or submitting
  the Master organization list or registration flow.
- **FR-003**: System MUST present Master organization screens using the existing
  backoffice visual style and navigation patterns while making the
  platform-level Master context clear.
- **FR-004**: System MUST show a table of registered organizations with at
  least trade name, legal name, CNPJ, city, state, selected plan, plan limits,
  and creation date.
- **FR-005**: System MUST show loading, empty, and error states for the
  organization list.
- **FR-006**: System MUST provide a clear path from the organization list to the
  new organization registration screen.
- **FR-007**: System MUST organize the registration into at least four steps:
  company data, address, subscription plan, and final review.
- **FR-008**: System MUST capture company data with legal name, trade name,
  CNPJ, foundation date, primary CNAE, secondary CNAEs, institutional email, and
  WhatsApp.
- **FR-009**: System MUST capture address data with CEP, street, number,
  complement, neighborhood, city, and state.
- **FR-010**: System MUST require legal name, trade name, CNPJ, foundation date,
  primary CNAE, institutional email, WhatsApp, CEP, street, number,
  neighborhood, city, state, and selected plan before submission.
- **FR-011**: System MUST treat complement and secondary CNAEs as optional.
- **FR-012**: System MUST validate each step before allowing the Master to
  advance beyond that step.
- **FR-013**: System MUST show field-level validation messages that identify the
  invalid or missing information.
- **FR-014**: System MUST preserve entered values when the Master moves between
  steps during the active registration session.
- **FR-015**: System MUST display available subscription plans with name, price,
  maximum organization operators, and maximum active users.
- **FR-016**: System MUST display monetary plan values as Brazilian currency
  while keeping integer cents as the source value throughout the flow.
- **FR-017**: System MUST require exactly one available subscription plan before
  final review and submission.
- **FR-018**: System MUST provide a final review step summarizing company data,
  address data, and selected plan before the Master submits the registration.
- **FR-019**: System MUST submit only complete organization registrations that
  include company data, address data, and selected plan.
- **FR-020**: System MUST handle duplicate CNPJ, unavailable plan, validation,
  authorization, and submission errors without losing already entered form data.
- **FR-021**: System MUST show a success state after a completed registration,
  including the created organization's name, CNPJ, selected plan, and an action
  to return to the list or start another registration.
- **FR-022**: System MUST refresh or otherwise update the organization list after
  a successful registration so the new organization can be seen.
- **FR-023**: System MUST keep the Master organization list and registration
  flow separate from tenant operator workflows and tenant-scoped organization
  data.
- **FR-024**: System MUST define shared organization, address, company data,
  subscription plan, list response, create request, and create response
  contracts in the shared package used by both front-end and back-end.
- **FR-025**: System MUST integrate the front-end with real back-end
  organization and plan endpoints for list, plan lookup, and create actions.
- **FR-026**: System MUST support a temporary Master execution context while the
  final authentication module is not yet available, without changing the public
  data contracts that will be used after authentication exists.

### Key Entities *(include if feature involves data)*

- **Master User**: Platform-level user above organization tenants who can access
  housekeeping screens and register organizations.
- **Master Organizations List Screen**: Platform-level UI experience for
  inspecting registered organizations and navigating to registration.
- **Master Organization Registration Screen**: Platform-level UI experience for
  creating organizations without entering a tenant workspace.
- **Organization Registration Draft**: In-progress set of company data, address
  data, and selected plan values held while the Master completes the multi-step
  flow.
- **Company Data**: Organization legal and institutional details: legal name,
  trade name, CNPJ, foundation date, primary CNAE, secondary CNAEs,
  institutional email, and WhatsApp.
- **Address**: Reusable Brazilian address concept with CEP, street, number,
  complement, neighborhood, city, and state.
- **Subscription Plan**: Selectable commercial plan with name, price in cents,
  maximum organization operators, and maximum active users.
- **Created Organization**: Organization produced after a successful
  registration, with company data, address, selected plan, tenant boundary, and
  creation summary.
- **Organization List Item**: Summary representation of an organization for the
  Master table, including company identity, address summary, plan summary, and
  creation metadata.
- **Tenant Ownership**: Organization is the tenant boundary. The Master flow is
  platform-level and must not expose tenant-scoped operational data across
  organizations.
- **Shared Contracts**: Organization list, organization registration, address,
  company data, plan selection, plan limits, and cent-based monetary values must
  remain consistent across front-end and back-end feature contracts.

### Constitution Alignment *(mandatory)*

- **Affected Packages**: `packages/web` for the Master housekeeping screens,
  existing organization behavior in `packages/api`, and `packages/shared` for
  organization, address, company, and plan contracts shared across packages.
- **Tenant/White-Label Impact**: The screen belongs to the Master platform area
  above tenant organizations. It creates tenant organizations but does not adopt
  a tenant organization's branding or expose tenant-scoped operational data.
- **Contract/Typing Impact**: The form depends on stable organization
  list, registration, address, company data, subscription plan, and cent-based
  monetary contracts shared between the front-end and back-end.
- **Clean-Code Boundaries**: Master-facing organization list and registration
  remain separate from tenant operator workflows. Address and plan concepts
  remain reusable and aligned with the organization domain instead of being
  duplicated for the screens.
- **Verification Scope**: Verify Master-only access, organization listing,
  loading/empty/error states, step-by-step validation, active-session data
  preservation, plan display and selection, cent-based money handling, final
  review, successful submission, list refresh, and submission error recovery.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Master user can open the organization list and identify an
  organization's selected plan in under 30 seconds.
- **SC-002**: 100% of required company, address, and plan fields block step
  progression when missing or invalid during acceptance testing.
- **SC-003**: 100% of available plans shown in the form display their name,
  price, operator limit, and active user limit correctly from cent-based source
  values.
- **SC-004**: 0 non-Master users can view or submit the Master organization
  list or registration flow during role-based access testing.
- **SC-005**: 100% of values entered in completed prior steps remain visible
  when navigating backward or forward during the active registration session.
- **SC-006**: 100% of successful submissions show a confirmation summary with
  organization name, CNPJ, and selected plan.
- **SC-007**: At least 90% of validation failures identify the exact field that
  needs correction without requiring the Master to restart the flow.
- **SC-008**: A Master user can complete a valid organization registration from
  the registration screen in under 5 minutes.
- **SC-009**: 100% of shared organization request and response contracts used by
  the front-end match the contracts accepted and returned by the back-end during
  contract validation.

## Assumptions

- The organization registration domain, default plans, and Master authorization
  behavior from the organization feature are available or will be available
  before this screen is completed.
- This feature covers the first Master housekeeping module for listing and
  creating organizations; editing, suspension, deletion, billing operations, and
  analytics are out of scope for this first slice.
- In-progress form values must be preserved during the active registration
  session, but long-term draft recovery after browser reload is not required for
  the first version.
- The existing patient registration experience defines the expected multi-step
  interaction style: clear progress, field validation before advancing, and
  preserved values while moving between steps.
- Plan names and limits are sourced from the organization plan catalog rather
  than being hard-coded as one-off screen text.
- Until the final authentication module exists, the implementation may use a
  temporary Master context for local integration, but the module must keep the
  same role boundary expected by the final authorization model.

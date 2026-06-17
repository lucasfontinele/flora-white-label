# Feature Specification: User Authentication

**Feature Branch**: `003-user-authentication`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "Develop application authentication end to end, starting from domain modeling and covering back-end, front-end, and persistence. Authentication must protect credentials, store browser token state securely, use access and refresh credentials, support session control and future invalidation, and provide a reusable authorization marker for protected operations without applying it to any current endpoint yet. Scope is login only; account registration is separate. Authentication users have email, protected password, and one type: MASTER, ORGANIZATION, or STANDARD. Passwords require at least 8 characters, at least one lowercase letter, and at least one number; additional uppercase letters or symbols are allowed."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign In With Existing Account (Priority: P1)

As an existing FloraApp user, I want to sign in with my email and password so I can enter the application with my correct platform or organization role.

**Why this priority**: No authenticated workflow can be delivered until users can establish a valid session from known credentials.

**Independent Test**: Can be fully tested by creating or seeding an active user account, submitting valid credentials through the sign-in screen, and confirming that the application recognizes the authenticated user and their role.

**Acceptance Scenarios**:

1. **Given** an active user account with valid credentials, **When** the user submits the sign-in form, **Then** the system creates an authenticated session and the user can continue into the correct application area.
2. **Given** an unknown email, wrong password, inactive user, or inactive organization, **When** sign-in is attempted, **Then** the system rejects the attempt with a generic authentication message and does not create an active session.
3. **Given** a user account assigned to an organization, **When** sign-in succeeds, **Then** the session includes the user's organization scope and does not expose any other organization's data.

---

### User Story 2 - Continue Session Safely (Priority: P2)

As an authenticated user, I want my session to continue across page reloads and normal navigation so I do not need to sign in again while my session remains valid.

**Why this priority**: A login flow without reliable session continuity creates poor usability and weakens future protected workflows.

**Independent Test**: Can be tested after User Story 1 by reloading the browser, navigating between authenticated views, allowing the short-lived access state to expire, and confirming that eligible sessions continue without re-entering credentials.

**Acceptance Scenarios**:

1. **Given** an authenticated user with a valid session, **When** the browser reloads the application, **Then** the user remains recognized as signed in.
2. **Given** the short-lived access state has expired but the session remains eligible for renewal, **When** the application checks the current session, **Then** the session continues and renewed access state is established.
3. **Given** the renewal state is expired, revoked, reused suspiciously, or belongs to an inactive user or organization, **When** the application checks the current session, **Then** the user is treated as signed out and must sign in again.

---

### User Story 3 - Sign Out And Invalidate Current Session (Priority: P3)

As an authenticated user, I want to sign out from my current browser so that this session can no longer be used.

**Why this priority**: Users need an immediate way to end the session they are using, and the system needs the same control model that will later support a session management screen.

**Independent Test**: Can be tested by signing in, signing out, and confirming that the same browser cannot regain authenticated state without a new sign-in.

**Acceptance Scenarios**:

1. **Given** an authenticated session, **When** the user signs out, **Then** the system invalidates the current server-recognized session and clears browser authentication state.
2. **Given** a session that has been signed out, **When** the browser attempts to continue or renew that session, **Then** the system rejects it and requires a new sign-in.
3. **Given** the session was already expired or invalidated elsewhere, **When** the user signs out, **Then** the application still clears local authentication state and returns the user to the signed-out experience.

---

### User Story 4 - Prepare Protected Access Enforcement (Priority: P4)

As a product owner, I want a centralized way to mark operations as requiring authentication so future features can protect endpoints consistently without redefining authentication rules each time.

**Why this priority**: Future protected workflows need a common enforcement mechanism, but current endpoint behavior must remain unchanged until access policies are explicitly defined.

**Independent Test**: Can be tested with an isolated protected operation or automated coverage that verifies missing, invalid, expired, and valid sessions are handled consistently, while existing unmarked endpoints continue behaving as they do today.

**Acceptance Scenarios**:

1. **Given** an operation marked as requiring authentication, **When** a request has no valid session, **Then** the system rejects it with a structured authorization failure.
2. **Given** an operation marked as requiring authentication, **When** a request has a valid session, **Then** the system provides the authenticated identity and scope to that operation.
3. **Given** existing production endpoints are not marked as protected in this feature, **When** this feature is delivered, **Then** those endpoints keep their current access behavior.

### Edge Cases

- What happens when required sign-in fields are blank, malformed, or include leading/trailing whitespace?
- What happens when a user signs in while an older session already exists in the same browser?
- What happens when a user has multiple active sessions and only one session is invalidated?
- How does the system handle a renewal attempt after the renewal state has expired or been revoked?
- How does the system handle suspicious reuse of renewal state that was already replaced or invalidated?
- How does the system behave when a user or the user's organization is deactivated after sign-in but before the next session check?
- How does the system prevent organization-scoped users from gaining access to another organization's identity or data?
- How does the sign-in experience behave when organization branding or settings are missing or incomplete?
- How does the system recover when network interruption happens during sign-in, session renewal, or sign-out?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow existing active users to sign in with email and password.
- **FR-002**: The system MUST validate sign-in input before attempting authentication and present user-friendly validation errors for missing or malformed fields.
- **FR-003**: The system MUST reject failed authentication attempts with a generic message that does not reveal whether the email, password, account status, or organization status caused the failure.
- **FR-004**: The system MUST store password verification material only in a non-readable, one-way protected form and MUST never store or return plaintext passwords.
- **FR-005**: The system MUST create a distinct authenticated session after each successful sign-in, associated with the user, role, organization scope when applicable, browser or device context, creation time, last-used time, expiration time, and revocation status.
- **FR-006**: The system MUST establish short-lived access state linked to the authenticated user and session.
- **FR-007**: The system MUST establish renewable session state that can continue a valid session without asking the user to re-enter credentials.
- **FR-008**: Browser authentication state MUST be stored in a secure cookie-based session and MUST not expose secret material to client-side scripts.
- **FR-009**: The system MUST renew eligible sessions while preserving the same user, role, organization scope, and session identity.
- **FR-010**: The system MUST reject session renewal when the session, renewal state, user, or organization is expired, revoked, inactive, or otherwise invalid.
- **FR-011**: The system MUST detect suspicious reuse of renewal state and invalidate the affected session before requiring the user to sign in again.
- **FR-012**: The system MUST allow multiple concurrent sessions per user, with each session independently trackable and independently revocable.
- **FR-013**: The system MUST support invalidating any stored session so a future session management screen can revoke access.
- **FR-014**: The system MUST provide a sign-out flow that invalidates the current session and clears browser authentication state.
- **FR-015**: The system MUST expose the current authenticated session summary to the front-end, including user identity, role, organization scope when applicable, session identifier, and expiration information.
- **FR-016**: The system MUST provide a reusable authorization enforcement marker for operations that require authentication.
- **FR-017**: The authorization enforcement marker MUST reject missing, expired, revoked, or invalid sessions with structured authorization failures.
- **FR-018**: The authorization enforcement marker MUST make authenticated identity, role, organization scope, and session information available to protected operations when a session is valid.
- **FR-019**: Existing production endpoints MUST NOT be marked as protected by this feature, and their access behavior MUST remain unchanged until a later feature defines endpoint-specific access policy.
- **FR-020**: The system MUST record security-relevant authentication events, including successful sign-in, failed sign-in, session renewal, sign-out, session invalidation, and authorization rejection, without recording passwords or secret token values.
- **FR-021**: The system MUST preserve structured error responses for authentication, session, validation, and authorization failures.
- **FR-022**: Organization-scoped authenticated users MUST carry an organization scope in their session, while platform-level users MUST be explicitly represented as platform-scoped.
- **FR-023**: The feature MUST define shared contracts for sign-in, current session lookup, session renewal, sign-out, authenticated user summary, and authentication or authorization errors.
- **FR-024**: The system MUST persist all data required to manage user accounts, protected password verification material, authenticated sessions, renewable session state, revocation status, and authentication audit events.
- **FR-025**: Passwords, secret credentials, renewal secrets, and session secrets MUST NOT appear in front-end display text, ordinary response payloads, analytics, or application logs.
- **FR-026**: Each authenticated user account MUST be classified as exactly one of `MASTER`, `ORGANIZATION`, or `STANDARD`.
- **FR-027**: New or seeded authentication passwords MUST have at least 8 characters, at least one lowercase letter, and at least one number; additional uppercase letters and symbols are allowed.
- **FR-028**: Local verification data MUST include one active test user for each user type, all using the initial password `Acesso@123`.

### Key Entities *(include if feature involves data)*

- **User Account**: Represents a person who can authenticate into FloraApp. Key attributes include unique email, protected password material, active status, user type (`MASTER`, `ORGANIZATION`, or `STANDARD`), and optional organization scope.
- **Credential**: Represents the protected password verification material for a user account, including when it was created or changed. It never exposes the original password.
- **Authenticated Session**: Represents one signed-in browser or device session for a user. Key attributes include user, role, organization scope, status, created time, last-used time, expiration time, and revocation information.
- **Renewal Grant**: Represents the renewable session state that allows an authenticated session to continue while it remains valid. Key attributes include session relationship, status, expiration, rotation history, and reuse detection state.
- **Access Credential**: Represents short-lived proof that the current request belongs to an authenticated user and session. Key attributes include user identity, session identity, role, organization scope, and expiration.
- **Authorization Marker**: Represents a declaration that an operation requires a valid authenticated session before it can run.
- **Authentication Audit Event**: Represents a security event related to sign-in, renewal, sign-out, invalidation, or authorization rejection. It records event context without storing secrets.
- **Tenant Ownership**: Organization-scoped accounts, sessions, renewal grants, and access credentials MUST include an organization tenant key. Platform-scoped accounts MUST explicitly indicate that no organization tenant applies.
- **Shared Contracts**: Sign-in request, sign-in result, current session result, session renewal result, sign-out result, authenticated user summary, validation error, authentication error, and authorization error.

### Constitution Alignment *(mandatory)*

- **Affected Packages**: `packages/web`, `packages/api`, `packages/shared`, API persistence configuration, and root quality gates.
- **Tenant/White-Label Impact**: Authentication establishes the user identity and organization scope used by later tenant isolation. The sign-in experience uses default application branding when no organization context is known and must not expose one organization's branding or data to another.
- **Contract/Typing Impact**: Shared contracts are required for authentication requests and responses, authenticated user summaries, session summaries, and structured authentication or authorization failures.
- **Clean-Code Boundaries**: Authentication domain behavior belongs in API domain and application layers, transport concerns stay in the HTTP layer, persistence stays in infrastructure adapters, browser session handling stays in the web package, and shared payload definitions stay in the shared package.
- **Verification Scope**: Verification must cover sign-in, failed sign-in, password protection, session creation, renewal, revocation, sign-out, tenant scope, authorization enforcement behavior, unchanged existing endpoint behavior, and front-end session handling.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of users with valid existing accounts can complete sign-in and reach the authenticated application area in under 30 seconds during acceptance testing.
- **SC-002**: 100% of invalid credential, inactive user, and inactive organization attempts are rejected without creating an active session and without revealing which credential or status check failed.
- **SC-003**: Authenticated users remain signed in across browser reloads and normal navigation for the configured session lifetime, while expired or revoked sessions require sign-in again on the next session check.
- **SC-004**: Users can sign out of the current session in under 5 seconds, and the same browser cannot regain authenticated state without a new successful sign-in.
- **SC-005**: The system supports at least five concurrent sessions per user, and each session can be invalidated independently without affecting unrelated users or unrelated sessions.
- **SC-006**: Security verification finds no plaintext passwords, password verification material, session secrets, or renewal secrets in user-visible screens, ordinary response payloads, or application logs.
- **SC-007**: A marked protected operation rejects 100% of missing, expired, revoked, or invalid sessions and accepts valid sessions, while existing unmarked endpoints show no access behavior regression.

## Assumptions

- The first release supports email and password authentication for existing users only.
- Public self-registration, password reset, multi-factor authentication, social sign-in, and single sign-on are out of scope for this feature.
- Initial user provisioning can be handled by seed data, administrative tooling, or existing management flows outside this feature.
- Session management UI for viewing and revoking other sessions will be built later; this feature creates the underlying session control and revocation capability.
- Existing production endpoints remain unprotected by the new authorization marker until a later feature defines the endpoint-by-endpoint access policy.
- Session lifetime, renewal lifetime, and rotation intervals will be chosen during planning using standard security expectations and the desired user experience.
- Multiple active sessions per user are allowed because users may sign in from more than one browser or device.
- The sign-in interface uses default FloraApp branding unless an organization context is already known.

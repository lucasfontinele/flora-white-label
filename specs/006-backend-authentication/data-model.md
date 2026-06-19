# Data Model: Autenticação Backend

## User

Represents a systemic user that can authenticate into FloraApp.

**Existing source**:
`packages/api/src/modules/users/domain/entities/User.ts`

**Fields used by login**:

- `id`: stable user identifier used as token subject.
- `organizationId`: tenant scope returned in `user`, `context`, and token
  payload.
- `email`: normalized email address used for lookup and returned publicly.
- `passwordHash`: protected password verification material, never returned.
- `profile`: one of `Master`, `Patient`, or `Guardian`.
- `guardianId`: optional guardian link.
- `patientId`: optional patient link.

**Validation rules**:

- `organizationId` must be present.
- `profile = Guardian` requires `guardianId`.
- `profile = Patient` requires `guardianId` and `patientId`.
- `patientId` is not allowed for non-Patient users.

**Relationships**:

- `User` may reference `Guardian` through `guardianId`.
- `User` may reference `Patient` through `patientId`.
- Login does not load detailed Guardian or Patient records.

## Login Request

Input accepted by `POST /auth/login`.

**Fields**:

- `email`: required email string, trimmed and normalized before lookup.
- `password`: required nonblank password string.

**Validation rules**:

- Body must be an object with no extra fields.
- `email` must be syntactically valid.
- `password` must be nonblank.

## Login Response

Successful authentication output.

**Fields**:

- `accessToken`: signed JWT string.
- `user.id`: authenticated user ID.
- `user.email`: authenticated user email.
- `user.profile`: `Master`, `Patient`, or `Guardian`.
- `user.organizationId`: authenticated user's tenant scope.
- `user.guardianId`: guardian link or `null`.
- `user.patientId`: patient link or `null`.
- `context.view`: derived view.
- `context.organizationId`: same tenant scope as the authenticated user.
- `context.guardianId`: guardian link or `null`.
- `context.patientId`: patient link or `null`.

**Validation rules**:

- `passwordHash` and other secret material must not be present.
- Response shape is the same for Master, Patient, and Guardian.

## Auth Context

Derived context for the frontend to create a session later.

**View mapping**:

- `Master` -> `BackofficeMaster`
- `Guardian` -> `PatientPortal`
- `Patient` -> `PatientPortal`
- `Organization` is reserved for a future organization-operator profile and is
  not emitted by this feature.

**Tenant rules**:

- Context uses only values from the authenticated `User`.
- Context does not include managed patient lists, organization details, branding
  settings, permissions, or RBAC decisions.

## Auth Token Payload

Minimum signed payload carried by the JWT.

**Fields**:

- `sub`: authenticated user ID.
- `email`: authenticated user email.
- `profile`: `Master`, `Patient`, or `Guardian`.
- `organizationId`: authenticated user's tenant scope.
- `guardianId`: guardian link or `null`.
- `patientId`: patient link or `null`.

**Validation rules**:

- Must not include password hashes, plaintext passwords, token secret, or
  detailed patient/guardian records.
- Must be produced by the `JwtService` abstraction.

## Invalid Credential Failure

Application failure for unknown e-mail or wrong password.

**Fields**:

- `error`: stable error name.
- `message`: generic message that does not reveal whether the email exists.

**State transitions**:

- Failed login does not create sessions, cookies, refresh tokens, audit records,
  or user changes in this feature.

## Tenant Ownership

`User.organizationId` is the tenant key for the login response and token payload.
The login request does not accept an organization selector, and the response
must not include data from any organization other than the authenticated user's
own organization scope.

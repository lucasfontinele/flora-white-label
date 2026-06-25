# Feature Specification: Cadastro Backend de Pacientes/Guardiões

**Feature Branch**: `[007-patient-guardian-registration]`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "Crie uma spec para o cadastro backend de pacientes/guardiões. Escopo apenas back-end. Criar somente POST /organizations/:organizationId/patient-registrations com payload discriminado por registrationType para PetTutor, LegalGuardian e Patient."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Paciente realiza cadastro próprio (Priority: P1)

Como operação de onboarding, o sistema deve registrar uma pessoa que é o próprio paciente dentro de uma organização, criando o acesso do usuário e o cadastro do paciente sem exigir responsável legal.

**Why this priority**: Nem todo paciente precisa ter responsável legal; este fluxo valida que `Patient.guardianId` é realmente opcional e evita bloquear cadastros legítimos.

**Independent Test**: Enviar um cadastro `Patient` válido para uma organização existente e verificar que o resultado cria apenas usuário e paciente, com vínculo de paciente no usuário e sem guardião.

**Acceptance Scenarios**:

1. **Given** uma organização existente e sem usuário com o mesmo email nem paciente com o mesmo documento, **When** o cadastro `Patient` é solicitado com dados válidos, **Then** o sistema cria um usuário com perfil de paciente, cria um paciente sem responsável legal e retorna `userId`, `patientId`, `guardianId` ausente ou nulo, e `registrationType` igual a `Patient`.
2. **Given** um payload `Patient`, **When** o payload também tenta informar dados de guardião, **Then** o sistema rejeita o cadastro por combinação inválida para o tipo solicitado.

---

### User Story 2 - Responsável legal cadastra paciente vinculado (Priority: P2)

Como operação de onboarding, o sistema deve registrar um usuário responsável legal e o paciente sob sua responsabilidade na mesma solicitação, mantendo o vínculo explícito entre os dois cadastros.

**Why this priority**: Pacientes dependentes precisam ser representados por um guardião legal, e o vínculo deve nascer consistente para uso posterior em jornadas clínicas e administrativas.

**Independent Test**: Enviar um cadastro `LegalGuardian` válido e verificar que usuário, guardião e paciente são criados, com o paciente apontando para o guardião criado.

**Acceptance Scenarios**:

1. **Given** uma organização existente e sem conflitos de email ou documentos, **When** o cadastro `LegalGuardian` é solicitado com usuário, guardião e paciente válidos, **Then** o sistema cria o usuário com perfil de guardião, cria o guardião, cria o paciente vinculado ao guardião e retorna `userId`, `guardianId`, `patientId` e `registrationType` igual a `LegalGuardian`.
2. **Given** um cadastro `LegalGuardian`, **When** os dados do paciente são omitidos, **Then** o sistema rejeita o cadastro porque este tipo exige criação conjunta de guardião e paciente.

---

### User Story 3 - Tutor de pet realiza cadastro inicial (Priority: P3)

Como operação de onboarding, o sistema deve registrar um usuário que é tutor ou guardião de pet, criando o acesso do usuário e o cadastro de guardião sem criar paciente humano nesta etapa.

**Why this priority**: O produto precisa aceitar tutores de pet sem misturá-los com o cadastro humano de pacientes.

**Independent Test**: Enviar um cadastro `PetTutor` válido e verificar que apenas usuário e guardião são criados, sem paciente.

**Acceptance Scenarios**:

1. **Given** uma organização existente e sem usuário com o mesmo email nem guardião com o mesmo documento, **When** o cadastro `PetTutor` é solicitado com dados válidos, **Then** o sistema cria um usuário com perfil de guardião, cria um guardião, não cria paciente e retorna `userId`, `guardianId`, `patientId` ausente ou nulo, e `registrationType` igual a `PetTutor`.
2. **Given** um payload `PetTutor`, **When** o payload também tenta informar dados de paciente, **Then** o sistema rejeita o cadastro por combinação inválida para o tipo solicitado.

### Edge Cases

- Quando `registrationType` estiver ausente, vazio ou fora de `PetTutor`, `LegalGuardian` e `Patient`, o cadastro deve ser rejeitado.
- Quando campos obrigatórios do tipo selecionado estiverem ausentes, vazios ou em formato inválido, o cadastro deve ser rejeitado antes de criar qualquer registro.
- Quando o email já existir dentro da mesma organização, o cadastro deve falhar sem criar registros parciais.
- Quando o documento do paciente já existir dentro da mesma organização, o cadastro deve falhar sem criar registros parciais.
- Quando o documento do guardião já existir dentro da mesma organização, o cadastro deve falhar sem criar registros parciais.
- Quando um documento for enviado com máscara, espaços ou pontuação, a comparação de unicidade deve considerar o valor normalizado sem máscara.
- Quando um email for enviado com caixa diferente ou espaços externos, a comparação de unicidade deve considerar o email normalizado.
- Quando a organização informada na rota não existir ou não puder receber cadastros, o sistema deve rejeitar a solicitação sem criar usuário, guardião ou paciente.
- Quando ocorrer falha durante a criação de uma das entidades de um cadastro composto, o sistema deve manter o resultado consistente, sem cadastros incompletos.
- Dados de senha e hash nunca devem aparecer na resposta de sucesso ou erro.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose exactly one initial backend registration operation for this feature: `POST /organizations/:organizationId/patient-registrations`.
- **FR-002**: System MUST require the client to explicitly send `registrationType` with one of these values: `PetTutor`, `LegalGuardian`, or `Patient`.
- **FR-003**: System MUST validate the request payload at the input boundary with Zod using the selected `registrationType` as the discriminator.
- **FR-004**: System MUST reject payloads whose included sections do not match the selected `registrationType`.
- **FR-005**: System MUST create a password hash using `HashService` and MUST NOT persist or return the raw password.
- **FR-006**: System MUST NOT use Argon2 directly inside the registration use case.
- **FR-007**: System MUST keep persistence details, including Prisma, out of domain and application contracts.
- **FR-008**: System MUST normalize `User.email` before uniqueness checks and persistence.
- **FR-009**: System MUST enforce `User.email` uniqueness within the organization.
- **FR-010**: System MUST normalize `Patient.document` and `Guardian.document` without mask before uniqueness checks and persistence.
- **FR-011**: System MUST enforce `Patient.document` uniqueness within the organization.
- **FR-012**: System MUST enforce `Guardian.document` uniqueness within the organization.
- **FR-013**: System MUST treat `Patient.guardianId` as optional and allow a patient to exist without a guardião/responsável.
- **FR-014**: System MUST keep `underPrivileged` as a patient attribute and require it whenever patient data is created.
- **FR-015**: For `Patient`, System MUST create `User` and `Patient`, set the user profile to `UserProfile.Patient`, set `user.patientId` to the created patient, leave `user.guardianId` empty, and not create a `Guardian`.
- **FR-016**: For `LegalGuardian`, System MUST create `User`, `Guardian`, and `Patient`, set the user profile to `UserProfile.Guardian`, set `user.guardianId` to the created guardian, leave `user.patientId` empty, and set `patient.guardianId` to the created guardian.
- **FR-017**: For `PetTutor`, System MUST create `User` and `Guardian`, set the user profile to `UserProfile.Guardian`, set `user.guardianId` to the created guardian, leave `user.patientId` empty, and not create a `Patient`.
- **FR-018**: System MUST return a response containing `userId`, `registrationType`, and the created `guardianId` and/or `patientId` when applicable; absent links must be represented as omitted or null.
- **FR-019**: System MUST avoid partial registrations; if any validation, conflict, or creation step fails, the requested registration must not leave incomplete user, guardian, or patient records.
- **FR-020**: System MUST limit this feature to the initial registration endpoint and MUST NOT add full patient CRUD or guardian CRUD.
- **FR-021**: System MUST NOT implement frontend, authentication login, logout, cookies, IronSession, refresh token, document upload, pathologies, prescriptions, orders, pets, underprivileged approval, or authorization middleware as part of this feature.
- **FR-022**: System MUST preserve organization scope for every user, guardian, and patient created by this feature.

### Key Entities

- **Patient Registration Request**: The incoming organization-scoped registration request selected by `registrationType`, containing user credentials and the type-specific person sections.
- **User**: The access identity associated with an organization. Key attributes for this feature are organization, normalized email, password hash, profile, optional guardian link, and optional patient link.
- **Guardian**: A guardião, tutor, or legal responsible person associated with an organization. Key attributes are organization, name, normalized document, birthdate, and gender.
- **Patient**: A patient associated with an organization. Key attributes are organization, optional guardian link, name, normalized document, birthdate, gender, and underprivileged flag.
- **CreatePatientRegistrationResponse**: The response contract containing `userId`, optional or nullable `guardianId`, optional or nullable `patientId`, and `registrationType`.
- **Tenant Ownership**: `organizationId` from the route is the tenant key for all records created by this feature.
- **Shared Contracts**: `registrationType` enum values, request payload variants, response payload, `UserProfile` mapping, accepted gender values, and structured validation/conflict error shapes.

### Constitution Alignment *(mandatory)*

- **Affected Packages**: `packages/api` and feature documentation only. `packages/web` must remain unchanged.
- **Tenant/White-Label Impact**: All created records are organization-scoped by the route organization. No branding or white-label settings are changed.
- **Contract/Typing Impact**: Adds a backend contract for `POST /organizations/:organizationId/patient-registrations`, the discriminated request payload, and `CreatePatientRegistrationResponse`.
- **Clean-Code Boundaries**: Validation stays at the input boundary, orchestration stays in backend application behavior, domain entities remain persistence-agnostic, and concrete hashing/persistence details do not leak into the use case.
- **Verification Scope**: Independent tests must cover all three registration types, validation failures, duplicate email/document conflicts, organization scoping, password hashing through the hashing service, absence of raw password in responses, and the absence of frontend changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the three supported registration types can be completed through the backend operation with the expected created links and response identifiers.
- **SC-002**: 100% of invalid type/payload combinations are rejected before any user, guardian, or patient record is created.
- **SC-003**: 100% of same-organization duplicate checks for user email, patient document, and guardian document reject the registration without partial records.
- **SC-004**: 95% of valid registration attempts in a normal development or staging environment complete in under 2 seconds from request submission to response.
- **SC-005**: Verification confirms that no frontend files, login/logout behavior, cookies, refresh token behavior, or authorization middleware are changed by this feature.
- **SC-006**: Verification confirms that successful and failed responses never expose raw passwords or password hashes.

## Assumptions

- The route organization must already exist; this feature does not create organizations.
- Password strength rules follow the existing backend policy unless a later plan defines stricter registration-specific rules.
- Accepted gender values follow the existing `Gender` domain enum, including `M`, `F`, and `O`.
- Birthdates are provided as calendar dates and must represent valid dates.
- Document normalization removes formatting characters before validation, comparison, and persistence.
- Email normalization follows the existing email value rules used by the backend.
- Error responses use the existing structured API error pattern for validation and conflict cases.

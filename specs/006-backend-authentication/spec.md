# Feature Specification: Autenticação Backend

**Feature Branch**: `006-backend-authentication`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "Crie uma spec para autenticação backend da plataforma. Escopo: implementar apenas autenticação no back-end. Não implementar frontend, IronSession no frontend, cookies no frontend, UI, telas, middleware de Next.js ou qualquer integração client-side. A plataforma possui Backoffice Master, Organização e Paciente/Guardião. Qualquer usuário sistêmico deve existir em User. Criar apenas POST /auth/login com email e senha, retornando token JWT e contexto do usuário autenticado. Validar input, buscar usuário por e-mail, comparar senha via HashService, gerar JWT via JwtService, não retornar passwordHash, retornar erro genérico para credenciais inválidas, não revelar se o e-mail existe. Derivar view por profile: Master -> BackofficeMaster; Organization -> Organization; Guardian/Patient -> PatientPortal. Usuários de organização interna usam o profile Organization. Não criar cadastro, logout, refresh token, recuperação de senha, cookies, frontend, RBAC completo, middleware de autorização, /me, seleção de paciente ativo, login social ou MFA."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Login de Usuário Existente (Priority: P1)

Como usuário sistêmico existente, quero autenticar com e-mail e senha em um único ponto de entrada backend para que o frontend possa receber um token e o contexto necessário para criar sua sessão posteriormente.

**Why this priority**: O login é o primeiro comportamento necessário para que qualquer frente da plataforma reconheça uma identidade sistêmica sem acoplar a entrega a frontend, cookies ou sessão client-side.

**Independent Test**: Pode ser testado criando ou usando um usuário existente com senha válida, enviando e-mail e senha ao endpoint de login e confirmando que a resposta retorna token, dados públicos do usuário e contexto de navegação correspondente ao perfil.

**Acceptance Scenarios**:

1. **Given** existe um usuário Master com e-mail e senha válidos, **When** o login é solicitado, **Then** o sistema autentica o usuário e retorna token, usuário público e contexto com view `BackofficeMaster`.
2. **Given** existe um usuário Patient com e-mail e senha válidos, **When** o login é solicitado, **Then** o sistema autentica o usuário e retorna token, usuário público e contexto com view `PatientPortal`.
3. **Given** existe um usuário Organization com e-mail e senha válidos, **When** o login é solicitado, **Then** o sistema autentica o usuário e retorna token, usuário público e contexto com view `Organization`.
4. **Given** existe um usuário Guardian com e-mail e senha válidos, **When** o login é solicitado, **Then** o sistema autentica o usuário e retorna token, usuário público e contexto com view `PatientPortal`.
5. **Given** o e-mail é informado com letras maiúsculas ou espaços externos, **When** o login é solicitado com senha correta, **Then** o sistema normaliza o e-mail para autenticação sem alterar a identidade retornada de forma indevida.

---

### User Story 2 - Rejeitar Credenciais Inválidas Sem Vazamento (Priority: P2)

Como usuário que errou as credenciais, quero receber uma falha de autenticação genérica para que a plataforma não revele se um e-mail existe, se a senha está errada ou qualquer detalhe sensível da conta.

**Why this priority**: A autenticação precisa reduzir vazamento de informação desde a primeira entrega, especialmente antes de haver políticas mais completas de autorização e sessão.

**Independent Test**: Pode ser testado tentando login com e-mail inexistente, senha incorreta e payload inválido, confirmando que credenciais inválidas retornam a mesma falha genérica e que payload inválido retorna erro de validação separado.

**Acceptance Scenarios**:

1. **Given** o e-mail não pertence a nenhum usuário, **When** o login é solicitado, **Then** o sistema rejeita a tentativa com erro genérico de credenciais inválidas.
2. **Given** o e-mail pertence a um usuário, mas a senha está incorreta, **When** o login é solicitado, **Then** o sistema rejeita a tentativa com o mesmo erro genérico de credenciais inválidas.
3. **Given** o corpo da requisição não contém e-mail válido ou senha preenchida, **When** o login é solicitado, **Then** o sistema rejeita a tentativa como payload inválido sem executar autenticação.
4. **Given** uma tentativa de login falha, **When** a resposta é retornada, **Then** o sistema não inclui indicação de existência do e-mail, hash de senha, token parcial ou detalhe interno.

---

### User Story 3 - Entregar Contexto Consistente Para Sessão Futura (Priority: P3)

Como frontend consumidor da API, quero receber uma resposta de login com formato consistente para que uma etapa futura possa armazenar a sessão com cookies ou IronSession sem precisar inferir contexto de perfil.

**Why this priority**: O backend deve entregar o contrato mínimo para as três frentes da plataforma, mas sem implementar armazenamento de sessão no navegador nesta feature.

**Independent Test**: Pode ser testado validando o payload de resposta para usuários Master, Organization, Patient e Guardian, confirmando que todos retornam `accessToken`, `user` e `context` com os campos esperados e sem `passwordHash`.

**Acceptance Scenarios**:

1. **Given** qualquer usuário autenticado com sucesso, **When** a resposta é montada, **Then** ela contém `accessToken`, `user` e `context`.
2. **Given** qualquer usuário autenticado com sucesso, **When** os dados públicos do usuário são retornados, **Then** eles incluem `id`, `email`, `profile`, `organizationId`, `guardianId` quando aplicável e `patientId` quando aplicável.
3. **Given** qualquer usuário autenticado com sucesso, **When** o contexto é retornado, **Then** ele inclui a view derivada do perfil e os identificadores necessários para escopo futuro.
4. **Given** um usuário interno de organização possui profile `Organization`, **When** o contexto é retornado, **Then** a view derivada é `Organization`.

### Edge Cases

- `email` está ausente, vazio, malformado, com espaços externos, com letras maiúsculas ou com caracteres não textuais.
- `password` está ausente, vazio, contém apenas espaços ou excede tamanho aceitável para processamento seguro.
- O e-mail não existe ou a senha não confere; as duas situações devem produzir a mesma falha genérica de credenciais inválidas.
- O usuário existe, mas possui `organizationId` ausente ou vazio; a autenticação deve falhar de forma controlada porque o contrato atual exige `organizationId`.
- Usuário `Guardian` não possui `guardianId`, usuário `Patient` não possui `patientId`, ou usuário possui ambos os vínculos; a resposta deve preservar valores nulos ou presentes sem inventar vínculo inexistente.
- Usuário possui `profile` fora dos valores aceitos pelo contrato atual; a autenticação deve falhar de forma controlada e não emitir token com perfil desconhecido.
- O token não pode ser emitido por indisponibilidade do mecanismo de assinatura; a resposta deve ser estruturada como erro inesperado sem autenticar parcialmente o usuário.
- Falhas de validação devem retornar erro de payload inválido, enquanto falhas de credenciais devem retornar falha de autenticação.
- Nenhum fluxo desta feature deve criar, alterar ou limpar cookies, sessão de navegador, telas, middleware client-side ou estado no frontend.
- A feature não deve expor dados operacionais de pacientes, responsáveis, organizações ou permissões além do contexto mínimo de autenticação.
- White-label, branding e configurações visuais da organização não participam do login backend-only.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST expor um único endpoint de login backend em `POST /auth/login`.
- **FR-002**: O sistema MUST NOT criar endpoints de cadastro, logout, renovação de token, recuperação de senha, troca de senha, sessão atual ou seleção de paciente ativo nesta feature.
- **FR-003**: O sistema MUST aceitar no login apenas e-mail e senha como entrada obrigatória.
- **FR-004**: O sistema MUST validar o payload antes de tentar autenticar o usuário.
- **FR-005**: O sistema MUST normalizar o e-mail antes da busca de usuário.
- **FR-006**: O sistema MUST buscar usuários sistêmicos pela entidade `User`.
- **FR-007**: O sistema MUST autenticar apenas usuários cujo e-mail exista e cuja senha informada corresponda ao material protegido de senha armazenado.
- **FR-008**: A verificação de senha MUST ocorrer por uma abstração de verificação de hash, sem acoplar o caso de uso a uma biblioteca específica de hashing.
- **FR-009**: A emissão do token MUST ocorrer por uma abstração de assinatura/verificação de token, sem acoplar o caso de uso a uma biblioteca específica de token.
- **FR-010**: O sistema MUST retornar erro genérico para credenciais inválidas.
- **FR-011**: O sistema MUST NOT revelar se o e-mail existe, se a senha está incorreta ou qual etapa de autenticação falhou.
- **FR-012**: O sistema MUST retornar sucesso com status de autenticação concluída quando e-mail e senha forem válidos.
- **FR-013**: A resposta de sucesso MUST conter `accessToken`, `user` e `context`.
- **FR-014**: `user` na resposta MUST conter `id`, `email`, `profile`, `organizationId`, `guardianId` quando aplicável e `patientId` quando aplicável.
- **FR-015**: `context` na resposta MUST conter `view`, `organizationId`, `guardianId` quando aplicável e `patientId` quando aplicável.
- **FR-016**: O `accessToken` emitido MUST ser um token JWT assinado e carregar no mínimo identificador do usuário, e-mail, perfil, organização e vínculos de paciente ou guardião quando aplicáveis.
- **FR-017**: O sistema MUST mapear `profile = Master` para `context.view = BackofficeMaster`.
- **FR-018**: O sistema MUST mapear `profile = Organization` para `context.view = Organization`.
- **FR-019**: O sistema MUST mapear `profile = Guardian` para `context.view = PatientPortal`.
- **FR-020**: O sistema MUST mapear `profile = Patient` para `context.view = PatientPortal`.
- **FR-021**: Usuários internos de organização MUST usar `profile = Organization` e sempre retornar `organizationId`.
- **FR-022**: O sistema MUST NOT retornar `passwordHash`, material de verificação de senha, segredo de token ou qualquer credencial sensível em respostas.
- **FR-023**: Payload inválido MUST retornar erro de validação estruturado.
- **FR-024**: Credenciais inválidas MUST retornar falha de autenticação estruturada.
- **FR-025**: Erros inesperados MUST retornar resposta estruturada sem expor detalhes internos.
- **FR-026**: A feature MUST NOT implementar frontend, UI, telas, cookies, IronSession, middleware client-side ou qualquer integração client-side.
- **FR-027**: A feature MUST NOT implementar RBAC completo, middleware de autorização, login social, MFA ou contexto detalhado de pacientes gerenciados.
- **FR-028**: O domínio e a aplicação MUST permanecer independentes de transporte HTTP, persistência, validação de borda e bibliotecas de infraestrutura.
- **FR-029**: O contrato de resposta MUST ser consistente para usuários `Master`, `Organization`, `Patient` e `Guardian`.
- **FR-030**: O login MUST preservar o contexto de tenant retornando apenas o `organizationId` do usuário autenticado e seus vínculos aplicáveis de paciente ou guardião.

### Key Entities *(include if feature involves data)*

- **User**: Representa qualquer usuário sistêmico que pode autenticar na plataforma. Atributos relevantes para esta feature incluem `id`, `organizationId`, `email`, material protegido de senha, `profile`, `guardianId` e `patientId`.
- **User Profile**: Classificação atual do usuário autenticável nesta etapa: `Master`, `Organization`, `Patient` ou `Guardian`.
- **Login Request**: Entrada de autenticação composta por e-mail e senha.
- **Login Response**: Saída de autenticação composta por token de acesso, usuário público e contexto de visualização.
- **Auth Token Payload**: Conteúdo mínimo assinado para representar o usuário autenticado: identificador do usuário, e-mail, perfil, organização e vínculos opcionais.
- **Auth Context**: Contexto derivado do perfil e dos vínculos do usuário, usado pelo consumidor para decidir a frente de visualização sem consultar dados sensíveis.
- **Tenant Ownership**: Todo usuário autenticado retorna `organizationId` no contrato atual. O login não permite escolher outra organização e não retorna dados de outras organizações.
- **Shared Contracts**: Contratos afetados: request de login, response de login, usuário autenticado público, contexto de autenticação, payload mínimo de token, erro de validação, erro de credenciais inválidas e erro inesperado.

### Constitution Alignment *(mandatory)*

- **Affected Packages**: API e documentação da feature. Web/UI e integrações client-side ficam fora de escopo. Contratos compartilhados só devem ser promovidos se o projeto já exigir compartilhamento entre pacotes.
- **Tenant/White-Label Impact**: O login retorna o `organizationId` do usuário autenticado e não permite troca de tenant. A feature não usa branding, logo, domínio customizado, textos de portal ou configurações visuais.
- **Contract/Typing Impact**: Define contrato de login com entrada, resposta, usuário público, contexto, token mínimo e erros esperados. A resposta é igual em forma para Master, Organization, Patient e Guardian.
- **Clean-Code Boundaries**: Regras de autenticação e montagem de contexto pertencem à aplicação; entidade de usuário e perfis permanecem no domínio; transporte, validação de payload, persistência, hashing e assinatura de token permanecem em suas fronteiras.
- **Verification Scope**: Deve cobrir login válido para Master, Organization, Patient e Guardian, e-mail normalizado, senha verificada por abstração, token emitido por abstração, falha genérica para credenciais inválidas, erro de payload inválido, ausência de `passwordHash` na resposta e ausência de alterações em frontend/cookies/IronSession.

### API Contract

#### `POST /auth/login`

Autentica um usuário sistêmico existente e retorna token de acesso e contexto de visualização.

**Request Body**:

```json
{
  "email": "user@email.com",
  "password": "senha"
}
```

**Response 200**:

```json
{
  "accessToken": "signed-access-token",
  "user": {
    "id": "user-id",
    "email": "user@email.com",
    "profile": "Master",
    "organizationId": "organization-id",
    "guardianId": null,
    "patientId": null
  },
  "context": {
    "view": "BackofficeMaster",
    "organizationId": "organization-id",
    "guardianId": null,
    "patientId": null
  }
}
```

**Valores permitidos de `user.profile`**:

- `Master`
- `Organization`
- `Patient`
- `Guardian`

**Valores permitidos de `context.view`**:

- `BackofficeMaster`
- `Organization`
- `PatientPortal`

**Erros esperados**:

- Payload inválido: corpo ausente, malformado ou com `email` ou `password` inválidos.
- Credenciais inválidas: e-mail desconhecido ou senha incorreta, sem revelar qual condição ocorreu.
- Erro inesperado: autenticação não pode ser concluída por falha interna.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid Master, Organization, Patient and Guardian login attempts in acceptance testing return `accessToken`, `user` and `context` with the expected view mapping.
- **SC-002**: 100% of invalid e-mail and invalid password attempts return the same generic credential failure without revealing whether the e-mail exists.
- **SC-003**: 100% of invalid payload attempts are rejected before authentication and return a structured validation failure.
- **SC-004**: Security verification finds zero occurrences of `passwordHash`, password verification material, token secrets or plaintext passwords in successful login responses and ordinary error responses.
- **SC-005**: The login flow completes in under 2 seconds for at least 95% of acceptance test attempts in a normal development or staging environment.
- **SC-006**: No files or behavior in frontend, cookies, IronSession, client-side middleware or UI are changed as part of this feature.
- **SC-007**: All authenticated responses include the authenticated user's organization scope and never include another organization's data.

## Assumptions

- Existing users are provisioned outside this feature.
- Existing `User` records contain the e-mail, protected password material, profile and organization scope needed for login.
- `organizationId` is required in the current user model for every authenticated user, including Master, Organization, Patient and Guardian.
- `guardianId` and `patientId` may be absent or null depending on the authenticated user's role and links.
- Organization-operator authentication uses the `Organization` profile in this slice; detailed permissions remain out of scope.
- Token lifetime, signing configuration and secret management are implementation planning decisions as long as the response contract and security requirements remain satisfied.
- This feature only issues an access token; storage, renewal, logout and browser session management are later frontend/backend integration concerns.

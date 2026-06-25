# Feature Specification: Backend de Documentos Obrigatórios e Aprovações

**Feature Branch**: `[008-backend-document-approvals]`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "Crie uma spec para a funcionalidade backend de documentos exigidos por organização e aprovação de documentos de pacientes. Escopo: apenas back-end. Não implementar frontend, upload em cloud, storage, S3, Cloudflare R2, MinIO, GCS, presigned URL, download, visualização de arquivo, OCR ou validação real de arquivo nesta spec."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configurar documentos exigidos pela organização (Priority: P1)

Como usuário de uma organização, quero configurar quais tipos de documentos meus pacientes deverão enviar futuramente para que a organização tenha uma lista própria de exigências documentais.

**Why this priority**: A lista de documentos exigidos é a base do workflow; sem ela não há como criar aprovações por paciente de forma consistente.

**Independent Test**: Criar, listar, atualizar e remover documentos exigidos para uma organização, verificando unicidade por organização e isolamento entre organizações.

**Acceptance Scenarios**:

1. **Given** uma organização existente sem documento chamado "Receita médica", **When** o usuário cria esse documento exigido, **Then** o sistema registra o tipo de documento para a organização e o retorna na listagem da organização.
2. **Given** uma organização já possui documento chamado "Receita médica", **When** o usuário tenta criar outro documento exigido com o mesmo nome nessa organização, **Then** o sistema rejeita a criação por duplicidade.
3. **Given** duas organizações diferentes, **When** ambas criam um documento exigido com o mesmo nome, **Then** o sistema permite as duas configurações sem compartilhar dados entre organizações.
4. **Given** um documento exigido sem aprovações vinculadas, **When** o usuário remove esse documento, **Then** o documento deixa de aparecer na configuração da organização.
5. **Given** um documento exigido possui aprovações vinculadas a pacientes, **When** o usuário tenta removê-lo, **Then** o sistema rejeita a remoção porque o documento está em uso.

---

### User Story 2 - Criar e consultar aprovações de documentos por paciente (Priority: P2)

Como usuário de uma organização, quero registrar o estado de aprovação de um documento exigido para um paciente para acompanhar se aquele documento está pendente, aprovado ou rejeitado.

**Why this priority**: O estado por paciente é o principal valor operacional da feature e deve nascer vinculado a um documento exigido válido da mesma organização.

**Independent Test**: Criar uma aprovação para um paciente e documento exigido da mesma organização, listar as aprovações do paciente e confirmar que o status inicial é pendente.

**Acceptance Scenarios**:

1. **Given** uma organização possui um documento exigido e um paciente da mesma organização, **When** o usuário cria uma aprovação para esse documento e paciente, **Then** o sistema cria um registro com status `PENDING` e motivo de rejeição vazio.
2. **Given** já existe aprovação para o mesmo documento e paciente, **When** o usuário tenta criar outra aprovação com a mesma combinação, **Then** o sistema rejeita a criação por duplicidade.
3. **Given** o documento exigido pertence a outra organização, **When** o usuário tenta criar aprovação pela organização atual, **Then** o sistema rejeita a operação por documento não encontrado ou fora da organização.
4. **Given** o paciente pertence a outra organização, **When** o usuário tenta criar aprovação pela organização atual, **Then** o sistema rejeita a operação por paciente não encontrado ou fora da organização.

---

### User Story 3 - Aprovar, rejeitar e resetar documento do paciente com auditoria (Priority: P3)

Como usuário de uma organização, quero aprovar, rejeitar ou devolver para pendente uma aprovação de documento de paciente, registrando quem executou a ação para manter rastreabilidade operacional.

**Why this priority**: O workflow só é útil se as transições de status preservarem motivo de rejeição, limparem dados inconsistentes e criarem auditoria append-only.

**Independent Test**: Executar approve, reject e reset em uma aprovação existente e verificar status, motivo de rejeição e logs gerados em ordem de criação.

**Acceptance Scenarios**:

1. **Given** uma aprovação pendente, **When** o usuário aprova o documento informando `organizationUserId`, **Then** o status muda para `APPROVED`, o motivo de rejeição fica vazio e um log `APPROVED_DOCUMENT` é criado.
2. **Given** uma aprovação pendente ou aprovada, **When** o usuário rejeita o documento informando `organizationUserId` e `rejectedReason`, **Then** o status muda para `REJECTED`, o motivo informado é armazenado e um log `REJECTED_DOCUMENT` é criado.
3. **Given** uma aprovação rejeitada, **When** o usuário tenta rejeitar sem motivo, **Then** o sistema rejeita a operação e não cria log.
4. **Given** uma aprovação rejeitada ou aprovada, **When** o usuário reseta a aprovação para pendente informando `organizationUserId`, **Then** o status muda para `PENDING`, o motivo de rejeição fica vazio e um log `RESET_DOCUMENT_TO_PENDING` é criado.
5. **Given** uma aprovação existente, **When** o usuário lista os logs dessa aprovação, **Then** o sistema retorna apenas os logs daquele paciente, documento e organização, sem permitir atualização ou remoção de logs.

### Edge Cases

- Nome do documento exigido ausente, vazio ou contendo apenas espaços deve ser rejeitado.
- Nome duplicado dentro da mesma organização deve ser rejeitado; o mesmo nome em organizações diferentes deve ser permitido.
- Atualizar um documento exigido para um nome já usado por outro documento da mesma organização deve ser rejeitado.
- Remover documento exigido com qualquer aprovação vinculada deve ser rejeitado.
- Criar aprovação para documento inexistente, removido ou pertencente a outra organização deve ser rejeitado.
- Criar aprovação para paciente inexistente ou fora da organização da rota deve ser rejeitado.
- Criar aprovação duplicada para o mesmo par documento-paciente deve ser rejeitado.
- Aprovar ou resetar uma aprovação deve sempre limpar `rejectedReason`.
- Rejeitar uma aprovação deve exigir `rejectedReason` textual, não vazio após normalização de espaços.
- Rejeitar, aprovar ou resetar aprovação inexistente, pertencente a outro paciente ou fora da organização da rota deve ser rejeitado.
- Logs devem ser append-only; não devem existir operações de alteração ou exclusão de logs.
- A feature deve representar reenvio futuro apenas por reset para pendente, sem upload, arquivo, link, download, OCR ou validação real de arquivo.
- Erros inesperados devem ser estruturados e não devem expor detalhes internos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an organization to create a required document configuration with `organizationId` and mandatory `name`.
- **FR-002**: System MUST reject required document names that are empty after trimming external whitespace.
- **FR-003**: System MUST enforce required document name uniqueness within the same organization.
- **FR-004**: System MUST allow different organizations to use the same required document name.
- **FR-005**: System MUST list only required documents that belong to the requested organization.
- **FR-006**: System MUST allow an organization to update the name of one of its required documents.
- **FR-007**: System MUST reject required document updates that would duplicate another required document name in the same organization.
- **FR-008**: System MUST allow deleting a required document only when it has no patient approvals linked to it.
- **FR-009**: System MUST reject deletion of required documents that have one or more linked patient approvals.
- **FR-010**: System MUST treat required documents as configuration records only, not as uploaded files.
- **FR-011**: System MUST create a patient document approval only for a required document that belongs to the organization in the route.
- **FR-012**: System MUST create a patient document approval only for a patient that belongs to the organization in the route.
- **FR-013**: System MUST create patient document approvals with initial status `PENDING`.
- **FR-014**: System MUST ensure `rejectedReason` is empty when an approval status is `PENDING`.
- **FR-015**: System MUST ensure at most one approval exists for each `documentId` and `patientId` pair.
- **FR-016**: System MUST list only document approvals for the requested patient and organization.
- **FR-017**: System MUST support the status values `PENDING`, `REJECTED`, and `APPROVED`.
- **FR-018**: System MUST approve an existing patient document approval by changing status to `APPROVED` and clearing `rejectedReason`.
- **FR-019**: System MUST reject an existing patient document approval by changing status to `REJECTED` and storing a mandatory `rejectedReason`.
- **FR-020**: System MUST reject document rejection requests when `rejectedReason` is absent, null, empty, or whitespace-only.
- **FR-021**: System MUST reset an existing patient document approval to `PENDING` and clear `rejectedReason`.
- **FR-022**: System MUST use reset to pending as the backend representation of a future patient resubmission in this feature.
- **FR-023**: System MUST create an audit log when a patient document approval is approved.
- **FR-024**: System MUST create an audit log when a patient document approval is rejected.
- **FR-025**: System MUST create an audit log when a patient document approval is reset to pending.
- **FR-026**: Audit logs MUST capture the performed action, the patient approval, the organization user responsible for the action, and creation time.
- **FR-027**: Audit logs MUST be append-only and MUST NOT support update or delete operations.
- **FR-028**: System MUST list audit logs only for approvals that belong to the requested patient and organization.
- **FR-029**: System MUST capture `organizationUserId` for approve, reject, and reset actions.
- **FR-030**: System MUST define `CREATED_PATIENT_DOCUMENT_APPROVAL` as an audit action value for future or context-provided creation auditing, without requiring the create approval request body to include an actor in this feature.
- **FR-031**: System MUST NOT add RBAC, authorization middleware, permission validation, authentication changes, or role policies as part of this feature.
- **FR-032**: System MUST return distinguishable structured errors for invalid payload, required document not found, duplicate required document, required document in use, patient not found, patient outside organization, duplicate approval, approval not found, missing rejection reason, invalid status transition when applicable, and unexpected failure.
- **FR-033**: System MUST NOT implement frontend, cloud upload, storage, file persistence, presigned URLs, download, file preview, OCR, automatic analysis, real file validation, notification, email, visual timeline, pet documents, or electronic signature in this feature.
- **FR-034**: System MUST keep document approval business rules enforceable without depending on HTTP routing, request validation libraries, persistence adapters, or file-storage services.
- **FR-035**: System MUST preserve organization scope for every required document, approval, and audit log read or write.

### Domain Modeling Guidance

- **DM-001**: `OrganizationDocumentPatientApproval` SHOULD be the Aggregate Root for the document approval workflow because it owns status transitions, rejected reason invariants, and audit action generation.
- **DM-002**: `OrganizationRequiredDocument` SHOULD be modeled as an independent entity that represents an organization-level document requirement and not an uploaded file.
- **DM-003**: `OrganizationDocumentApprovalLog` SHOULD be modeled as an audit entity whose records are appended by approval workflow actions.
- **DM-004**: The domain SHOULD define approval status values equivalent to `PENDING`, `REJECTED`, and `APPROVED`.
- **DM-005**: The domain SHOULD define audit action values equivalent to `CREATED_PATIENT_DOCUMENT_APPROVAL`, `APPROVED_DOCUMENT`, `REJECTED_DOCUMENT`, and `RESET_DOCUMENT_TO_PENDING`.

### Expected Backend Operations

- **Required Documents**:
  - `POST /organizations/:organizationId/required-documents`
  - `GET /organizations/:organizationId/required-documents`
  - `PUT /organizations/:organizationId/required-documents/:documentId`
  - `DELETE /organizations/:organizationId/required-documents/:documentId`
- **Patient Document Approvals**:
  - `POST /organizations/:organizationId/patients/:patientId/document-approvals`
  - `GET /organizations/:organizationId/patients/:patientId/document-approvals`
  - `POST /organizations/:organizationId/patients/:patientId/document-approvals/:approvalId/approve`
  - `POST /organizations/:organizationId/patients/:patientId/document-approvals/:approvalId/reject`
  - `POST /organizations/:organizationId/patients/:patientId/document-approvals/:approvalId/reset-to-pending`
  - `GET /organizations/:organizationId/patients/:patientId/document-approvals/:approvalId/logs`

### Expected Payloads and Responses

#### Create required document request

```json
{
  "name": "Receita médica"
}
```

#### Required document response

```json
{
  "id": "required-document-id",
  "organizationId": "organization-id",
  "name": "Receita médica",
  "createdAt": "2026-06-22T12:00:00.000Z",
  "updatedAt": "2026-06-22T12:00:00.000Z"
}
```

#### Create patient approval request

```json
{
  "documentId": "required-document-id"
}
```

#### Patient approval response

```json
{
  "id": "approval-id",
  "documentId": "required-document-id",
  "patientId": "patient-id",
  "status": "PENDING",
  "rejectedReason": null,
  "createdAt": "2026-06-22T12:00:00.000Z",
  "updatedAt": "2026-06-22T12:00:00.000Z"
}
```

#### Approve request

```json
{
  "organizationUserId": "organization-user-id"
}
```

#### Reject request

```json
{
  "organizationUserId": "organization-user-id",
  "rejectedReason": "Documento ilegível."
}
```

#### Reset to pending request

```json
{
  "organizationUserId": "organization-user-id"
}
```

#### Audit log response

```json
{
  "id": "log-id",
  "action": "REJECTED_DOCUMENT",
  "patientApprovalId": "approval-id",
  "organizationUserId": "organization-user-id",
  "createdAt": "2026-06-22T12:00:00.000Z"
}
```

### Key Entities *(include if feature involves data)*

- **OrganizationRequiredDocument**: Documento exigido configurado por uma organização. Atributos principais: `id`, `organizationId`, `name`, timestamps quando disponíveis. Representa somente o tipo/configuração do documento exigido, não um arquivo.
- **OrganizationDocumentPatientApproval**: Aggregate Root do workflow de aprovação para um documento exigido e um paciente. Atributos principais: `id`, `documentId`, `patientId`, `status`, `rejectedReason`, timestamps quando disponíveis.
- **OrganizationDocumentApprovalLog**: Registro de auditoria append-only de ações realizadas sobre uma aprovação. Atributos principais: `id`, `action`, `patientApprovalId`, `organizationUserId`, `createdAt`.
- **DocumentApprovalStatus**: Conjunto de status permitidos para uma aprovação: `PENDING`, `REJECTED`, `APPROVED`.
- **DocumentApprovalAction**: Conjunto de ações auditáveis: `CREATED_PATIENT_DOCUMENT_APPROVAL`, `APPROVED_DOCUMENT`, `REJECTED_DOCUMENT`, `RESET_DOCUMENT_TO_PENDING`.
- **Patient**: Paciente existente que deve pertencer à organização da rota para receber aprovações de documentos.
- **Organization User**: Usuário da organização identificado por `organizationUserId` como ator das ações auditáveis. Permissões reais e RBAC ficam fora desta feature.
- **Tenant Ownership**: `organizationId` da rota é a chave de escopo para documentos exigidos, pacientes, aprovações e logs.
- **Shared Contracts**: Payloads e responses dos documentos exigidos, aprovações, ações de approve/reject/reset, listagem de logs, status de aprovação, ações de auditoria e erros estruturados.

### Constitution Alignment *(mandatory)*

- **Affected Packages**: API e documentação da feature. Web/UI ficam fora de escopo.
- **Tenant/White-Label Impact**: Todos os documentos exigidos, aprovações e logs são escopados por organização. A feature não altera branding, domínio customizado, logo, textos de portal ou outras configurações white-label.
- **Contract/Typing Impact**: Define contratos backend para configuração de documentos exigidos, aprovações por paciente, transições de status, auditoria e erros esperados. Enums de status e ação devem permanecer consistentes nos contratos.
- **Clean-Code Boundaries**: Regras de status, motivo de rejeição, unicidade e auditoria pertencem ao domínio e aos casos de uso. Entrada externa é validada na boundary de entrada. Detalhes de transporte, persistência e infraestrutura não devem vazar para domínio ou aplicação.
- **Verification Scope**: Deve cobrir CRUD de documentos exigidos, unicidade por organização, bloqueio de remoção quando houver aprovações, criação/listagem de aprovações, validação de paciente/documento na organização, transições approve/reject/reset, logs append-only, erros estruturados, isolamento tenant e ausência de frontend/upload/storage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos fluxos de criar, listar, atualizar e remover documentos exigidos funcionam para uma organização quando as regras de unicidade e uso são respeitadas.
- **SC-002**: 100% das tentativas de criar ou renomear documento exigido com nome duplicado na mesma organização são rejeitadas, enquanto o mesmo nome em outra organização é aceito.
- **SC-003**: 100% das aprovações criadas para documento e paciente válidos iniciam com status `PENDING` e `rejectedReason` vazio.
- **SC-004**: 100% das tentativas de duplicar aprovação para o mesmo documento e paciente são rejeitadas.
- **SC-005**: 100% das operações de aprovar, rejeitar e resetar atualizam status e `rejectedReason` conforme as regras definidas.
- **SC-006**: 100% das rejeições sem motivo válido são recusadas sem alterar a aprovação e sem criar log.
- **SC-007**: 100% das operações approve/reject/reset bem-sucedidas criam exatamente um novo log append-only com o ator da organização informado.
- **SC-008**: 100% dos testes de isolamento impedem documento, paciente, aprovação ou log de outra organização de aparecer ou ser alterado pela organização atual.
- **SC-009**: 95% das operações backend válidas desta feature concluem em menos de 2 segundos em ambiente normal de desenvolvimento ou homologação.
- **SC-010**: A verificação confirma que nenhum endpoint, payload ou resposta desta feature manipula upload real, arquivo físico, storage, presigned URL, download, visualização, OCR ou validação real de arquivo.
- **SC-011**: A verificação confirma que nenhum arquivo de frontend é necessário ou alterado para entregar esta feature.

## Assumptions

- Organizações, pacientes e usuários da organização já existem antes desta feature; esta feature apenas referencia esses registros.
- `organizationUserId` é obrigatório para approve, reject e reset porque essas ações sempre geram auditoria.
- Permissões reais, RBAC, autenticação e autorização não são validadas nesta feature; o identificador do usuário da organização é tratado como ator informado na operação.
- A ausência de arquivo é intencional: a aprovação representa o estado administrativo do documento exigido para o paciente, não um upload.
- Quando uma aprovação é resetada para pendente, isso representa o comportamento futuro de reenvio pelo paciente sem armazenar metadados ou arquivo nesta etapa.
- Logs de auditoria são mantidos indefinidamente como registros append-only, salvo política global futura de retenção de dados.
- Erros seguem o padrão estruturado existente da API para validação, não encontrado, conflito e falha inesperada.

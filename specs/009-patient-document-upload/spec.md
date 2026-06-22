# Feature Specification: Upload Backend de Documentos do Paciente

**Feature Branch**: `[009-patient-document-upload]`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "Crie uma spec para upload backend de documentos do paciente usando Cloudflare R2. Escopo: apenas back-end. Não implementar frontend, UI, componentes, cookies, IronSession, autenticação nova, RBAC novo ou fluxo visual."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enviar arquivo para uma aprovação de documento (Priority: P1)

Como paciente ou fluxo backend autorizado existente, quero enviar o arquivo referente a um documento exigido já vinculado ao paciente para que a organização possa avaliar o documento posteriormente.

**Why this priority**: O upload é o valor principal desta feature; sem ele, as aprovações continuam sem evidência documental para análise.

**Independent Test**: Enviar um arquivo válido para uma aprovação existente do paciente e verificar que o arquivo é armazenado, os metadados são persistidos, o status volta para `PENDING`, o motivo de rejeição é limpo e um log de upload é criado.

**Acceptance Scenarios**:

1. **Given** uma aprovação de documento existente para o paciente e organização informados, **When** um arquivo válido é enviado, **Then** o sistema armazena o arquivo, salva `fileName`, `mimeType`, `size` e `storageKey`, retorna a aprovação atualizada e registra log `UPLOADED_DOCUMENT`.
2. **Given** uma aprovação rejeitada com `rejectedReason`, **When** o paciente reenvia um arquivo válido, **Then** o status volta para `PENDING`, `rejectedReason` fica vazio, os metadados do arquivo são substituídos e um novo log de upload é criado.
3. **Given** uma aprovação inexistente, de outro paciente ou de outra organização, **When** o upload é solicitado pela rota atual, **Then** o sistema rejeita a operação sem armazenar arquivo e sem alterar metadados.

---

### User Story 2 - Consultar aprovações com link temporário de arquivo (Priority: P2)

Como usuário que consulta aprovações de documentos do paciente, quero receber uma URL de acesso gerada no momento da consulta quando houver arquivo enviado para que o arquivo possa ser visualizado ou baixado sem salvar URL fixa no banco.

**Why this priority**: Após o upload, a organização precisa acessar o arquivo para revisar a aprovação; a URL dinâmica evita expor ou persistir links permanentes.

**Independent Test**: Listar aprovações de um paciente com e sem arquivo enviado e verificar que aprovações com `storageKey` recebem `fileUrl`, enquanto aprovações sem arquivo retornam `fileUrl: null`.

**Acceptance Scenarios**:

1. **Given** uma aprovação possui `storageKey`, **When** a aprovação é retornada em uma consulta, **Then** a resposta inclui `fileUrl` gerada naquele momento e não expõe credenciais de armazenamento.
2. **Given** uma aprovação ainda não possui arquivo, **When** a aprovação é retornada em uma consulta, **Then** a resposta inclui `fileUrl: null` e mantém os metadados de arquivo como nulos.
3. **Given** uma consulta de aprovações para um paciente e organização, **When** existem aprovações de outros pacientes ou organizações, **Then** o sistema retorna somente aprovações pertencentes ao escopo solicitado.

---

### User Story 3 - Rejeitar entradas inválidas de upload (Priority: P3)

Como operador do sistema, quero que uploads inválidos sejam recusados antes de alterar a aprovação para evitar arquivos ausentes, vazios, grandes demais ou de tipo não permitido.

**Why this priority**: Validações protegem custo, integridade operacional e previsibilidade do processo sem implementar análise real de conteúdo do documento.

**Independent Test**: Tentar enviar upload sem arquivo, com nome ausente, MIME ausente, tamanho zero, tamanho acima do limite ou MIME não permitido e verificar que cada caso é rejeitado sem metadados, status ou logs novos.

**Acceptance Scenarios**:

1. **Given** uma requisição sem arquivo, **When** o upload é processado, **Then** o sistema retorna erro de validação e não altera a aprovação.
2. **Given** um arquivo com tipo MIME fora da lista permitida, **When** o upload é processado, **Then** o sistema rejeita a operação sem armazenar o arquivo.
3. **Given** um arquivo maior que o limite configurado, **When** o upload é processado, **Then** o sistema rejeita a operação sem armazenar o arquivo.

### Edge Cases

- Upload para aprovação inexistente, removida, de outro paciente ou de outra organização deve ser rejeitado.
- Upload sem arquivo, com arquivo vazio ou tamanho igual a zero deve ser rejeitado.
- Upload com `fileName` ausente, vazio ou contendo somente espaços deve ser rejeitado.
- Upload com `mimeType` ausente, vazio ou não permitido deve ser rejeitado.
- Upload acima do limite máximo configurado deve ser rejeitado antes de atualizar a aprovação.
- Se uma aprovação já possui arquivo anterior, o novo upload deve substituir os metadados atuais, retornar status para `PENDING` e limpar `rejectedReason`; a exclusão do arquivo antigo fica fora de escopo.
- Se a persistência dos metadados falhar depois do armazenamento, o erro deve ser estruturado; limpeza compensatória do objeto recém-enviado fica para decisão de implementação segura no plano.
- Se a geração de URL temporária falhar durante uma consulta, o sistema deve retornar erro estruturado sem expor credenciais.
- `storageKey` deve ser único o suficiente para evitar sobrescrita acidental entre reenvios.
- Nenhuma resposta deve expor bucket, access key, secret, account id ou credenciais equivalentes.
- Nenhum campo de URL final fixa deve ser salvo no banco.
- A feature não deve alterar edição de documentos exigidos, aprovação/rejeição manual, RBAC ou autenticação.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow backend upload of one file for an existing patient document approval.
- **FR-002**: System MUST expose upload through `POST /organizations/:organizationId/patients/:patientId/document-approvals/:approvalId/upload`.
- **FR-003**: Upload input MUST be accepted as `multipart/form-data` with exactly one required file for this approval.
- **FR-004**: System MUST reject upload requests when the file is missing.
- **FR-005**: System MUST reject uploads whose original `fileName` is absent, null, empty, or whitespace-only.
- **FR-006**: System MUST reject uploads whose `mimeType` is absent, null, empty, or outside the allowed set.
- **FR-007**: System MUST initially allow only `application/pdf`, `image/jpeg`, and `image/png` unless configuration narrows or extends the allowed set.
- **FR-008**: System MUST reject uploads whose `size` is absent, zero, negative, or greater than the configured maximum.
- **FR-009**: The maximum document upload size MUST be configurable by environment or deployment configuration.
- **FR-010**: System MUST verify that the approval exists before uploading or updating metadata.
- **FR-011**: System MUST verify that the approval belongs to the `organizationId` in the route.
- **FR-012**: System MUST verify that the approval belongs to the `patientId` in the route.
- **FR-013**: System MUST store the uploaded file in Cloudflare R2.
- **FR-014**: System MUST generate the `storageKey` on the backend, not accept it from the caller.
- **FR-015**: The generated `storageKey` MUST include organization, patient, approval, timestamp, and a safe version of the original filename or equivalent information sufficient for traceability and uniqueness.
- **FR-016**: System MUST persist `fileName`, `mimeType`, `size`, and `storageKey` on the patient document approval after successful upload.
- **FR-017**: `fileName` MUST store the original file name after safe normalization needed for metadata.
- **FR-018**: `mimeType` MUST store the validated MIME type.
- **FR-019**: `size` MUST store the file size in bytes.
- **FR-020**: `storageKey` MUST store the object key/reference used to locate the file in R2.
- **FR-021**: System MUST NOT persist a final public URL, temporary URL, signed URL, bucket name, access key, secret, or account credential in the approval record.
- **FR-022**: Every successful upload or reupload MUST set approval status to `PENDING`.
- **FR-023**: Every successful upload or reupload MUST set `rejectedReason` to `null`.
- **FR-024**: Every successful upload or reupload MUST append an approval log with action `UPLOADED_DOCUMENT`.
- **FR-025**: Upload logs MUST reference the affected approval.
- **FR-026**: Upload logs MAY include an optional patient or user actor identifier when an existing authenticated actor is available, but this feature MUST NOT require new authentication or RBAC.
- **FR-027**: System MUST keep approval logs append-only and MUST NOT add update or delete behavior for logs.
- **FR-028**: System MUST NOT delete or clean up previous uploaded files as part of this feature.
- **FR-029**: System MUST document old-file cleanup as future work when reupload replaces metadata.
- **FR-030**: List/get approval responses MUST include `fileName`, `mimeType`, `size`, `storageKey`, and `fileUrl`.
- **FR-031**: If an approval has no `storageKey`, response `fileUrl` MUST be `null`.
- **FR-032**: If an approval has a `storageKey`, response `fileUrl` MUST be generated at read time using the storage service.
- **FR-033**: System MUST NOT expose storage credentials, bucket identifiers, secret keys, or account identifiers in `fileUrl` or any API response.
- **FR-034**: System MUST update existing patient-approval list responses to include file metadata and generated `fileUrl`.
- **FR-035**: System SHOULD update any single approval response returned by upload or workflow actions to include the same file metadata shape for consistency.
- **FR-036**: System MUST return structured validation errors for invalid file, invalid MIME type, invalid size, missing approval, cross-organization approval, cross-patient approval, storage failure, URL generation failure, and unexpected failure.
- **FR-037**: System MUST preserve organization scope for every upload, metadata update, approval read, and URL generation.
- **FR-038**: System MUST keep domain rules independent of R2, storage SDKs, HTTP, multipart parsing, request validation libraries, and persistence adapters.
- **FR-039**: Application behavior MUST depend only on a storage interface for upload and URL generation.
- **FR-040**: Infrastructure MUST provide the concrete Cloudflare R2 storage behavior behind that interface.
- **FR-041**: System MUST NOT implement frontend, UI, visual preview, download proxy, OCR, document content validation, antivirus scanning, old-file deletion, file versioning, multiple files per approval, direct browser upload with presigned POST, new authentication, new RBAC, permission middleware, cookies, IronSession, or required-document editing in this feature.

### Expected Backend Operations

- `POST /organizations/:organizationId/patients/:patientId/document-approvals/:approvalId/upload`
- `GET /organizations/:organizationId/patients/:patientId/document-approvals`
- Any existing backend operation that returns a patient document approval should return the extended approval file metadata shape when feasible.

### Expected Upload Contract

`multipart/form-data` with one file part.

Expected upload response:

```json
{
  "id": "approval-id",
  "documentId": "required-document-id",
  "patientId": "patient-id",
  "status": "PENDING",
  "rejectedReason": null,
  "fileName": "receita.pdf",
  "mimeType": "application/pdf",
  "size": 123456,
  "storageKey": "organizations/org-1/patients/patient-1/documents/approval-1/20260622120000-receita.pdf",
  "fileUrl": "temporary-access-url",
  "createdAt": "2026-06-22T12:00:00.000Z",
  "updatedAt": "2026-06-22T12:00:00.000Z"
}
```

Expected approval list item:

```json
{
  "id": "approval-id",
  "documentId": "required-document-id",
  "patientId": "patient-id",
  "status": "PENDING",
  "rejectedReason": null,
  "fileName": "receita.pdf",
  "mimeType": "application/pdf",
  "size": 123456,
  "storageKey": "organizations/org-1/patients/patient-1/documents/approval-1/20260622120000-receita.pdf",
  "fileUrl": "temporary-access-url",
  "createdAt": "2026-06-22T12:00:00.000Z",
  "updatedAt": "2026-06-22T12:00:00.000Z"
}
```

Approval without uploaded file:

```json
{
  "fileName": null,
  "mimeType": null,
  "size": null,
  "storageKey": null,
  "fileUrl": null
}
```

### Storage Configuration Requirements

- **CFG-001**: The deployment MUST provide Cloudflare R2 account, access key, secret key, bucket, and URL-expiration configuration.
- **CFG-002**: The deployment MUST provide maximum upload size configuration.
- **CFG-003**: The deployment SHOULD allow MIME type allowlist configuration; if absent, the initial allowlist is PDF, JPEG, and PNG.
- **CFG-004**: If signed URLs are used, no public base URL is required; if public object access is chosen later, that decision must still avoid saving final URLs in approval records.

### Key Entities *(include if feature involves data)*

- **OrganizationDocumentPatientApproval**: Existing approval record for a required document and patient. This feature extends it with `fileName`, `mimeType`, `size`, and `storageKey`, while preserving `status`, `rejectedReason`, `documentId`, `patientId`, and organization scope.
- **Document File Metadata**: Metadata persisted on the approval after successful upload: original filename, MIME type, byte size, and storage reference. It does not include final URL or storage credentials.
- **DocumentStorageReference**: The backend-owned object key used to locate the uploaded file in Cloudflare R2. It must be generated by the backend and scoped by organization, patient, and approval.
- **OrganizationDocumentApprovalLog**: Existing append-only audit record for approval actions. This feature adds `UPLOADED_DOCUMENT` as an upload/reupload action.
- **DocumentStorageService**: Application-level storage capability for uploading document files and generating read-time access URLs. Domain rules do not depend on this service.
- **Tenant Ownership**: The approval upload and read flows are scoped by the route `organizationId`; the approval must also belong to the route `patientId`.
- **Shared Contracts**: Upload request contract, extended approval response, storage metadata fields, generated `fileUrl`, upload log action, validation errors, and storage configuration expectations.

### Constitution Alignment *(mandatory)*

- **Affected Packages**: API and feature documentation only. Web/UI remain out of scope.
- **Tenant/White-Label Impact**: Uploads, metadata, generated file URLs, and logs are scoped to the organization and patient in the route. No branding, custom domain, portal copy, or visual white-label setting changes are included.
- **Contract/Typing Impact**: Extends patient document approval responses with file metadata and `fileUrl`; adds upload request contract; adds `UPLOADED_DOCUMENT` log action; adds storage-related validation and error contracts.
- **Clean-Code Boundaries**: Domain owns approval status and rejection-reason invariants. Application orchestrates upload through a storage interface. Infrastructure owns Cloudflare R2 integration. Presentation owns multipart parsing, input validation, and response shaping. Persistence stores metadata and storage reference only.
- **Verification Scope**: Must cover successful upload, reupload reset behavior, metadata persistence, log creation, generated file URL behavior, validation failures, tenant isolation, storage failure handling, absence of saved final URLs, and absence of frontend/auth/RBAC changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid uploads for approvals in the requested organization and patient persist file metadata and storage reference.
- **SC-002**: 100% of successful uploads and reuploads set approval status to `PENDING` and clear `rejectedReason`.
- **SC-003**: 100% of successful uploads and reuploads create exactly one append-only `UPLOADED_DOCUMENT` log.
- **SC-004**: 100% of approval list responses include `fileName`, `mimeType`, `size`, `storageKey`, and `fileUrl`.
- **SC-005**: 100% of approvals without a stored file return `fileUrl: null`.
- **SC-006**: 100% of approvals with a stored file return a generated access URL without exposing storage credentials.
- **SC-007**: 100% of invalid uploads due to missing file, invalid filename, invalid MIME type, invalid size, oversized file, missing approval, wrong organization, or wrong patient are rejected without updating approval metadata or adding logs.
- **SC-008**: 100% of verification checks confirm that no final public URL is persisted in the database.
- **SC-009**: 95% of valid upload requests within the configured size limit complete in under 5 seconds in a normal development or homologation environment.
- **SC-010**: 95% of approval list requests with generated file URLs complete in under 2 seconds for typical patient approval counts.
- **SC-011**: Verification confirms that no frontend files, UI flows, cookies, IronSession, new authentication, new RBAC, or permission middleware are required or changed.

## Assumptions

- The existing required-document and patient-document-approval backend feature is available and remains the source of truth for document requirements and approval status.
- Existing authentication context may not yet identify the patient actor for upload; this spec allows an optional actor identifier for logs without requiring new auth or RBAC.
- Reupload means replacing approval metadata with the new file metadata and leaving any previous object cleanup as future work.
- The initial upload model supports one file per approval, not file history or multiple attachments.
- The default allowed MIME types are PDF, JPEG, and PNG.
- The maximum upload size is configured per environment; planning will choose the concrete default if the deployment does not already define one.
- File content validation, antivirus scanning, OCR, visual preview, and semantic document verification are future capabilities, not part of this feature.

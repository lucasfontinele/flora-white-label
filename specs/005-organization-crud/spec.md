# Feature Specification: CRUD de Organizações Master

**Feature Branch**: `005-organization-crud`

**Created**: 2026-06-18

**Status**: Draft

**Input**: User description: "Crie uma spec para o recurso de CRUD de Organizações/Associações no backoffice master. O recurso é Organization. No cadastro de organização, o endereço deve ser criado junto. Organization deve ser Aggregate Root; Address deve ser Entity persistível independente, mas criada junto da organização. SubscriptionPlan já existe e deve ser usado como plano atual por currentPlanId. Criar endpoints POST, GET list, GET by ID, PUT e DELETE em /backoffice/organizations, sem autorização real, middleware master, login ou UI. Incluir validações de CNPJ, CNAE, CEP, UF brasileira, plano existente, CNPJ único, requests/responses esperados, erros esperados e escopo fora."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar Organização com Endereço (Priority: P1)

Como operador do backoffice master, quero cadastrar uma organização informando seus dados fiscais, plano atual e endereço principal para que uma nova associação exista no sistema multitenant com os dados mínimos necessários para operação.

**Why this priority**: O cadastro é o ponto de entrada do recurso; sem ele não há organização para consultar, atualizar ou remover, e o plano atual precisa existir para manter a organização vinculada a uma oferta válida.

**Independent Test**: Pode ser testado enviando uma criação com organização, plano existente e endereço válidos, confirmando que a resposta retorna a organização criada com endereço e plano atual mínimo, com CNPJ, CNAE e CEP normalizados.

**Acceptance Scenarios**:

1. **Given** existe um plano de assinatura cadastrado, **When** o operador cria uma organização com dados obrigatórios, CNPJ válido, CNAE principal válido, CNAEs secundários válidos e endereço válido, **Then** o sistema cria a organização e seu endereço e retorna os dados consolidados.
2. **Given** a criação informa CNPJ, CNAE principal, CNAEs secundários e CEP com máscara, **When** a requisição é processada, **Then** o sistema aceita os valores e retorna esses campos normalizados sem máscara.
3. **Given** a criação informa `secondaryCnaes` ausente ou como lista vazia, **When** os demais dados são válidos, **Then** o sistema cria a organização com lista vazia de CNAEs secundários.
4. **Given** o plano informado não existe, **When** o operador tenta criar a organização, **Then** o sistema rejeita a criação com erro de plano não encontrado e não cria organização nem endereço.
5. **Given** o CNPJ informado já pertence a outra organização, **When** o operador tenta criar uma nova organização com esse CNPJ, **Then** o sistema rejeita a criação com erro de CNPJ duplicado.

---

### User Story 2 - Consultar Organizações (Priority: P2)

Como operador do backoffice master, quero listar organizações e consultar uma organização específica para revisar os dados cadastrais, o endereço e o plano atual antes de executar ações administrativas.

**Why this priority**: A operação master precisa localizar organizações existentes e verificar seus dados consolidados para suporte, auditoria operacional e manutenção cadastral.

**Independent Test**: Pode ser testado criando organizações de exemplo, consultando a lista e buscando uma organização por ID para verificar que cada resposta inclui organização, endereço e plano atual mínimo.

**Acceptance Scenarios**:

1. **Given** existem organizações cadastradas, **When** o operador lista organizações, **Then** o sistema retorna uma coleção com os dados de cada organização, seu endereço e seu plano atual mínimo.
2. **Given** não existem organizações cadastradas, **When** o operador lista organizações, **Then** o sistema retorna uma lista vazia sem erro.
3. **Given** existe uma organização cadastrada, **When** o operador busca por seu ID, **Then** o sistema retorna a organização com endereço e plano atual mínimo.
4. **Given** o ID informado não corresponde a uma organização existente, **When** o operador busca por esse ID, **Then** o sistema retorna erro de organização não encontrada.

---

### User Story 3 - Atualizar Organização e Endereço (Priority: P3)

Como operador do backoffice master, quero substituir os dados cadastrais da organização e do endereço no mesmo endpoint para manter razão social, nome fantasia, dados fiscais, plano atual e endereço consistentes em uma única operação.

**Why this priority**: Dados de organização e endereço mudam ao longo do tempo; atualizá-los juntos reduz inconsistência entre o registro principal e o endereço associado.

**Independent Test**: Pode ser testado criando uma organização, enviando uma atualização completa válida e confirmando que consultas posteriores retornam os novos dados de organização e endereço.

**Acceptance Scenarios**:

1. **Given** existe uma organização com endereço, **When** o operador envia uma atualização completa com organização e endereço válidos, **Then** o sistema atualiza ambos e retorna a organização consolidada.
2. **Given** a atualização troca `currentPlanId` para outro plano existente, **When** os demais campos são válidos, **Then** o sistema altera o plano atual retornado na organização.
3. **Given** a atualização informa um plano inexistente, CNPJ inválido, CNAE inválido, CEP inválido ou UF inválida, **When** a requisição é processada, **Then** o sistema rejeita a atualização e preserva os dados anteriores.
4. **Given** a atualização informa CNPJ já usado por outra organização, **When** a requisição é processada, **Then** o sistema rejeita a alteração com erro de CNPJ duplicado.
5. **Given** a atualização omite campos obrigatórios de organização ou endereço, **When** o endpoint de substituição completa é usado, **Then** o sistema rejeita a requisição como payload inválido.

---

### User Story 4 - Remover Organização (Priority: P4)

Como operador do backoffice master, quero remover uma organização cadastrada incorretamente para manter o cadastro master limpo quando uma associação não deve mais existir no backoffice.

**Why this priority**: A remoção completa o ciclo CRUD, mas vem depois das operações de criação, consulta e atualização porque depende de uma organização já existente.

**Independent Test**: Pode ser testado criando uma organização, removendo-a e confirmando que ela não aparece na lista nem pode ser encontrada por ID.

**Acceptance Scenarios**:

1. **Given** existe uma organização cadastrada, **When** o operador remove essa organização, **Then** o sistema conclui a remoção e a organização deixa de aparecer nas consultas.
2. **Given** o ID informado não corresponde a uma organização existente, **When** o operador tenta remover a organização, **Then** o sistema retorna erro de organização não encontrada.
3. **Given** a organização possui endereço criado junto dela, **When** a organização é removida, **Then** o sistema garante que o endereço associado não fique disponível como dado órfão dentro deste recurso.

### Edge Cases

- `tradeName` ou `legalName` contém apenas espaços, quebras de linha ou tabs.
- CNPJ é enviado com máscara, sem máscara, com caracteres não numéricos extras, com tamanho diferente de 14 dígitos, com todos os dígitos iguais ou com dígitos verificadores inválidos quando essa validação estiver disponível.
- CNPJ normalizado já existe em outra organização.
- `primaryCnae` ou algum item de `secondaryCnaes` é enviado com máscara, sem máscara, com caracteres extras, com menos ou mais de 7 dígitos, duplicado na lista ou igual ao CNAE principal.
- `secondaryCnaes` é omitido, nulo, lista vazia, lista com item inválido ou lista com valores repetidos.
- `currentPlanId` é ausente, vazio, malformado ou aponta para plano inexistente.
- `zipcode` é enviado com máscara, sem máscara, com caracteres extras, com menos ou mais de 8 dígitos.
- `state` é enviada em minúsculas, com espaços ao redor, com nome completo de estado ou com UF inexistente.
- `title` e `complement` do endereço são omitidos, nulos, strings vazias ou strings com espaços ao redor.
- Campos extras aparecem no corpo de criação ou atualização.
- A lista de organizações está vazia.
- O ID da rota está ausente, vazio, malformado, não existe ou pertence a registro já removido.
- A criação ou atualização falha depois de validar parte dos dados; a operação não deve deixar organização ou endereço parcialmente persistidos.
- O prefixo `/backoffice` identifica apenas o contexto técnico master nesta slice; autenticação, autorização real e erro obrigatório de permissão ficam fora de escopo.
- Dados operacionais tenant-scoped, pacientes, responsáveis, usuários e configurações visuais da organização não devem aparecer neste CRUD.
- Configurações de white-label ou branding de organizações não existem ou estão incompletas; este recurso não depende delas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST oferecer CRUD completo de organizações no contexto técnico de backoffice master pelo prefixo `/backoffice`.
- **FR-002**: O sistema MUST expor operações para criar, listar, buscar por ID, atualizar por substituição completa e remover organizações.
- **FR-003**: O sistema MUST NOT implementar autorização real, middleware de permissão, validação de perfil Master, login ou erro 403 obrigatório nesta slice.
- **FR-004**: `Organization` MUST ser tratada como Aggregate Root do recurso de organização.
- **FR-005**: `Address` MUST ser uma Entity persistível independente, criada junto da organização no cadastro.
- **FR-006**: A criação de organização MUST receber dados de organização e endereço na mesma requisição.
- **FR-007**: A criação MUST criar a organização e o endereço como uma única operação lógica; se qualquer parte falhar, nenhuma das duas deve ficar criada.
- **FR-008**: A atualização MUST usar substituição completa via `PUT`; todos os campos obrigatórios de organização e endereço devem ser enviados.
- **FR-009**: A atualização MUST permitir alterar dados da organização e do endereço associado na mesma requisição.
- **FR-010**: A atualização MUST preservar os dados anteriores quando qualquer validação, lookup de plano, conflito de CNPJ ou persistência falhar.
- **FR-011**: A remoção MUST remover a organização existente e garantir que o endereço associado não permaneça disponível como dado órfão deste recurso.
- **FR-012**: `tradeName` MUST ser obrigatório, textual e conter ao menos um caractere após normalização de espaços externos.
- **FR-013**: `legalName` MUST ser obrigatório, textual e conter ao menos um caractere após normalização de espaços externos.
- **FR-014**: `cnpj` MUST ser obrigatório e único entre organizações após normalização.
- **FR-015**: `cnpj` MUST aceitar entrada com ou sem máscara, remover caracteres não numéricos e ser armazenado e retornado com exatamente 14 dígitos.
- **FR-016**: `cnpj` MUST validar formato estrutural e MUST validar dígitos verificadores quando o projeto já possuir helper ou quando a implementação simples estiver dentro do escopo técnico da entrega.
- **FR-017**: `primaryCnae` MUST ser obrigatório.
- **FR-018**: `primaryCnae` MUST aceitar entrada com ou sem máscara, remover caracteres não numéricos e ser armazenado e retornado com exatamente 7 dígitos.
- **FR-019**: `secondaryCnaes` MUST ser opcional e, quando ausente, tratado como lista vazia.
- **FR-020**: Cada item de `secondaryCnaes` MUST aceitar entrada com ou sem máscara, remover caracteres não numéricos e ser armazenado e retornado com exatamente 7 dígitos.
- **FR-021**: O sistema MUST validar CNAE apenas pelo formato estrutural de 7 dígitos, sem consultar base oficial nesta spec.
- **FR-022**: `currentPlanId` MUST ser obrigatório e apontar para um `SubscriptionPlan` existente.
- **FR-023**: A resposta MUST retornar o plano atual mínimo associado à organização.
- **FR-024**: `addressId` MUST existir na organização persistida; no endpoint de criação, esse identificador é gerado a partir do endereço criado junto.
- **FR-025**: `zipcode` MUST ser obrigatório, aceitar entrada com ou sem máscara, remover caracteres não numéricos e ser armazenado e retornado com exatamente 8 dígitos.
- **FR-026**: `street` MUST ser obrigatório, textual e conter ao menos um caractere após normalização de espaços externos.
- **FR-027**: `neighborhood` MUST ser obrigatório, textual e conter ao menos um caractere após normalização de espaços externos.
- **FR-028**: `city` MUST ser obrigatório, textual e conter ao menos um caractere após normalização de espaços externos.
- **FR-029**: `state` MUST ser obrigatório e corresponder a uma UF brasileira válida.
- **FR-030**: `state` MUST ser normalizado para UF em letras maiúsculas.
- **FR-031**: `title` do endereço MUST ser opcional e aceitar valor nulo.
- **FR-032**: `complement` do endereço MUST ser opcional e aceitar valor nulo.
- **FR-033**: O sistema MUST retornar organização com `id`, `tradeName`, `legalName`, `cnpj`, `primaryCnae`, `secondaryCnaes`, `currentPlan`, `address`, e timestamps quando disponíveis.
- **FR-034**: A listagem MUST retornar uma coleção de organizações, cada uma com endereço e plano atual mínimo.
- **FR-035**: A listagem MUST retornar lista vazia quando não houver organizações cadastradas.
- **FR-036**: Busca, atualização e remoção por ID inexistente MUST retornar erro de organização não encontrada.
- **FR-037**: Payload inválido, CNPJ inválido, CNAE inválido, CEP inválido e UF inválida MUST retornar erros distinguíveis.
- **FR-038**: Plano inexistente MUST retornar erro de plano não encontrado.
- **FR-039**: CNPJ duplicado MUST retornar erro de conflito.
- **FR-040**: Erros inesperados MUST retornar resposta estruturada sem expor detalhes internos.
- **FR-041**: O recurso MUST NOT criar endpoints separados de endereço.
- **FR-042**: O recurso MUST NOT criar UI, usuários da organização, pacientes, responsáveis, configurações visuais, upload de logo, billing real, gateway de pagamento, seed obrigatório de planos ou histórico de troca de plano.
- **FR-043**: O recurso MUST manter dados operacionais tenant-scoped fora das respostas deste CRUD master.
- **FR-044**: O recurso MUST preservar respostas de erro estruturadas e consistentes com o padrão da API existente.

### Key Entities *(include if feature involves data)*

- **Organization**: Aggregate Root que representa uma associação/organização cliente no sistema multitenant. Atributos principais: `id`, `tradeName`, `legalName`, `cnpj`, `primaryCnae`, `secondaryCnaes`, `currentPlanId`, `addressId`, `createdAt` e `updatedAt`.
- **Address**: Entity persistível independente que representa o endereço associado à organização neste CRUD. Atributos principais: `id`, `title`, `zipcode`, `street`, `neighborhood`, `complement`, `city`, `state`, `createdAt` e `updatedAt` quando disponíveis.
- **SubscriptionPlan**: Entidade já existente que representa o plano atual da organização. A organização referencia o plano por `currentPlanId`; as respostas retornam apenas um resumo mínimo do plano atual.
- **Cnpj**: Value Object que aceita entrada com ou sem máscara, normaliza para 14 dígitos e valida formato estrutural, com dígitos verificadores quando viável no projeto.
- **Cnae**: Value Object que aceita entrada com ou sem máscara, normaliza para 7 dígitos e valida apenas formato estrutural.
- **Brazilian UF**: Conjunto de unidades federativas válidas usado para validar e normalizar `state`.
- **Tenant Ownership**: `Organization` representa o cadastro raiz de um tenant. Ela não é filtrada por `organizationId` neste CRUD porque o próprio recurso administra organizações no contexto master global. Dados operacionais de tenants não fazem parte desta resposta.
- **Shared Contracts**: O contrato do recurso inclui os payloads de criação, atualização, resposta, erro e os campos de `OrganizationResponse`. Contratos compartilhados do monorepo só devem ser alterados se a arquitetura atual do projeto exigir esse compartilhamento para endpoints de API.

### Constitution Alignment *(mandatory)*

- **Affected Packages**: API e documentação da feature. Web/UI ficam fora de escopo.
- **Tenant/White-Label Impact**: A feature administra organizações no contexto master global. Ela cria o registro raiz do tenant e não expõe dados operacionais tenant-scoped, branding, logo, domínio customizado ou configurações visuais.
- **Contract/Typing Impact**: Define contratos de request/response para o CRUD de organizações, incluindo organização, endereço, plano atual mínimo e erros esperados. Tipos compartilhados só devem ser promovidos se o projeto já exigir esse padrão para contratos de API.
- **Clean-Code Boundaries**: Regras de organização, CNPJ, CNAE, endereço e UF pertencem ao domínio apropriado; casos de uso orquestram criação, consulta, atualização e remoção; persistência e transporte permanecem em suas fronteiras.
- **Verification Scope**: Deve cobrir criação atômica de organização/endereço, normalização e validação de CNPJ/CNAE/CEP/UF, plano inexistente, CNPJ duplicado, busca/listagem, atualização completa, remoção, respostas estruturadas de erro e ausência de autorização real obrigatória nesta slice.

### API Endpoints and Payloads

#### `POST /backoffice/organizations`

Cria uma organização e seu endereço em uma única operação lógica.

**Request Body**:

```json
{
  "organization": {
    "tradeName": "ABECMED",
    "legalName": "Associação Brasileira de Cannabis Medicinal",
    "cnpj": "11.222.333/0001-81",
    "primaryCnae": "8630-5/03",
    "secondaryCnaes": ["9499-5/00"],
    "currentPlanId": "plan-id"
  },
  "address": {
    "title": "Sede",
    "zipcode": "77000-000",
    "street": "Rua Exemplo",
    "neighborhood": "Centro",
    "complement": "Sala 01",
    "city": "Palmas",
    "state": "TO"
  }
}
```

**Response 201**:

```json
{
  "id": "organization-id",
  "tradeName": "ABECMED",
  "legalName": "Associação Brasileira de Cannabis Medicinal",
  "cnpj": "11222333000181",
  "primaryCnae": "8630503",
  "secondaryCnaes": ["9499500"],
  "currentPlan": {
    "id": "plan-id",
    "title": "Plano Essencial",
    "priceInCents": 15000,
    "operatorsLimit": 5,
    "patientsLimit": 100
  },
  "address": {
    "id": "address-id",
    "title": "Sede",
    "zipcode": "77000000",
    "street": "Rua Exemplo",
    "neighborhood": "Centro",
    "complement": "Sala 01",
    "city": "Palmas",
    "state": "TO"
  },
  "createdAt": "2026-06-18T00:00:00.000Z",
  "updatedAt": "2026-06-18T00:00:00.000Z"
}
```

#### `GET /backoffice/organizations`

Lista organizações cadastradas no backoffice master.

**Response 200**:

```json
{
  "data": [
    {
      "id": "organization-id",
      "tradeName": "ABECMED",
      "legalName": "Associação Brasileira de Cannabis Medicinal",
      "cnpj": "11222333000181",
      "primaryCnae": "8630503",
      "secondaryCnaes": ["9499500"],
      "currentPlan": {
        "id": "plan-id",
        "title": "Plano Essencial",
        "priceInCents": 15000,
        "operatorsLimit": 5,
        "patientsLimit": 100
      },
      "address": {
        "id": "address-id",
        "title": "Sede",
        "zipcode": "77000000",
        "street": "Rua Exemplo",
        "neighborhood": "Centro",
        "complement": "Sala 01",
        "city": "Palmas",
        "state": "TO"
      },
      "createdAt": "2026-06-18T00:00:00.000Z",
      "updatedAt": "2026-06-18T00:00:00.000Z"
    }
  ]
}
```

#### `GET /backoffice/organizations/:id`

Busca uma organização por ID.

**Response 200**:

```json
{
  "id": "organization-id",
  "tradeName": "ABECMED",
  "legalName": "Associação Brasileira de Cannabis Medicinal",
  "cnpj": "11222333000181",
  "primaryCnae": "8630503",
  "secondaryCnaes": ["9499500"],
  "currentPlan": {
    "id": "plan-id",
    "title": "Plano Essencial",
    "priceInCents": 15000,
    "operatorsLimit": 5,
    "patientsLimit": 100
  },
  "address": {
    "id": "address-id",
    "title": "Sede",
    "zipcode": "77000000",
    "street": "Rua Exemplo",
    "neighborhood": "Centro",
    "complement": "Sala 01",
    "city": "Palmas",
    "state": "TO"
  },
  "createdAt": "2026-06-18T00:00:00.000Z",
  "updatedAt": "2026-06-18T00:00:00.000Z"
}
```

#### `PUT /backoffice/organizations/:id`

Substitui completamente os dados editáveis da organização e do endereço associado. Todos os campos obrigatórios devem ser enviados.

**Request Body**:

```json
{
  "organization": {
    "tradeName": "Novo nome fantasia",
    "legalName": "Nova razão social",
    "cnpj": "11.222.333/0001-81",
    "primaryCnae": "8630-5/03",
    "secondaryCnaes": ["9499-5/00"],
    "currentPlanId": "plan-id"
  },
  "address": {
    "title": "Sede atualizada",
    "zipcode": "77000-000",
    "street": "Rua Atualizada",
    "neighborhood": "Centro",
    "complement": null,
    "city": "Palmas",
    "state": "TO"
  }
}
```

**Response 200**:

```json
{
  "id": "organization-id",
  "tradeName": "Novo nome fantasia",
  "legalName": "Nova razão social",
  "cnpj": "11222333000181",
  "primaryCnae": "8630503",
  "secondaryCnaes": ["9499500"],
  "currentPlan": {
    "id": "plan-id",
    "title": "Plano Essencial",
    "priceInCents": 15000,
    "operatorsLimit": 5,
    "patientsLimit": 100
  },
  "address": {
    "id": "address-id",
    "title": "Sede atualizada",
    "zipcode": "77000000",
    "street": "Rua Atualizada",
    "neighborhood": "Centro",
    "complement": null,
    "city": "Palmas",
    "state": "TO"
  },
  "createdAt": "2026-06-18T00:00:00.000Z",
  "updatedAt": "2026-06-18T00:00:00.000Z"
}
```

#### `DELETE /backoffice/organizations/:id`

Remove uma organização existente.

**Response 204**: sem corpo.

### Validation Rules

- **VR-001**: O corpo de criação e atualização deve conter os objetos `organization` e `address`.
- **VR-002**: Atualização via `PUT` é substituição completa; ausência de qualquer campo obrigatório invalida a requisição.
- **VR-003**: `tradeName` e `legalName` são obrigatórios e devem conter texto após trim.
- **VR-004**: `cnpj` deve ser obrigatório, único, normalizado para apenas números e conter exatamente 14 dígitos.
- **VR-005**: `cnpj` deve validar formato estrutural e dígitos verificadores quando houver helper existente ou implementação simples adequada.
- **VR-006**: `primaryCnae` deve ser obrigatório, normalizado para apenas números e conter exatamente 7 dígitos.
- **VR-007**: `secondaryCnaes` deve ser opcional; quando informado, todos os itens devem ser normalizados para apenas números e conter exatamente 7 dígitos.
- **VR-008**: CNAE deve aceitar formatos como `8630-5/03` e `8630503`.
- **VR-009**: CNAE não deve validar existência real em base oficial nesta spec.
- **VR-010**: `currentPlanId` deve ser obrigatório e referenciar plano existente.
- **VR-011**: `zipcode` deve ser obrigatório, normalizado para apenas números e conter exatamente 8 dígitos.
- **VR-012**: `street`, `neighborhood` e `city` são obrigatórios e devem conter texto após trim.
- **VR-013**: `state` deve ser obrigatório, normalizado para UF maiúscula e corresponder a uma UF brasileira válida.
- **VR-014**: `title` e `complement` do endereço são opcionais e podem ser nulos.
- **VR-015**: Strings opcionais enviadas como vazias após trim devem ser tratadas de forma consistente como ausência ou rejeição conforme o padrão de validação do projeto; a resposta final não deve persistir texto vazio para campos opcionais.
- **VR-016**: Campos extras no corpo da requisição devem ser rejeitados ou ignorados de forma consistente com o padrão da API existente; a spec não permite que campos extras alterem dados persistidos.
- **VR-017**: IDs de rota devem identificar uma organização válida; ID ausente, vazio ou malformado deve ser tratado como payload ou parâmetro inválido.

### Expected Errors

- **Payload inválido**: corpo ausente, objetos `organization` ou `address` ausentes, tipos incorretos, campos obrigatórios ausentes, campos obrigatórios vazios, ID de rota malformado ou contrato incompatível.
- **CNPJ inválido**: CNPJ com caracteres normalizados em quantidade diferente de 14 dígitos, formato estrutural inválido ou dígitos verificadores inválidos quando essa validação estiver disponível.
- **CNAE inválido**: CNAE principal ou secundário com quantidade diferente de 7 dígitos após normalização ou formato estrutural inválido.
- **CEP inválido**: CEP com quantidade diferente de 8 dígitos após normalização ou formato estrutural inválido.
- **UF inválida**: `state` ausente, vazio ou diferente de UF brasileira válida.
- **Plano não encontrado**: `currentPlanId` não corresponde a um `SubscriptionPlan` existente.
- **Organização não encontrada**: busca, atualização ou remoção usa ID sem organização correspondente.
- **CNPJ duplicado**: criação ou atualização tenta persistir CNPJ normalizado já usado por outra organização.
- **Erro inesperado**: falha não prevista durante processamento ou persistência, com resposta estruturada e sem detalhes internos.

### Out of Scope

- Autorização real, middleware master, validação de perfil Master, login e erro 403 obrigatório.
- Interface visual ou qualquer mudança de UI.
- Criação de usuários da organização.
- Pacientes, responsáveis ou outros cadastros operacionais do tenant.
- Configurações visuais da organização, branding, domínio customizado ou upload de logo.
- Billing real, gateway de pagamento e cobrança.
- Seed de planos, salvo se o projeto já exigir para que a feature seja verificável.
- Endpoints separados de endereço.
- Histórico de troca de plano.
- Validação de existência real de CNAE em base oficial.
- Integrações externas para consulta de CNPJ, CNAE, CEP ou endereço.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um operador consegue criar uma organização com endereço e plano existente em uma única operação válida em menos de 2 minutos durante validação manual do fluxo.
- **SC-002**: 100% das respostas de criação, consulta, listagem e atualização exibem CNPJ, CNAE e CEP normalizados conforme as regras desta spec.
- **SC-003**: 100% das tentativas com CNPJ duplicado, plano inexistente, CNAE inválido, CEP inválido ou UF inválida são rejeitadas sem criar ou alterar parcialmente organização e endereço.
- **SC-004**: A listagem e a busca por ID retornam organização, endereço e plano atual mínimo em formato consistente para todos os registros encontrados.
- **SC-005**: A atualização completa preserva os dados anteriores em 100% dos cenários de falha de validação, plano inexistente ou CNPJ duplicado.
- **SC-006**: O CRUD completo pode ser demonstrado sem UI, autorização real, login ou middleware de permissão, usando apenas o namespace `/backoffice`.

## Assumptions

- O `SubscriptionPlan` já existe e possui os campos mínimos necessários para retornar `id`, `title`, `priceInCents`, `operatorsLimit` e `patientsLimit`.
- A remoção de organização nesta spec pode ser física ou lógica conforme o padrão já adotado pelo projeto, desde que a organização removida não apareça nas consultas do CRUD.
- `secondaryCnaes` ausente equivale a lista vazia.
- Esta spec escolhe atualização completa via `PUT`; atualização parcial fica fora de escopo.
- O endpoint de criação gera o `addressId` a partir do endereço criado junto e associa esse ID à organização criada.
- Não há paginação, busca textual, filtros ou ordenação obrigatórios na listagem desta versão.
- A validação de dígitos verificadores de CNPJ deve ser usada se já existir helper no projeto ou se a implementação simples couber no planejamento sem dependência externa.
- Timestamps `createdAt` e `updatedAt` devem ser retornados quando disponíveis no modelo persistido.

# Feature Specification: CRUD de Planos de Assinatura Master

**Feature Branch**: `004-subscription-plan-crud`

**Created**: 2026-06-18

**Status**: Draft

**Input**: User description: "Criar o CRUD de `SubscriptionPlan` para o backoffice master, sem UI, com endpoints HTTP para criar, listar, buscar por ID, atualizar e remover planos de assinatura. O recurso deve respeitar o modelo atual com `title`, `description`, `price`, `operatorsLimit` e `patientsLimit`, manter valores monetarios em centavos, validar entradas, usar camadas Domain, Application, Infrastructure e Presentation, e usar `/backoffice` como namespace tecnico sem implementar autenticacao, autorizacao Master, middleware de permissao ou validacao de perfil nesta spec."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar Plano de Assinatura (Priority: P1)

Como operador do backoffice master, quero cadastrar um plano de assinatura com titulo, descricao opcional, preco e limites comerciais para que novas organizacoes possam ser associadas a uma oferta valida da plataforma.

**Why this priority**: Sem criacao de planos, o catalogo comercial nao pode evoluir e o cadastro de organizacoes fica limitado aos planos ja existentes.

**Independent Test**: Pode ser testado enviando uma requisicao de criacao com dados validos pelo contexto master e confirmando que o plano criado pode ser consultado com os mesmos valores, preservando o preco em centavos.

**Acceptance Scenarios**:

1. **Given** um operador no contexto do backoffice master, **When** ele cria um plano com titulo, preco em centavos, limite de operadores e limite de pacientes validos, **Then** o sistema registra o plano e retorna seus dados com identificador unico.
2. **Given** um plano sem descricao, **When** a criacao e enviada com os demais campos validos, **Then** o sistema registra o plano tratando a descricao como ausente.
3. **Given** uma tentativa de criacao com titulo em branco, preco invalido ou limites invalidos, **When** a requisicao e processada, **Then** o sistema rejeita a entrada e nenhum plano e criado.
4. **Given** esta slice sem autorizacao real, **When** a criacao e enviada para o prefixo `/backoffice`, **Then** o sistema trata o recurso como pertencente ao namespace tecnico de backoffice master sem validar perfil Master.

---

### User Story 2 - Consultar Planos de Assinatura (Priority: P2)

Como operador do backoffice master, quero listar os planos cadastrados e consultar um plano especifico para revisar ofertas comerciais antes de usa-las no cadastro ou manutencao de organizacoes.

**Why this priority**: A operacao master precisa enxergar o catalogo disponivel antes de criar organizacoes ou alterar ofertas existentes.

**Independent Test**: Pode ser testado criando planos de exemplo, consultando a lista e buscando um plano por ID para verificar que os dados retornados representam o catalogo master atual.

**Acceptance Scenarios**:

1. **Given** existem planos cadastrados, **When** o operador lista os planos, **Then** o sistema retorna todos os planos disponiveis com titulo, descricao, preco em centavos e limites.
2. **Given** nao existem planos cadastrados, **When** o operador lista os planos, **Then** o sistema retorna uma lista vazia sem erro.
3. **Given** um ID de plano existente, **When** o operador busca esse plano por ID, **Then** o sistema retorna os dados completos do plano.
4. **Given** um ID inexistente ou removido, **When** o operador busca esse plano por ID, **Then** o sistema retorna erro de plano nao encontrado.

---

### User Story 3 - Atualizar Plano de Assinatura (Priority: P3)

Como operador do backoffice master, quero atualizar os dados de um plano de assinatura para corrigir informacoes comerciais ou ajustar preco e limites antes de novas organizacoes usarem esse plano.

**Why this priority**: Planos comerciais mudam ao longo do tempo; o backoffice master precisa corrigir e manter o catalogo sem criar registros duplicados para cada ajuste simples.

**Independent Test**: Pode ser testado criando um plano, atualizando todos os campos editaveis com valores validos e confirmando que consultas posteriores retornam os novos dados.

**Acceptance Scenarios**:

1. **Given** um plano existente, **When** o operador atualiza titulo, descricao, preco em centavos e limites com valores validos, **Then** o sistema persiste as alteracoes e retorna o plano atualizado.
2. **Given** um plano existente, **When** a atualizacao remove a descricao mantendo os demais campos validos, **Then** o sistema salva o plano com descricao ausente.
3. **Given** um plano inexistente, **When** o operador tenta atualiza-lo, **Then** o sistema retorna erro de plano nao encontrado.
4. **Given** uma atualizacao com qualquer campo obrigatorio ausente ou invalido, **When** a requisicao e processada, **Then** o sistema rejeita a entrada e mantem os dados anteriores do plano.

---

### User Story 4 - Remover Plano de Assinatura (Priority: P4)

Como operador do backoffice master, quero remover planos que nao devem mais estar disponiveis para que o catalogo master nao ofereca opcoes comerciais obsoletas.

**Why this priority**: A remocao completa o ciclo CRUD, mas deve preservar a integridade de organizacoes que ja referenciam um plano.

**Independent Test**: Pode ser testado criando um plano sem organizacoes associadas, removendo-o e confirmando que ele nao aparece mais na lista nem pode ser encontrado por ID.

**Acceptance Scenarios**:

1. **Given** um plano existente sem organizacoes associadas, **When** o operador remove o plano, **Then** o sistema conclui a remocao e o plano deixa de aparecer nas consultas.
2. **Given** um plano inexistente ou ja removido, **When** o operador tenta remove-lo, **Then** o sistema retorna erro de plano nao encontrado.
3. **Given** um plano usado por uma ou mais organizacoes, **When** o operador tenta remove-lo, **Then** o sistema rejeita a remocao com erro de conflito para preservar as referencias existentes.
4. **Given** esta slice sem autorizacao real, **When** a remocao e enviada para o prefixo `/backoffice`, **Then** o sistema trata o recurso como pertencente ao namespace tecnico de backoffice master sem validar perfil Master.

### Edge Cases

- O titulo contem apenas espacos, quebras de linha ou tabs.
- A descricao e omitida, enviada como nula, enviada em branco ou enviada com espacos ao redor.
- O preco e enviado como negativo, decimal, string, valor muito grande ou campo monetario em formato de moeda.
- Os limites de operadores ou pacientes sao zero, negativos, decimais, strings ou ausentes.
- O ID informado na rota esta vazio, malformado, nao existe ou pertence a um plano removido.
- Uma atualizacao parcial e enviada para um endpoint de substituicao completa.
- A remocao e solicitada para um plano que esta referenciado por organizacoes existentes.
- A lista de planos esta vazia.
- Campos extras sao enviados no corpo da requisicao.
- Uma tentativa de acesso usa outro prefixo que nao seja `/backoffice`; esta slice nao define autorizacao ou bloqueio por perfil para esse caso.
- Organizacoes usam planos como referencia comercial, mas dados operacionais tenant-scoped nao devem aparecer nas respostas deste CRUD.
- Configuracoes de white-label ou branding de organizacoes nao existem ou estao incompletas; este recurso permanece no contexto master e nao depende delas.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST oferecer um CRUD de planos de assinatura no namespace tecnico de backoffice master representado pelo prefixo `/backoffice`.
- **FR-002**: O sistema MUST expor operacoes para criar, listar, buscar por ID, atualizar e remover planos de assinatura.
- **FR-003**: O sistema MUST NOT implementar autorizacao real, middleware de permissao ou validacao de perfil Master nesta slice; `/backoffice` representa apenas o namespace tecnico do recurso.
- **FR-004**: O sistema MUST tratar `SubscriptionPlan` como entidade independente nesta etapa, sem promove-la a Aggregate Root.
- **FR-005**: O sistema MUST exigir `title` na criacao e na atualizacao completa do plano.
- **FR-006**: O sistema MUST tratar `description` como opcional.
- **FR-007**: O sistema MUST exigir preco em centavos inteiros, sem aceitar float, decimal ou formato monetario textual como fonte de entrada.
- **FR-008**: O sistema MUST manter valores monetarios sempre como inteiros em centavos em entradas, respostas, dominio e persistencia.
- **FR-009**: O sistema MUST exigir `operatorsLimit` como inteiro positivo.
- **FR-010**: O sistema MUST exigir `patientsLimit` como inteiro positivo.
- **FR-011**: O sistema MUST normalizar espacos ao redor de textos antes de validar e persistir `title` e `description`.
- **FR-012**: O sistema MUST rejeitar `description` quando ela for enviada e, apos normalizacao, ficar vazia.
- **FR-013**: O sistema MUST retornar plano criado ou atualizado com `id`, `title`, `description`, `priceInCents`, `operatorsLimit`, `patientsLimit`, `createdAt` e `updatedAt`.
- **FR-014**: O sistema MUST retornar lista vazia quando nao houver planos cadastrados.
- **FR-015**: O sistema MUST retornar erro de nao encontrado para busca, atualizacao ou remocao de ID inexistente.
- **FR-016**: O sistema MUST impedir a remocao de plano referenciado por organizacoes existentes e retornar erro de conflito.
- **FR-017**: O sistema MUST preservar os dados anteriores quando uma atualizacao falhar por validacao, plano inexistente ou conflito.
- **FR-018**: O sistema MUST manter respostas de erro estruturadas e consistentes com o padrao da API existente.
- **FR-019**: O dominio MUST conter regras de negocio de `SubscriptionPlan` sem depender de HTTP, Fastify, Prisma, Zod ou outro mecanismo de transporte ou persistencia.
- **FR-020**: A camada Application MUST orquestrar os casos de uso do CRUD e depender de interfaces de repositorio, nao de implementacoes de infraestrutura.
- **FR-021**: A camada Infrastructure MUST fornecer repositorios e mappers baseados em Prisma para persistir e recuperar `SubscriptionPlan`.
- **FR-022**: A camada Presentation MUST conter rotas, controllers ou handlers HTTP com Fastify para o backoffice master.
- **FR-023**: A entrada HTTP MUST ser validada com Zod no limite de Presentation antes de chegar aos casos de uso.
- **FR-024**: O recurso MUST usar endpoints HTTP no prefixo `/backoffice/subscription-plans`.
- **FR-025**: O recurso MUST NOT criar interface visual.
- **FR-026**: O recurso MUST NOT alterar contratos compartilhados do monorepo, salvo se a estrutura atual do projeto exigir contrato compartilhado para endpoints de API.
- **FR-027**: O recurso MUST manter compatibilidade com o uso existente de planos no cadastro de organizacoes.

### Key Entities *(include if feature involves data)*

- **Backoffice Master Context**: Namespace tecnico de plataforma, representado pelo prefixo `/backoffice`, reservado para operadores master administrarem catalogos globais do sistema multitenant em uma slice futura com autorizacao real.
- **SubscriptionPlan**: Entidade independente que representa uma oferta comercial disponivel para organizacoes. Atributos principais: `id`, `title`, `description`, `price`, `operatorsLimit`, `patientsLimit`, `createdAt` e `updatedAt`.
- **MoneyInCents**: Value Object monetario que representa o preco como inteiro em centavos. Nao aceita float, decimal ou formato textual como valor de origem.
- **Organization Reference**: Organizacoes podem apontar para um plano atual. Essa referencia impede remocao fisica de planos em uso nesta versao do CRUD.
- **Tenant Ownership**: `SubscriptionPlan` e catalogo global do backoffice master e nao pertence a uma organizacao especifica; por isso nao carrega `organizationId`. Organizacoes tenant-scoped apenas referenciam um plano.
- **Shared Contracts**: Nenhum contrato compartilhado deve ser criado ou alterado nesta spec, a menos que a arquitetura atual do projeto ja obrigue contratos compartilhados para estes endpoints.

### API Endpoints and Payloads

#### `POST /backoffice/subscription-plans`

Cria um plano de assinatura.

**Request Body**:

```json
{
  "title": "Plano Essencial",
  "description": "Ideal para associacoes iniciantes.",
  "priceInCents": 15000,
  "operatorsLimit": 5,
  "patientsLimit": 100
}
```

**Response 201**:

```json
{
  "id": "uuid",
  "title": "Plano Essencial",
  "description": "Ideal para associacoes iniciantes.",
  "priceInCents": 15000,
  "operatorsLimit": 5,
  "patientsLimit": 100,
  "createdAt": "2026-06-18T00:00:00.000Z",
  "updatedAt": "2026-06-18T00:00:00.000Z"
}
```

#### `GET /backoffice/subscription-plans`

Lista planos de assinatura cadastrados.

**Response 200**:

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Plano Essencial",
      "description": "Ideal para associacoes iniciantes.",
      "priceInCents": 15000,
      "operatorsLimit": 5,
      "patientsLimit": 100,
      "createdAt": "2026-06-18T00:00:00.000Z",
      "updatedAt": "2026-06-18T00:00:00.000Z"
    }
  ]
}
```

#### `GET /backoffice/subscription-plans/:id`

Busca um plano de assinatura por ID.

**Response 200**:

```json
{
  "id": "uuid",
  "title": "Plano Essencial",
  "description": "Ideal para associacoes iniciantes.",
  "priceInCents": 15000,
  "operatorsLimit": 5,
  "patientsLimit": 100,
  "createdAt": "2026-06-18T00:00:00.000Z",
  "updatedAt": "2026-06-18T00:00:00.000Z"
}
```

#### `PUT /backoffice/subscription-plans/:id`

Substitui os dados editaveis de um plano existente. Por ser substituicao completa, todos os campos obrigatorios devem ser enviados.

**Request Body**:

```json
{
  "title": "Plano Profissional",
  "description": null,
  "priceInCents": 29900,
  "operatorsLimit": 10,
  "patientsLimit": 300
}
```

**Response 200**:

```json
{
  "id": "uuid",
  "title": "Plano Profissional",
  "description": null,
  "priceInCents": 29900,
  "operatorsLimit": 10,
  "patientsLimit": 300,
  "createdAt": "2026-06-18T00:00:00.000Z",
  "updatedAt": "2026-06-18T00:00:00.000Z"
}
```

#### `DELETE /backoffice/subscription-plans/:id`

Remove um plano sem organizacoes associadas.

**Response 204**: sem corpo.

### Validation Rules

- **VR-001**: `id` de rota deve identificar um plano valido; ID malformado ou ausente deve ser rejeitado antes do caso de uso.
- **VR-002**: `title` e obrigatorio, deve ser string e deve conter ao menos um caractere apos trim.
- **VR-003**: `description` pode ser omitida ou nula; quando enviada como string, deve conter ao menos um caractere apos trim.
- **VR-004**: `priceInCents` e obrigatorio, deve ser inteiro seguro e nao negativo; zero e valido quando o produto permitir plano sem cobranca, enquanto valores negativos e decimais sao sempre rejeitados.
- **VR-005**: `operatorsLimit` e obrigatorio, deve ser inteiro positivo.
- **VR-006**: `patientsLimit` e obrigatorio, deve ser inteiro positivo.
- **VR-007**: Corpos de criacao e atualizacao devem conter apenas os campos aceitos pelo contrato do endpoint.
- **VR-008**: Atualizacao via `PUT` e substituicao completa; ausencia de campo obrigatorio invalida a requisicao.
- **VR-009**: Nenhum endpoint deve aceitar `price`, `amount`, `value`, valor decimal ou valor formatado como moeda no lugar de `priceInCents`.

### Expected Errors

- **400 Validation Error**: Entrada invalida, ID malformado, campo obrigatorio ausente, tipo incorreto, texto vazio, preco negativo ou nao inteiro, limite invalido ou campo inesperado.
- **404 Subscription Plan Not Found**: Plano nao encontrado em busca, atualizacao ou remocao.
- **409 Subscription Plan In Use**: Tentativa de remover plano referenciado por uma ou mais organizacoes.
- **500 Internal Error**: Falha inesperada preservando o formato estruturado de erro da API, sem vazar detalhes internos.

### Out of Scope

- Criar telas, componentes visuais ou fluxos de UI.
- Implementar autenticacao.
- Implementar autorizacao Master.
- Implementar autorizacao avancada, matriz de permissoes ou login master.
- Criar middleware de permissao.
- Validar perfil Master.
- Tratar `/backoffice` como mais que um namespace/prefixo tecnico nesta etapa.
- Alterar contratos compartilhados do monorepo quando o endpoint puder permanecer local ao pacote de API.
- Criar regras de billing, cobranca, cupom, trial, desconto, recorrencia ou integracao de pagamento.
- Aplicar limites de operadores ou pacientes dentro de workflows de operadores ou pacientes.
- Migrar organizacoes entre planos, versionar planos ou manter historico comercial de alteracoes.
- Permitir remocao de planos em uso por organizacoes.
- Adicionar paginacao, busca textual, ordenacao customizada ou filtros na listagem inicial.
- Promover `SubscriptionPlan` a Aggregate Root nesta etapa.

### Constitution Alignment *(mandatory)*

- **Affected Packages**: `packages/api` para dominio, casos de uso, persistencia e apresentacao HTTP. `packages/shared` permanece inalterado salvo se o projeto exigir contratos compartilhados para endpoints. `packages/web` nao e afetado porque nao ha UI.
- **Tenant/White-Label Impact**: O recurso pertence ao backoffice master e administra um catalogo global de planos. `SubscriptionPlan` nao possui `organizationId`; organizacoes apenas referenciam planos. Branding e configuracoes white-label de organizacoes nao influenciam esse CRUD.
- **Contract/Typing Impact**: Os contratos HTTP incluem payloads de criacao, atualizacao, listagem, detalhe e erros estruturados. Preco deve aparecer como `priceInCents` em todos os contratos. Nenhum DTO compartilhado novo e exigido nesta spec.
- **Clean-Code Boundaries**: Regras de entidade e dinheiro ficam no dominio; orquestracao fica em casos de uso de application; repositorios e mappers Prisma ficam em infrastructure; rotas, controllers, handlers e validacao de entrada ficam em presentation. Domain nao depende de HTTP, Fastify, Prisma ou Zod.
- **Verification Scope**: Verificar criacao, listagem, busca por ID, atualizacao, remocao, rejeicao de remocao em uso, uso do namespace tecnico `/backoffice`, validacao de entrada, preservacao de dinheiro em centavos, erros estruturados, persistencia Prisma e compatibilidade com cadastro de organizacoes que consulta planos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um operador ou tester master consegue criar, consultar, atualizar e remover um plano nao utilizado em ate 2 minutos usando os contratos definidos.
- **SC-002**: 100% das tentativas com titulo vazio, limites nao positivos, limites decimais, preco negativo ou preco nao inteiro sao rejeitadas sem persistir alteracoes.
- **SC-003**: 100% das respostas de sucesso exibem valores monetarios apenas como inteiros em centavos, sem campos decimais ou formatados como moeda.
- **SC-004**: 100% das buscas, atualizacoes e remocoes de IDs inexistentes retornam erro de nao encontrado de forma estruturada.
- **SC-005**: 100% das tentativas de remover planos referenciados por organizacoes retornam conflito e preservam o plano.
- **SC-006**: O cadastro de organizacoes existente continua conseguindo validar e referenciar planos apos a entrega do CRUD.
- **SC-007**: Nenhuma tela nova, rota web ou contrato compartilhado novo e introduzido por esta feature quando a API puder manter seus contratos localmente.

## Assumptions

- A autenticacao final de usuarios master pode existir ou estar em andamento; esta spec exige apenas que o CRUD use o namespace tecnico `/backoffice` e nao define autenticacao, autorizacao Master, middleware de permissao, validacao de perfil ou matriz avancada de permissoes.
- IDs de planos seguem o formato de identificador usado pela persistencia atual do projeto.
- A listagem inicial retorna todos os planos cadastrados sem paginacao, filtros ou ordenacao customizada.
- `PUT` representa substituicao completa dos campos editaveis, nao atualizacao parcial.
- Titulo de plano nao precisa ser unico nesta spec, exceto se uma restricao existente de persistencia ja exigir unicidade.
- Preco zero e permitido pelo conceito monetario atual; regras comerciais futuras podem restringir planos gratuitos fora desta spec.
- Remocao fisica so e permitida para planos sem organizacoes associadas.
- Criacao e atualizacao retornam timestamps no mesmo formato ja usado pelos demais endpoints da API.

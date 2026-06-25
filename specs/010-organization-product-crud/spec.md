# Feature Specification: CRUD Backend de Produtos da Organizacao

**Feature Branch**: `[010-organization-product-crud]`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Crie uma spec para o CRUD backend de produtos da organizacao seguindo DDD. Escopo: apenas back-end. Nao implementar frontend, estoque, pedidos, reservas, receitas, imagens, upload, categorias customizadas ou integracao com pagamentos."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar produto da organizacao (Priority: P1)

Como usuario de uma organizacao, quero cadastrar produtos com dados comerciais e classificacao padronizada para preparar o catalogo que sera disponibilizado futuramente para pacientes e associados.

**Why this priority**: O cadastro e a base do catalogo de produtos; sem ele nao ha dados para consultar, editar, ativar ou desativar.

**Independent Test**: Criar um produto para uma organizacao usando dados validos, confirmar que ele recebe identificador unico, pertence a organizacao informada, armazena preco em centavos e nasce ativo.

**Acceptance Scenarios**:

1. **Given** uma organizacao existente e dados obrigatorios validos, **When** o usuario cadastra um produto, **Then** o sistema registra o produto com `organizationId`, `name`, `category`, `type`, `unit`, `priceInCents` e `isActive = true`.
2. **Given** um produto sem descricao, linhagem e percentuais, **When** o usuario cadastra o produto com os demais campos obrigatorios validos, **Then** o sistema registra o produto tratando esses campos como ausentes.
3. **Given** uma tentativa de cadastro sem `organizationId`, `name`, `category`, `type`, `unit` ou `priceInCents`, **When** a requisicao e processada, **Then** o sistema rejeita a entrada e nenhum produto e criado.
4. **Given** uma tentativa de cadastro com preco negativo ou percentual negativo, **When** a requisicao e processada, **Then** o sistema rejeita a entrada e nenhum produto e criado.

---

### User Story 2 - Consultar catalogo de produtos da organizacao (Priority: P2)

Como usuario de uma organizacao, quero listar os produtos cadastrados e consultar um produto especifico para revisar o catalogo antes de disponibiliza-lo em fluxos futuros.

**Why this priority**: A organizacao precisa enxergar o catalogo proprio para validar dados comerciais, classificacoes e status ativo/inativo.

**Independent Test**: Criar produtos em duas organizacoes, listar e buscar produtos por ID confirmando que cada resposta retorna apenas produtos da organizacao solicitada.

**Acceptance Scenarios**:

1. **Given** uma organizacao possui produtos cadastrados, **When** o usuario lista os produtos da organizacao, **Then** o sistema retorna somente produtos daquela organizacao, incluindo o status ativo/inativo de cada item.
2. **Given** uma organizacao nao possui produtos cadastrados, **When** o usuario lista os produtos, **Then** o sistema retorna lista vazia sem erro.
3. **Given** um produto existente na organizacao, **When** o usuario busca o produto por ID dentro da mesma organizacao, **Then** o sistema retorna os dados completos do produto.
4. **Given** um produto pertence a outra organizacao, **When** o usuario tenta busca-lo pela organizacao atual, **Then** o sistema retorna erro de produto nao encontrado ou fora do escopo da organizacao.

---

### User Story 3 - Atualizar produto da organizacao (Priority: P3)

Como usuario de uma organizacao, quero atualizar os dados cadastrais de um produto para corrigir informacoes de catalogo antes que ele seja usado em jornadas futuras.

**Why this priority**: Produtos podem mudar de nome, descricao, classificacao, unidade ou preco; o catalogo precisa permitir manutencao sem recriar registros desnecessariamente.

**Independent Test**: Criar um produto, atualizar todos os campos editaveis com valores validos e confirmar que consultas posteriores retornam os novos dados preservando a mesma organizacao e o mesmo identificador.

**Acceptance Scenarios**:

1. **Given** um produto existente na organizacao, **When** o usuario atualiza nome, descricao, categoria, tipo, linhagem, percentuais, unidade e preco com dados validos, **Then** o sistema persiste as alteracoes e retorna o produto atualizado.
2. **Given** um produto existente com descricao, linhagem e percentuais, **When** o usuario atualiza o produto removendo esses campos opcionais, **Then** o sistema salva o produto com esses campos ausentes.
3. **Given** um produto inexistente ou pertencente a outra organizacao, **When** o usuario tenta atualiza-lo, **Then** o sistema retorna erro de produto nao encontrado.
4. **Given** uma atualizacao com campo obrigatorio ausente, enum invalido, preco negativo ou percentual negativo, **When** a requisicao e processada, **Then** o sistema rejeita a entrada e preserva os dados anteriores.

---

### User Story 4 - Desativar, reativar e remover logicamente produto (Priority: P4)

Como usuario de uma organizacao, quero ativar, desativar ou remover logicamente produtos para controlar quais itens permanecem disponiveis no catalogo sem perder o historico cadastral.

**Why this priority**: O controle de disponibilidade completa o ciclo de manutencao do catalogo e antecipa o uso futuro dos produtos em fluxos de pacientes/associados.

**Independent Test**: Criar um produto ativo, desativa-lo, reativa-lo e executar a remocao logica, confirmando que `isActive` reflete cada acao e que nenhuma informacao de estoque e criada.

**Acceptance Scenarios**:

1. **Given** um produto ativo da organizacao, **When** o usuario desativa o produto, **Then** o sistema altera `isActive` para `false`.
2. **Given** um produto inativo da organizacao, **When** o usuario ativa o produto, **Then** o sistema altera `isActive` para `true`.
3. **Given** um produto da organizacao, **When** o usuario remove o produto pelo endpoint de exclusao, **Then** o sistema executa remocao logica alterando `isActive` para `false`.
4. **Given** um produto inexistente ou pertencente a outra organizacao, **When** o usuario tenta ativar, desativar ou remover o produto, **Then** o sistema retorna erro de produto nao encontrado.

### Edge Cases

- `name` ausente, nulo, vazio ou contendo apenas espacos deve ser rejeitado.
- `organizationId` ausente, vazio ou divergente do escopo da rota deve ser rejeitado.
- `category`, `type` ou `unit` ausentes ou fora dos valores permitidos devem ser rejeitados.
- `priceInCents` ausente, negativo, decimal, string monetaria ou valor nao inteiro deve ser rejeitado.
- `thcPercentage` ou `cbdPercentage`, quando informados, negativos, nao numericos ou fora do formato numerico aceito devem ser rejeitados.
- Campos opcionais enviados como vazios apos normalizacao devem ser tratados como ausentes quando aplicavel.
- Produto pertencente a outra organizacao nunca deve aparecer em listagem, busca, atualizacao, ativacao, desativacao ou remocao.
- Listagem deve retornar lista vazia quando a organizacao nao tiver produtos.
- A remocao logica de produto ja inativo deve manter o produto inativo sem criar campos de estoque.
- Ativacao de produto ja ativo e desativacao de produto ja inativo devem produzir resultado consistente e idempotente.
- Nenhuma operacao deve aceitar, retornar ou persistir quantidade disponivel, lote, validade, item de estoque ou movimentacao de estoque nesta spec.
- Nenhuma operacao deve criar imagens, upload, pedidos, reservas, receitas, categorias customizadas ou integracao de pagamento.
- Erros inesperados devem ser estruturados e nao devem expor detalhes internos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST oferecer um CRUD backend de produtos dentro do escopo de uma organizacao.
- **FR-002**: O sistema MUST permitir criar produto por `POST /organizations/:organizationId/products`.
- **FR-003**: O sistema MUST permitir listar produtos por `GET /organizations/:organizationId/products`.
- **FR-004**: O sistema MUST permitir buscar produto por ID por `GET /organizations/:organizationId/products/:productId`.
- **FR-005**: O sistema MUST permitir atualizar produto por `PUT /organizations/:organizationId/products/:productId`.
- **FR-006**: O sistema MUST permitir remover logicamente produto por `DELETE /organizations/:organizationId/products/:productId`, alterando `isActive` para `false`.
- **FR-007**: O sistema MUST permitir ativar produto por `PATCH /organizations/:organizationId/products/:productId/activate`.
- **FR-008**: O sistema MUST permitir desativar produto por `PATCH /organizations/:organizationId/products/:productId/deactivate`.
- **FR-009**: O sistema MUST modelar `Product` como Aggregate Root do catalogo de produtos da organizacao.
- **FR-010**: `Product` MUST possuir os campos `id`, `organizationId`, `name`, `description`, `category`, `type`, `strainType`, `thcPercentage`, `cbdPercentage`, `unit`, `priceInCents` e `isActive`.
- **FR-011**: O sistema MUST exigir `organizationId` para todo produto e toda operacao de produto.
- **FR-012**: O sistema MUST exigir `name` na criacao e atualizacao completa de produto.
- **FR-013**: O sistema MUST exigir `category` na criacao e atualizacao completa de produto.
- **FR-014**: O sistema MUST exigir `type` na criacao e atualizacao completa de produto.
- **FR-015**: O sistema MUST exigir `unit` na criacao e atualizacao completa de produto.
- **FR-016**: O sistema MUST exigir `priceInCents` na criacao e atualizacao completa de produto.
- **FR-017**: O sistema MUST representar preco por `MoneyInCents`, sempre como inteiro em centavos.
- **FR-018**: O sistema MUST rejeitar `priceInCents` negativo, decimal, nao numerico ou em formato textual de moeda.
- **FR-019**: O sistema MUST tratar `description` como opcional.
- **FR-020**: O sistema MUST tratar `strainType` como opcional.
- **FR-021**: O sistema MUST tratar `thcPercentage` como opcional.
- **FR-022**: O sistema MUST tratar `cbdPercentage` como opcional.
- **FR-023**: O sistema MUST rejeitar `thcPercentage` negativo quando informado.
- **FR-024**: O sistema MUST rejeitar `cbdPercentage` negativo quando informado.
- **FR-025**: Produto criado MUST iniciar ativo por padrao com `isActive = true`.
- **FR-026**: Produto MUST poder ser ativado e desativado sem alterar os demais dados cadastrais.
- **FR-027**: Listagem e busca MUST retornar `isActive` para que o consumidor diferencie produtos ativos e inativos.
- **FR-028**: O sistema MUST preservar isolamento por organizacao em criacao, listagem, busca, atualizacao, ativacao, desativacao e remocao logica.
- **FR-029**: O sistema MUST rejeitar operacoes sobre produto inexistente ou pertencente a outra organizacao com erro de produto nao encontrado.
- **FR-030**: O sistema MUST preservar dados anteriores quando uma atualizacao falhar por validacao ou produto nao encontrado.
- **FR-031**: O sistema MUST retornar erros estruturados e distinguiveis para entrada invalida, produto nao encontrado e falha inesperada.
- **FR-032**: O sistema MUST definir os valores de `ProductCategory`: `FLOWER`, `OIL`, `EXTRACT`, `CAPSULE`, `EDIBLE`, `TOPICAL`, `VAPORIZER`, `ACCESSORY`, `OTHER`.
- **FR-033**: O sistema MUST definir os valores de `ProductType`: `CBD`, `THC`, `BALANCED`, `FULL_SPECTRUM`, `BROAD_SPECTRUM`, `ISOLATE`.
- **FR-034**: O sistema MUST definir os valores de `StrainType`: `INDICA`, `SATIVA`, `HYBRID`.
- **FR-035**: O sistema MUST definir os valores de `ProductUnit`: `GRAM`, `MILLILITER`, `UNIT`.
- **FR-036**: O dominio MUST conter regras de negocio de `Product` sem depender de Prisma, Fastify, Zod, HTTP ou outro mecanismo de transporte, validacao ou persistencia.
- **FR-037**: A camada Application MUST orquestrar os casos de uso do CRUD e depender de interfaces de repositorio, nao diretamente de Prisma.
- **FR-038**: A camada Infrastructure MUST concentrar repositorios Prisma e mappers de persistencia de produtos.
- **FR-039**: A camada Presentation MUST concentrar handlers e rotas Fastify de produtos.
- **FR-040**: O sistema MUST NOT implementar frontend, estoque, `InventoryItem`, `InventoryMovement`, quantidade disponivel, batch/lote, validade, pedidos, reservas, receitas, imagens, upload, categorias customizadas, permissoes avancadas ou integracao com pagamentos nesta spec.

### Key Entities *(include if feature involves data)*

- **Product**: Aggregate Root que representa um item do catalogo de produtos de uma organizacao. Atributos principais: `id`, `organizationId`, `name`, `description`, `category`, `type`, `strainType`, `thcPercentage`, `cbdPercentage`, `unit`, `priceInCents` e `isActive`.
- **Organization**: Dono tenant do produto. Produtos sao sempre criados, consultados e mantidos dentro do escopo de uma organizacao.
- **MoneyInCents**: Value Object monetario que representa o preco do produto como inteiro em centavos e rejeita valores negativos ou formatos monetarios textuais.
- **ProductCategory**: Classificacao padronizada do produto: `FLOWER`, `OIL`, `EXTRACT`, `CAPSULE`, `EDIBLE`, `TOPICAL`, `VAPORIZER`, `ACCESSORY`, `OTHER`.
- **ProductType**: Tipo comercial/quimico do produto: `CBD`, `THC`, `BALANCED`, `FULL_SPECTRUM`, `BROAD_SPECTRUM`, `ISOLATE`.
- **StrainType**: Linhagem opcional para produtos aplicaveis: `INDICA`, `SATIVA`, `HYBRID`.
- **ProductUnit**: Unidade de venda do produto: `GRAM`, `MILLILITER`, `UNIT`.
- **Tenant Ownership**: `organizationId` e a chave de escopo obrigatoria para todos os produtos e operacoes deste CRUD.
- **Shared Contracts**: Payloads e responses de produto, enums de produto, operacoes de ativacao/desativacao, remocao logica e erros estruturados.

### API Endpoints and Payloads

#### `POST /organizations/:organizationId/products`

Cria um produto ativo no catalogo da organizacao.

**Request Body**:

```json
{
  "name": "CBD Oil 1000mg",
  "description": "Frasco com 30ml.",
  "category": "OIL",
  "type": "CBD",
  "strainType": null,
  "thcPercentage": 0,
  "cbdPercentage": 10,
  "unit": "MILLILITER",
  "priceInCents": 15900
}
```

**Response 201**:

```json
{
  "id": "product-id",
  "organizationId": "organization-id",
  "name": "CBD Oil 1000mg",
  "description": "Frasco com 30ml.",
  "category": "OIL",
  "type": "CBD",
  "strainType": null,
  "thcPercentage": 0,
  "cbdPercentage": 10,
  "unit": "MILLILITER",
  "priceInCents": 15900,
  "isActive": true,
  "createdAt": "2026-06-23T12:00:00.000Z",
  "updatedAt": "2026-06-23T12:00:00.000Z"
}
```

#### `GET /organizations/:organizationId/products`

Lista produtos cadastrados na organizacao.

**Response 200**:

```json
{
  "data": [
    {
      "id": "product-id",
      "organizationId": "organization-id",
      "name": "CBD Oil 1000mg",
      "description": "Frasco com 30ml.",
      "category": "OIL",
      "type": "CBD",
      "strainType": null,
      "thcPercentage": 0,
      "cbdPercentage": 10,
      "unit": "MILLILITER",
      "priceInCents": 15900,
      "isActive": true,
      "createdAt": "2026-06-23T12:00:00.000Z",
      "updatedAt": "2026-06-23T12:00:00.000Z"
    }
  ]
}
```

#### `GET /organizations/:organizationId/products/:productId`

Busca um produto por ID dentro da organizacao.

**Response 200**:

```json
{
  "id": "product-id",
  "organizationId": "organization-id",
  "name": "CBD Oil 1000mg",
  "description": "Frasco com 30ml.",
  "category": "OIL",
  "type": "CBD",
  "strainType": null,
  "thcPercentage": 0,
  "cbdPercentage": 10,
  "unit": "MILLILITER",
  "priceInCents": 15900,
  "isActive": true,
  "createdAt": "2026-06-23T12:00:00.000Z",
  "updatedAt": "2026-06-23T12:00:00.000Z"
}
```

#### `PUT /organizations/:organizationId/products/:productId`

Substitui os dados cadastrais editaveis de um produto. Por ser substituicao completa, campos obrigatorios devem ser enviados.

**Request Body**:

```json
{
  "name": "CBD Oil 1500mg",
  "description": null,
  "category": "OIL",
  "type": "CBD",
  "strainType": null,
  "thcPercentage": 0,
  "cbdPercentage": 15,
  "unit": "MILLILITER",
  "priceInCents": 18900
}
```

**Response 200**:

```json
{
  "id": "product-id",
  "organizationId": "organization-id",
  "name": "CBD Oil 1500mg",
  "description": null,
  "category": "OIL",
  "type": "CBD",
  "strainType": null,
  "thcPercentage": 0,
  "cbdPercentage": 15,
  "unit": "MILLILITER",
  "priceInCents": 18900,
  "isActive": true,
  "createdAt": "2026-06-23T12:00:00.000Z",
  "updatedAt": "2026-06-23T12:30:00.000Z"
}
```

#### `DELETE /organizations/:organizationId/products/:productId`

Remove logicamente o produto do catalogo operacional, alterando `isActive` para `false`.

**Response 200**:

```json
{
  "id": "product-id",
  "organizationId": "organization-id",
  "isActive": false
}
```

#### `PATCH /organizations/:organizationId/products/:productId/activate`

Ativa um produto existente da organizacao.

**Response 200**:

```json
{
  "id": "product-id",
  "organizationId": "organization-id",
  "isActive": true
}
```

#### `PATCH /organizations/:organizationId/products/:productId/deactivate`

Desativa um produto existente da organizacao.

**Response 200**:

```json
{
  "id": "product-id",
  "organizationId": "organization-id",
  "isActive": false
}
```

### Constitution Alignment *(mandatory)*

- **Affected Packages**: API e documentacao da feature. Web/UI ficam fora de escopo.
- **Tenant/White-Label Impact**: Todo produto pertence a uma organizacao por `organizationId`. A feature nao altera branding, dominio customizado, logo, textos de portal ou outras configuracoes white-label.
- **Contract/Typing Impact**: Define contratos backend para CRUD de produtos, enums de produto, payloads de criacao/atualizacao, responses de consulta, ativacao/desativacao e erros estruturados.
- **Clean-Code Boundaries**: Regras de produto ficam no dominio sem Prisma/Fastify/Zod/HTTP; casos de uso dependem de interfaces e nao diretamente de Prisma; repositorios Prisma e mappers ficam na infraestrutura; handlers e rotas Fastify ficam na apresentacao.
- **Verification Scope**: Testar validacao de campos, invariantes monetarias e percentuais, isolamento por organizacao, CRUD completo, ativacao/desativacao, remocao logica e ausencia de qualquer logica de estoque.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuario de organizacao consegue cadastrar um produto valido e consulta-lo em menos de 2 minutos usando os contratos backend definidos.
- **SC-002**: 100% dos cenarios de criacao, consulta, atualizacao, ativacao, desativacao e remocao logica preservam isolamento por organizacao.
- **SC-003**: 100% das entradas com campos obrigatorios ausentes, enum invalido, preco negativo ou percentuais negativos sao rejeitadas sem alterar dados existentes.
- **SC-004**: 100% dos produtos criados iniciam ativos e podem alternar entre ativo e inativo sem criar dados de estoque.
- **SC-005**: Nenhuma resposta ou registro criado pela feature contem quantidade disponivel, lote, validade, item de estoque, movimentacao de estoque, imagem, upload, pedido, reserva, receita ou informacao de pagamento.

## Assumptions

- O CRUD e destinado a usuarios internos da organizacao que ja possuem acesso ao contexto organizacional existente; permissoes avancadas ficam fora desta spec.
- A listagem de gerenciamento retorna produtos ativos e inativos da organizacao, expondo `isActive`; filtros de catalogo publico ou paciente ficam para specs futuras.
- `DELETE` sera tratado como remocao logica por `isActive = false`, porque o ciclo ativo/inativo faz parte do modelo e preserva o cadastro para rastreabilidade futura.
- `PUT` representa substituicao completa dos dados cadastrais editaveis do produto; ativacao/desativacao usam endpoints especificos.
- Percentuais de THC/CBD sao opcionais e podem ser zero; esta spec valida apenas ausencia de valores negativos.
- Estoque, disponibilidade comercial para pacientes, pedidos e pagamentos serao definidos em specs separadas.

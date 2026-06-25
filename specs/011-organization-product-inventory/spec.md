# Feature Specification: Controle Backend de Estoque de Produtos da Organizacao

**Feature Branch**: `[011-organization-product-inventory]`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Crie uma spec para controle backend de estoque de produtos da organizacao seguindo DDD. Escopo: apenas back-end. Nao implementar frontend, pedidos, reservas por pedido, receitas, checkout, pagamento, upload ou imagens. A spec anterior implementou Product como catalogo. Agora vamos implementar a posicao de estoque de um produto e seu historico de movimentacoes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar a posicao de estoque de um produto (Priority: P1)

Como usuario de uma organizacao, quero criar a posicao de estoque de um produto ja cadastrado no catalogo para comecar a controlar quantidade disponivel, quantidade reservada e quantidade minima daquele produto.

**Why this priority**: Sem a posicao de estoque (`InventoryItem`) nenhuma movimentacao de entrada, reserva, liberacao, saida ou ajuste pode ocorrer; ela e a base de todo o controle.

**Independent Test**: Criar um produto, criar sua posicao de estoque informando quantidade minima e quantidade disponivel inicial, confirmar que recebe identificador unico, pertence a organizacao e ao produto, inicia com reserva zero e que uma segunda criacao para o mesmo produto e rejeitada.

**Acceptance Scenarios**:

1. **Given** um produto existente na organizacao sem posicao de estoque, **When** o usuario cria o `InventoryItem` com `minimumQuantity` e `availableQuantity` inicial validos, **Then** o sistema registra a posicao com `organizationId`, `productId`, `availableQuantity`, `reservedQuantity = 0` e `minimumQuantity`.
2. **Given** uma criacao com `availableQuantity` inicial maior que zero, **When** a posicao e criada, **Then** o sistema registra uma movimentacao de abertura do tipo `IN` com a quantidade inicial e o `createdByUserId` informado.
3. **Given** um produto que ja possui posicao de estoque, **When** o usuario tenta criar outra posicao para o mesmo produto, **Then** o sistema rejeita a operacao por violacao de unicidade e nao cria um segundo `InventoryItem`.
4. **Given** um `productId` inexistente ou pertencente a outra organizacao, **When** o usuario tenta criar a posicao de estoque, **Then** o sistema retorna erro de produto nao encontrado e nenhuma posicao e criada.
5. **Given** uma criacao com `availableQuantity`, `reservedQuantity` ou `minimumQuantity` negativos ou nao inteiros, **When** a requisicao e processada, **Then** o sistema rejeita a entrada e nenhuma posicao e criada.

---

### User Story 2 - Consultar posicao de estoque e historico de movimentacoes (Priority: P2)

Como usuario de uma organizacao, quero consultar a posicao de estoque atual de um produto e o historico de movimentacoes para auditar entradas, reservas, liberacoes, saidas e ajustes.

**Why this priority**: A organizacao precisa enxergar o saldo atual e a trilha de auditoria para conferir o controle de estoque, sem o que o controle nao tem valor operacional.

**Independent Test**: Criar a posicao de estoque de um produto, executar algumas movimentacoes, consultar a posicao confirmando os saldos e consultar o historico confirmando que toda movimentacao foi registrada de forma append-only.

**Acceptance Scenarios**:

1. **Given** um produto com posicao de estoque, **When** o usuario consulta a posicao, **Then** o sistema retorna `availableQuantity`, `reservedQuantity`, `minimumQuantity` e o indicador `belowMinimum`.
2. **Given** um produto sem posicao de estoque, **When** o usuario consulta a posicao, **Then** o sistema retorna erro de posicao de estoque nao encontrada.
3. **Given** um produto com varias movimentacoes, **When** o usuario consulta o historico, **Then** o sistema retorna todas as movimentacoes da posicao com `type`, `quantity`, `reason`, `createdByUserId` e `createdAt`, ordenadas da mais recente para a mais antiga.
4. **Given** posicoes de estoque em organizacoes diferentes, **When** o usuario consulta posicao ou historico, **Then** o sistema retorna apenas dados da organizacao e do produto solicitados.

---

### User Story 3 - Registrar entrada de estoque (Priority: P2)

Como usuario de uma organizacao, quero registrar a entrada de quantidade no estoque de um produto para refletir compras, producao ou reposicao.

**Why this priority**: A entrada e a operacao mais frequente de abastecimento; sem ela o estoque nunca aumenta apos a criacao.

**Independent Test**: Criar a posicao de estoque, registrar uma entrada com quantidade positiva e confirmar que `availableQuantity` aumenta e que uma movimentacao `IN` e gerada.

**Acceptance Scenarios**:

1. **Given** um produto com posicao de estoque, **When** o usuario registra entrada com `quantity` positiva, **Then** o sistema aumenta `availableQuantity` em `quantity` e gera uma movimentacao do tipo `IN`.
2. **Given** uma entrada com `quantity` igual a zero, negativa ou nao inteira, **When** a requisicao e processada, **Then** o sistema rejeita a operacao e nao altera os saldos nem cria movimentacao.
3. **Given** um produto sem posicao de estoque, **When** o usuario tenta registrar entrada, **Then** o sistema retorna erro de posicao de estoque nao encontrada.

---

### User Story 4 - Reservar e liberar reserva de estoque (Priority: P3)

Como usuario de uma organizacao, quero reservar quantidade disponivel e liberar reservas para representar quantidade comprometida sem ainda ter saido fisicamente do estoque.

**Why this priority**: A reserva separa quantidade comprometida da quantidade livre, preparando a confirmacao de saida sem permitir comprometer mais do que existe.

**Independent Test**: Criar a posicao com saldo disponivel, reservar parte do saldo confirmando a transferencia para `reservedQuantity`, liberar parte confirmando o retorno para `availableQuantity`, e confirmar que reservar mais do que o disponivel e rejeitado.

**Acceptance Scenarios**:

1. **Given** uma posicao com `availableQuantity` suficiente, **When** o usuario reserva `quantity`, **Then** o sistema reduz `availableQuantity` em `quantity`, aumenta `reservedQuantity` em `quantity` e gera movimentacao do tipo `RESERVE`.
2. **Given** uma posicao com `availableQuantity` menor que a quantidade solicitada, **When** o usuario tenta reservar, **Then** o sistema rejeita a operacao por estoque insuficiente e nao altera os saldos nem cria movimentacao.
3. **Given** uma posicao com `reservedQuantity` suficiente, **When** o usuario libera `quantity` de reserva, **Then** o sistema reduz `reservedQuantity` em `quantity`, aumenta `availableQuantity` em `quantity` e gera movimentacao do tipo `RELEASE`.
4. **Given** uma liberacao de reserva maior que `reservedQuantity`, **When** a requisicao e processada, **Then** o sistema rejeita a operacao e nao altera os saldos nem cria movimentacao.

---

### User Story 5 - Confirmar saida de estoque (Priority: P3)

Como usuario de uma organizacao, quero confirmar a saida fisica de quantidade previamente reservada para representar a baixa definitiva do estoque.

**Why this priority**: A confirmacao de saida fecha o ciclo reserva -> saida, reduzindo o estoque fisico total da posicao.

**Independent Test**: Criar a posicao, reservar quantidade, confirmar a saida da quantidade reservada confirmando que `reservedQuantity` diminui e que uma movimentacao `OUT` e gerada, e confirmar que sair de mais do que o reservado e rejeitado.

**Acceptance Scenarios**:

1. **Given** uma posicao com `reservedQuantity` suficiente, **When** o usuario confirma saida de `quantity`, **Then** o sistema reduz `reservedQuantity` em `quantity` e gera movimentacao do tipo `OUT`.
2. **Given** uma confirmacao de saida maior que `reservedQuantity`, **When** a requisicao e processada, **Then** o sistema rejeita a operacao e nao altera os saldos nem cria movimentacao.
3. **Given** uma confirmacao com `quantity` igual a zero, negativa ou nao inteira, **When** a requisicao e processada, **Then** o sistema rejeita a operacao.

---

### User Story 6 - Ajustar estoque (Priority: P4)

Como usuario de uma organizacao, quero ajustar a quantidade disponivel para corrigir divergencias apos contagem fisica de estoque.

**Why this priority**: O ajuste corrige erros de contagem ou perdas sem precisar simular entradas/saidas artificiais, mantendo a auditoria coerente.

**Independent Test**: Criar a posicao com saldo, ajustar `availableQuantity` para um novo valor absoluto nao negativo, confirmar que o saldo passa a refletir o valor informado, que `reservedQuantity` permanece inalterado e que uma movimentacao `ADJUSTMENT` e gerada.

**Acceptance Scenarios**:

1. **Given** uma posicao de estoque, **When** o usuario ajusta `availableQuantity` para um novo valor absoluto nao negativo, **Then** o sistema define `availableQuantity` com o valor informado, mantem `reservedQuantity` e gera movimentacao do tipo `ADJUSTMENT`.
2. **Given** um ajuste com valor negativo ou nao inteiro, **When** a requisicao e processada, **Then** o sistema rejeita a operacao e nao altera os saldos nem cria movimentacao.
3. **Given** um produto sem posicao de estoque, **When** o usuario tenta ajustar, **Then** o sistema retorna erro de posicao de estoque nao encontrada.

### Edge Cases

- `organizationId`, `productId` ou `createdByUserId` ausentes, vazios ou apenas com espacos devem ser rejeitados.
- `quantity` ausente, igual a zero, negativa, decimal, em formato textual ou nao inteira deve ser rejeitada em `add-stock`, `reserve`, `release-reservation` e `confirm-stock-out`.
- `quantity` de ajuste negativa, decimal ou nao inteira deve ser rejeitada; ajuste para zero e permitido.
- `availableQuantity`, `reservedQuantity` e `minimumQuantity` nunca podem ficar negativos apos qualquer operacao.
- Reservar mais do que o disponivel deve ser rejeitado sem alterar saldos.
- Liberar reserva ou confirmar saida acima do reservado deve ser rejeitado sem alterar saldos.
- Criar uma segunda posicao de estoque para o mesmo produto na mesma organizacao deve ser rejeitado por unicidade.
- Operacoes sobre produto ou posicao de estoque de outra organizacao nunca devem expor ou alterar dados fora do escopo da organizacao.
- Nenhuma operacao de estoque deve alterar dados do `Product` (catalogo permanece imutavel sob a otica do estoque).
- Toda operacao bem-sucedida de entrada, reserva, liberacao, saida ou ajuste deve gerar exatamente uma movimentacao append-only.
- Movimentacoes nunca podem ser atualizadas ou removidas.
- Nenhuma operacao deve criar, retornar ou persistir lote, validade, pedido, reserva por pedido, receita, checkout, pagamento, upload ou imagem nesta spec.
- Erros inesperados devem ser estruturados e nao devem expor detalhes internos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST oferecer controle backend de estoque por produto dentro do escopo de uma organizacao.
- **FR-002**: O sistema MUST permitir criar a posicao de estoque por `POST /organizations/:organizationId/products/:productId/inventory`.
- **FR-003**: O sistema MUST permitir consultar a posicao de estoque por `GET /organizations/:organizationId/products/:productId/inventory`.
- **FR-004**: O sistema MUST permitir registrar entrada por `POST /organizations/:organizationId/products/:productId/inventory/add-stock`.
- **FR-005**: O sistema MUST permitir reservar por `POST /organizations/:organizationId/products/:productId/inventory/reserve`.
- **FR-006**: O sistema MUST permitir liberar reserva por `POST /organizations/:organizationId/products/:productId/inventory/release-reservation`.
- **FR-007**: O sistema MUST permitir confirmar saida por `POST /organizations/:organizationId/products/:productId/inventory/confirm-stock-out`.
- **FR-008**: O sistema MUST permitir ajustar por `POST /organizations/:organizationId/products/:productId/inventory/adjust`.
- **FR-009**: O sistema MUST permitir consultar o historico de movimentacoes por `GET /organizations/:organizationId/products/:productId/inventory/movements`.
- **FR-010**: O sistema MUST modelar `InventoryItem` como Aggregate Root da posicao de estoque de um produto.
- **FR-011**: `InventoryItem` MUST possuir os campos `id`, `organizationId`, `productId`, `availableQuantity`, `reservedQuantity` e `minimumQuantity`.
- **FR-012**: O sistema MUST garantir que `InventoryItem` pertence a uma organizacao por `organizationId` obrigatorio.
- **FR-013**: O sistema MUST garantir que `InventoryItem` pertence a um produto por `productId` obrigatorio.
- **FR-014**: O sistema MUST permitir no maximo um `InventoryItem` por produto por organizacao nesta fase.
- **FR-015**: O sistema MUST rejeitar `availableQuantity` negativo em qualquer momento.
- **FR-016**: O sistema MUST rejeitar `reservedQuantity` negativo em qualquer momento.
- **FR-017**: O sistema MUST rejeitar `minimumQuantity` negativo em qualquer momento.
- **FR-018**: O sistema MUST impedir reservar quantidade maior que `availableQuantity`.
- **FR-019**: O sistema MUST impedir liberar reserva maior que `reservedQuantity`.
- **FR-020**: O sistema MUST impedir confirmar saida maior que `reservedQuantity`.
- **FR-021**: O sistema MUST expor os metodos de dominio `addStock(quantity, reason)`, `reserve(quantity, reason)`, `releaseReservation(quantity, reason)`, `confirmStockOut(quantity, reason)` e `adjustStock(quantity, reason)` em `InventoryItem`.
- **FR-022**: `addStock` MUST aumentar `availableQuantity` em `quantity` e gerar movimentacao do tipo `IN`.
- **FR-023**: `reserve` MUST reduzir `availableQuantity` e aumentar `reservedQuantity` em `quantity` e gerar movimentacao do tipo `RESERVE`.
- **FR-024**: `releaseReservation` MUST reduzir `reservedQuantity` e aumentar `availableQuantity` em `quantity` e gerar movimentacao do tipo `RELEASE`.
- **FR-025**: `confirmStockOut` MUST reduzir `reservedQuantity` em `quantity` e gerar movimentacao do tipo `OUT`.
- **FR-026**: `adjustStock` MUST definir `availableQuantity` com o valor absoluto informado, preservar `reservedQuantity` e gerar movimentacao do tipo `ADJUSTMENT`.
- **FR-027**: O sistema MUST exigir `quantity` inteiro e maior que zero em `addStock`, `reserve`, `releaseReservation` e `confirmStockOut`.
- **FR-028**: O sistema MUST exigir `quantity` inteiro e maior ou igual a zero em `adjustStock`.
- **FR-029**: O sistema MUST NOT alterar nenhum dado de `Product` em qualquer operacao de estoque.
- **FR-030**: O sistema MUST modelar `InventoryMovement` como Entity de auditoria.
- **FR-031**: `InventoryMovement` MUST possuir os campos `id`, `organizationId`, `inventoryItemId`, `productId`, `type`, `quantity`, `reason`, `createdByUserId` e `createdAt`.
- **FR-032**: O sistema MUST definir os valores de `InventoryMovementType`: `IN`, `OUT`, `RESERVE`, `RELEASE`, `ADJUSTMENT`.
- **FR-033**: O sistema MUST gerar exatamente uma `InventoryMovement` para cada entrada, saida, reserva, liberacao ou ajuste bem-sucedido.
- **FR-034**: O sistema MUST tratar `InventoryMovement` como append-only e MUST NOT oferecer atualizacao ou remocao de movimentacao.
- **FR-035**: `createdByUserId` MUST representar o usuario que realizou a acao e ser obrigatorio em toda movimentacao.
- **FR-036**: O sistema MUST persistir a atualizacao do `InventoryItem` e a nova `InventoryMovement` de forma atomica na mesma transacao.
- **FR-037**: O sistema MUST preservar isolamento por organizacao em criacao, consulta, entrada, reserva, liberacao, saida, ajuste e historico.
- **FR-038**: O sistema MUST rejeitar operacoes sobre produto inexistente ou pertencente a outra organizacao com erro de produto nao encontrado.
- **FR-039**: O sistema MUST rejeitar operacoes sobre posicao de estoque inexistente com erro de posicao de estoque nao encontrada.
- **FR-040**: O sistema MUST rejeitar a criacao de uma segunda posicao de estoque para o mesmo produto com erro de conflito.
- **FR-041**: O sistema MUST representar quantidades por um Value Object `Quantity` inteiro e nao negativo, reutilizado por `InventoryItem` e `InventoryMovement`.
- **FR-042**: O sistema MUST retornar erros estruturados e distinguiveis para entrada invalida, recurso nao encontrado, conflito de unicidade, violacao de invariante de dominio e falha inesperada.
- **FR-043**: O dominio MUST conter as regras de `InventoryItem` e `InventoryMovement` sem depender de Prisma, Fastify, Zod, HTTP ou outro mecanismo de transporte, validacao ou persistencia.
- **FR-044**: A camada Application MUST orquestrar os casos de uso de estoque dependendo de interfaces de repositorio, nao diretamente de Prisma, e MUST fornecer `createdByUserId` ao construir cada movimentacao.
- **FR-045**: A camada Infrastructure MUST concentrar repositorios Prisma e mappers de persistencia de estoque.
- **FR-046**: A camada Presentation MUST concentrar handlers, rotas Fastify e schemas Zod de estoque.
- **FR-047**: O sistema MUST NOT implementar frontend, pedidos, reserva vinculada a pedido, receitas, checkout, pagamento, upload, imagens, lote/batch, validade, multiplos estoques por produto, transferencia entre estoques, RBAC ou middleware de autorizacao nesta spec.

### Key Entities *(include if feature involves data)*

- **InventoryItem**: Aggregate Root que representa a posicao de estoque de um produto em uma organizacao. Atributos principais: `id`, `organizationId`, `productId`, `availableQuantity`, `reservedQuantity` e `minimumQuantity`. Concentra as invariantes de nao negatividade, o limite de reserva sobre o disponivel e a geracao de movimentacoes.
- **InventoryMovement**: Entity de auditoria append-only que registra cada operacao de estoque. Atributos: `id`, `organizationId`, `inventoryItemId`, `productId`, `type`, `quantity`, `reason`, `createdByUserId` e `createdAt`. Pertence a posicao de estoque (`InventoryItem`).
- **InventoryMovementType**: Tipo da movimentacao: `IN`, `OUT`, `RESERVE`, `RELEASE`, `ADJUSTMENT`.
- **Quantity**: Value Object que representa uma quantidade inteira e nao negativa, reutilizado pelas quantidades da posicao de estoque e pela quantidade da movimentacao.
- **Product**: Item de catalogo dono do estoque. O estoque referencia `productId` e nunca altera dados de `Product`.
- **Organization**: Dono tenant da posicao de estoque e das movimentacoes. Todo controle e escopado por `organizationId`.
- **Tenant Ownership**: `organizationId` e a chave de escopo obrigatoria para toda posicao de estoque, movimentacao e operacao deste controle.

### API Endpoints and Payloads

#### `POST /organizations/:organizationId/products/:productId/inventory`

Cria a posicao de estoque do produto. `reservedQuantity` inicia em zero. Quando `availableQuantity` inicial e maior que zero, gera uma movimentacao de abertura `IN`.

**Request Body**:

```json
{
  "availableQuantity": 100,
  "minimumQuantity": 10,
  "reason": "Saldo inicial de implantacao.",
  "createdByUserId": "user-id"
}
```

**Response 201**:

```json
{
  "id": "inventory-item-id",
  "organizationId": "organization-id",
  "productId": "product-id",
  "availableQuantity": 100,
  "reservedQuantity": 0,
  "minimumQuantity": 10,
  "belowMinimum": false,
  "createdAt": "2026-06-23T12:00:00.000Z",
  "updatedAt": "2026-06-23T12:00:00.000Z"
}
```

#### `GET /organizations/:organizationId/products/:productId/inventory`

Consulta a posicao de estoque atual do produto.

**Response 200**:

```json
{
  "id": "inventory-item-id",
  "organizationId": "organization-id",
  "productId": "product-id",
  "availableQuantity": 100,
  "reservedQuantity": 0,
  "minimumQuantity": 10,
  "belowMinimum": false,
  "createdAt": "2026-06-23T12:00:00.000Z",
  "updatedAt": "2026-06-23T12:00:00.000Z"
}
```

#### `POST /organizations/:organizationId/products/:productId/inventory/add-stock`

Registra entrada de estoque (`IN`).

**Request Body**:

```json
{
  "quantity": 50,
  "reason": "Compra de reposicao.",
  "createdByUserId": "user-id"
}
```

**Response 200**: posicao de estoque atualizada (mesmo formato do `GET`).

#### `POST /organizations/:organizationId/products/:productId/inventory/reserve`

Reserva quantidade disponivel (`RESERVE`).

**Request Body**:

```json
{
  "quantity": 20,
  "reason": "Separacao para dispensacao.",
  "createdByUserId": "user-id"
}
```

**Response 200**: posicao de estoque atualizada.

#### `POST /organizations/:organizationId/products/:productId/inventory/release-reservation`

Libera reserva de volta para disponivel (`RELEASE`).

**Request Body**:

```json
{
  "quantity": 5,
  "reason": "Cancelamento de separacao.",
  "createdByUserId": "user-id"
}
```

**Response 200**: posicao de estoque atualizada.

#### `POST /organizations/:organizationId/products/:productId/inventory/confirm-stock-out`

Confirma saida fisica de quantidade reservada (`OUT`).

**Request Body**:

```json
{
  "quantity": 15,
  "reason": "Dispensacao confirmada.",
  "createdByUserId": "user-id"
}
```

**Response 200**: posicao de estoque atualizada.

#### `POST /organizations/:organizationId/products/:productId/inventory/adjust`

Ajusta `availableQuantity` para um novo valor absoluto (`ADJUSTMENT`).

**Request Body**:

```json
{
  "quantity": 95,
  "reason": "Correcao apos contagem fisica.",
  "createdByUserId": "user-id"
}
```

**Response 200**: posicao de estoque atualizada.

#### `GET /organizations/:organizationId/products/:productId/inventory/movements`

Lista o historico de movimentacoes da posicao, da mais recente para a mais antiga.

**Response 200**:

```json
{
  "data": [
    {
      "id": "movement-id",
      "organizationId": "organization-id",
      "inventoryItemId": "inventory-item-id",
      "productId": "product-id",
      "type": "IN",
      "quantity": 50,
      "reason": "Compra de reposicao.",
      "createdByUserId": "user-id",
      "createdAt": "2026-06-23T12:05:00.000Z"
    }
  ]
}
```

### Constitution Alignment *(mandatory)*

- **Affected Packages**: API e documentacao da feature. Web/UI ficam fora de escopo.
- **Tenant/White-Label Impact**: Toda posicao de estoque e movimentacao pertence a uma organizacao por `organizationId`. A feature nao altera branding, dominio customizado, logo, textos de portal ou outras configuracoes white-label.
- **Contract/Typing Impact**: Define contratos backend para criar/consultar posicao de estoque, registrar entrada/reserva/liberacao/saida/ajuste, consultar historico, enum de tipos de movimentacao e erros estruturados.
- **Clean-Code Boundaries**: Regras de estoque ficam no dominio sem Prisma/Fastify/Zod/HTTP; casos de uso dependem de interfaces e fornecem `createdByUserId`; repositorios Prisma e mappers ficam na infraestrutura; handlers, rotas Fastify e schemas Zod ficam na apresentacao.
- **Verification Scope**: Testar invariantes de quantidade, limite de reserva, geracao append-only de movimentacao, persistencia atomica item+movimentacao, isolamento por organizacao, unicidade de posicao por produto, e ausencia de catalogo mutavel, pedidos, receitas, lote/validade, upload/imagens e pagamento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuario de organizacao consegue criar a posicao de estoque de um produto e consultar o saldo em menos de 2 minutos usando os contratos backend definidos.
- **SC-002**: 100% das operacoes de entrada, reserva, liberacao, saida e ajuste preservam isolamento por organizacao e geram exatamente uma movimentacao append-only.
- **SC-003**: 100% das tentativas de reservar acima do disponivel, liberar/sair acima do reservado, ou usar quantidades invalidas sao rejeitadas sem alterar os saldos.
- **SC-004**: 100% das posicoes de estoque mantem `availableQuantity`, `reservedQuantity` e `minimumQuantity` nao negativos em todos os cenarios testados.
- **SC-005**: Nenhuma operacao de estoque altera dados de `Product`, e nenhuma resposta ou registro criado contem lote, validade, pedido, reserva por pedido, receita, checkout, pagamento, upload ou imagem.

## Assumptions

- O controle e destinado a usuarios internos da organizacao que ja possuem acesso ao contexto organizacional; permissoes avancadas e RBAC ficam fora desta spec.
- `createdByUserId` e fornecido no corpo de cada operacao de mutacao nesta fase, por ser back-end sem middleware de autorizacao; uma spec futura podera derivar o ator da sessao autenticada.
- `Quantity` e modelada como inteiro nao negativo nesta fase; quantidades fracionarias (por exemplo gramas com casas decimais) ficam para uma spec futura, alinhado a filosofia de precisao inteira ja usada em `MoneyInCents`.
- `confirmStockOut` baixa quantidade previamente reservada (ciclo reserva -> saida); saida direta sem reserva nao faz parte desta fase.
- `adjustStock` define `availableQuantity` para um novo valor absoluto resultante de contagem fisica e nao altera `reservedQuantity`.
- A criacao da posicao de estoque pode incluir `availableQuantity` inicial; quando maior que zero, gera uma movimentacao de abertura `IN`. `reservedQuantity` sempre inicia em zero.
- `minimumQuantity` e usado como limiar informativo (`belowMinimum`) e nao bloqueia operacoes nesta fase.
- Pedidos, reservas vinculadas a pedido, receitas, checkout, pagamento, lote/validade, multiplos estoques por produto e transferencias serao definidos em specs separadas.

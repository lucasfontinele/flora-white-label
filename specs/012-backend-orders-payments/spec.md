# Feature Specification: Pedidos e Pagamentos no Backend (Orders & Payments)

**Feature Branch**: `[012-backend-orders-payments]`

**Created**: 2026-06-24

**Status**: Draft

**Input**: User description: "Crie uma spec para pedidos e pagamentos no backend da aplicacao, seguindo DDD. Escopo: apenas back-end. Nao implementar frontend, UI, carrinho visual, checkout frontend, cookies, IronSession, autenticacao nova, RBAC novo ou integracao com Correios nesta spec. A aplicacao precisa permitir que pacientes/guardioes criem pedidos de produtos liberados para o paciente e iniciem pagamentos. Tambem precisamos integrar com AbacatePay (ver ABACATE_INTEGRATION.md). Implementar: dominio de pedidos, itens do pedido, pagamentos do pedido, CRUD/consulta de pagamentos, servico de integracao com AbacatePay e endpoints backend."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar um pedido de produtos para um paciente (Priority: P1)

Como paciente ou guardiao de um paciente, quero criar um pedido com um ou mais produtos do catalogo da organizacao para iniciar a aquisicao dos produtos liberados para aquele paciente.

**Why this priority**: Sem o pedido (`Order`) nenhum item pode ser congelado e nenhum pagamento pode ser iniciado; ele e a raiz de todo o fluxo de compra.

**Independent Test**: Criar um pedido informando `patientId`, `deliveryType` e ao menos um item com `productId` e `quantity`, confirmar que recebe identificador unico e um `token` legivel, que pertence a organizacao e ao paciente, que inicia com status `REQUESTED`, que cada item congela o `unitPrice` do produto em centavos e que `itemsAmount` reflete a soma das quantidades.

**Acceptance Scenarios**:

1. **Given** uma organizacao com um paciente e produtos ativos no catalogo, **When** o usuario cria um pedido com `patientId`, `deliveryType` valido e ao menos um item valido, **Then** o sistema registra o pedido com `organizationId`, `patientId`, `guardianId` opcional, `status = REQUESTED`, um `token` legivel unico, `itemsAmount` igual a soma das quantidades dos itens, e cada `OrderItem` com `unitPrice` congelado a partir do preco atual do produto.
2. **Given** um pedido sem nenhum item, **When** a requisicao e processada, **Then** o sistema rejeita a criacao por exigir ao menos um item e nenhum pedido e criado.
3. **Given** um item cujo `productId` nao existe, pertence a outra organizacao ou esta inativo, **When** a requisicao e processada, **Then** o sistema rejeita a criacao com erro de produto nao encontrado ou produto indisponivel e nenhum pedido e criado.
4. **Given** um item com `quantity` igual a zero, negativa ou nao inteira, **When** a requisicao e processada, **Then** o sistema rejeita a criacao e nenhum pedido e criado.
5. **Given** um `patientId` inexistente ou pertencente a outra organizacao, **When** a requisicao e processada, **Then** o sistema retorna erro de paciente nao encontrado e nenhum pedido e criado.
6. **Given** um `guardianId` informado que nao corresponde ao responsavel do paciente, **When** a requisicao e processada, **Then** o sistema rejeita o pedido por vinculo invalido de guardiao e nenhum pedido e criado.

---

### User Story 2 - Consultar pedidos da organizacao (Priority: P2)

Como usuario da organizacao ou paciente/guardiao, quero listar e consultar pedidos pelo identificador ou pelo `token` legivel para acompanhar o que foi solicitado.

**Why this priority**: Sem leitura, o paciente nao consegue acompanhar o pedido e a organizacao nao consegue conferir solicitacoes; o `token` legivel facilita o atendimento.

**Independent Test**: Criar alguns pedidos, listar os pedidos da organizacao confirmando o isolamento por `organizationId`, e consultar um pedido pelo `orderId` confirmando que retorna itens, `token`, `status`, `itemsAmount` e `deliveryType`.

**Acceptance Scenarios**:

1. **Given** pedidos existentes em uma organizacao, **When** o usuario lista os pedidos da organizacao, **Then** o sistema retorna apenas os pedidos daquela organizacao com `id`, `token`, `patientId`, `guardianId`, `status`, `itemsAmount`, `deliveryType`, `createdAt` e `updatedAt`.
2. **Given** um pedido existente, **When** o usuario consulta o pedido pelo `orderId`, **Then** o sistema retorna o pedido com seus itens (`productId`, `unitPrice` em centavos e `quantity`).
3. **Given** um `orderId` inexistente ou de outra organizacao, **When** o usuario consulta, **Then** o sistema retorna erro de pedido nao encontrado.

---

### User Story 3 - Cancelar um pedido (Priority: P2)

Como usuario da organizacao ou paciente/guardiao, quero cancelar um pedido que ainda nao foi concluido para interromper o fluxo de compra.

**Why this priority**: O cancelamento e a unica transicao de status exigida nesta fase e protege a regra de que um pedido cancelado nao pode mais ser alterado.

**Independent Test**: Criar um pedido, cancela-lo confirmando que o status passa a `CANCELLED`, e confirmar que cancelar novamente ou alterar um pedido ja cancelado e rejeitado.

**Acceptance Scenarios**:

1. **Given** um pedido com status diferente de `CANCELLED`, **When** o usuario cancela o pedido, **Then** o sistema define `status = CANCELLED` e persiste a mudanca.
2. **Given** um pedido ja cancelado, **When** o usuario tenta cancelar novamente ou alterar o pedido, **Then** o sistema rejeita a operacao por pedido cancelado nao poder ser alterado.
3. **Given** um `orderId` inexistente ou de outra organizacao, **When** o usuario tenta cancelar, **Then** o sistema retorna erro de pedido nao encontrado.

---

### User Story 4 - Iniciar um pagamento de um pedido via AbacatePay (Priority: P1)

Como paciente ou guardiao, quero iniciar o pagamento de um pedido escolhendo um metodo (PIX, cartao de credito) e um desconto opcional para receber os dados necessarios (QR Code PIX ou URL de checkout) e efetuar o pagamento.

**Why this priority**: O pagamento e o objetivo de negocio do fluxo; sem a integracao com o gateway o pedido nao se converte em receita.

**Independent Test**: Criar um pedido, criar um pagamento informando `paymentMethod` e `discount` opcional, confirmar que o pagamento inicia com status `PENDING`, que `totalPaid` em centavos reflete o valor do pedido com o desconto aplicado, que o gateway foi chamado pela porta `PaymentGatewayService`, e que a resposta traz a referencia externa (`externalPaymentId`) e os dados de cobranca (`pixQrCode`/`checkoutUrl`) sem expor segredos do gateway.

**Acceptance Scenarios**:

1. **Given** um pedido existente nao cancelado, **When** o usuario cria um pagamento com `paymentMethod = PIX`, **Then** o sistema cria o pagamento com `status = PENDING`, calcula `totalPaid` em centavos, chama `PaymentGatewayService.createPayment`, e persiste/retorna `externalPaymentId`, `pixQrCode` (copia-e-cola) e `pixQrCodeBase64` quando fornecidos pelo gateway.
2. **Given** um pedido existente nao cancelado, **When** o usuario cria um pagamento com `paymentMethod = CREDIT_CARD`, **Then** o sistema cria o pagamento `PENDING`, chama o gateway e persiste/retorna `externalPaymentId` e `checkoutUrl` para redirecionamento.
3. **Given** um `discount` informado, **When** o pagamento e criado, **Then** o sistema exige `discount` decimal entre `0.01` e `1` e calcula `totalPaid = round(valorBrutoDoPedido * (1 - discount))`; quando `discount` e omitido, `totalPaid` e o valor bruto do pedido.
4. **Given** um `discount` fora do intervalo `0.01..1` ou nao numerico, **When** a requisicao e processada, **Then** o sistema rejeita a criacao e nenhum pagamento e criado.
5. **Given** um pedido cancelado, **When** o usuario tenta criar um pagamento, **Then** o sistema rejeita a operacao por pedido cancelado.
6. **Given** uma falha do gateway AbacatePay, **When** a criacao do pagamento e processada, **Then** o sistema nao deixa um pagamento orfao inconsistente e retorna erro estruturado, sem expor token/secret do gateway.

---

### User Story 5 - Consultar pagamentos de um pedido (Priority: P2)

Como paciente, guardiao ou usuario da organizacao, quero listar e consultar os pagamentos de um pedido para acompanhar tentativas e status sem ver dados sensiveis do gateway.

**Why this priority**: A consulta de pagamentos da visibilidade do estado da cobranca e e a base do CRUD/consulta de pagamentos exigido.

**Independent Test**: Criar um pedido e um pagamento, listar os pagamentos do pedido, consultar um pagamento pelo `paymentId`, e confirmar que a resposta traz status, metodo, valores e dados de cobranca, mas nunca chaves/segredos do gateway.

**Acceptance Scenarios**:

1. **Given** um pedido com pagamentos, **When** o usuario lista os pagamentos do pedido, **Then** o sistema retorna apenas os pagamentos daquele pedido com `id`, `orderId`, `totalPaid`, `discount`, `paymentMethod`, `status`, dados de cobranca aplicaveis, `createdAt` e `updatedAt`.
2. **Given** um pagamento existente, **When** o usuario consulta pelo `paymentId`, **Then** o sistema retorna o pagamento com os mesmos campos, sem expor token/secret do gateway.
3. **Given** um `paymentId` inexistente, de outro pedido ou de outra organizacao, **When** o usuario consulta, **Then** o sistema retorna erro de pagamento nao encontrado.

---

### User Story 6 - Sincronizar o status de um pagamento com o gateway (Priority: P3)

Como usuario da organizacao ou paciente/guardiao, quero sincronizar o status de um pagamento consultando o AbacatePay para refletir se a cobranca foi paga, expirou ou foi cancelada.

**Why this priority**: Sem webhook nesta fase, a sincronizacao por consulta (`sync-status`) e o mecanismo para atualizar o status local a partir do gateway.

**Independent Test**: Criar um pagamento `PENDING`, simular no gateway uma mudanca de status, executar `sync-status` e confirmar que o status local e atualizado conforme o mapeamento do gateway, mantendo o isolamento por organizacao e pedido.

**Acceptance Scenarios**:

1. **Given** um pagamento com `externalPaymentId`, **When** o usuario executa `sync-status`, **Then** o sistema chama `PaymentGatewayService.getPaymentStatus(externalPaymentId)`, mapeia o status do gateway para `PaymentStatus` e atualiza o pagamento local.
2. **Given** um pagamento sem `externalPaymentId`, **When** o usuario executa `sync-status`, **Then** o sistema rejeita a operacao por ausencia de referencia externa.
3. **Given** um `paymentId` inexistente, de outro pedido ou de outra organizacao, **When** o usuario executa `sync-status`, **Then** o sistema retorna erro de pagamento nao encontrado.

### Edge Cases

- `organizationId`, `patientId` ou `productId` ausentes, vazios ou apenas com espacos devem ser rejeitados.
- Pedido sem itens deve ser rejeitado.
- `quantity` de item ausente, igual a zero, negativa, decimal ou nao inteira deve ser rejeitada.
- `unitPrice` do item deve ser congelado a partir do preco do produto no momento da criacao do pedido e nunca recalculado a partir do catalogo depois.
- Produto inexistente, de outra organizacao ou inativo deve impedir a criacao do pedido.
- Quando ja existir no projeto uma regra de acesso por categoria/produto liberada ao paciente, o item so podera referenciar produtos liberados ao paciente; enquanto essa regra nao existir, a verificacao fica documentada como ponto de extensao e nao bloqueia (condicional "se ja existir").
- `token` do pedido deve ser legivel, unico por organizacao e gerado pelo backend; colisao de `token` deve ser tratada sem expor erro interno.
- Pedido cancelado nao pode ter status alterado, itens alterados, nem novos pagamentos criados.
- `discount`, quando informado, deve ser decimal entre `0.01` e `1`; valores fora do intervalo, zero, negativos ou nao numericos devem ser rejeitados.
- `totalPaid` deve ser sempre inteiro em centavos e nunca negativo.
- `paymentMethod` ausente ou invalido deve ser rejeitado.
- Pagamento deve iniciar sempre como `PENDING`.
- Respostas de pagamento nunca devem conter token/secret/credenciais do gateway.
- Falha ou indisponibilidade do AbacatePay deve resultar em erro estruturado, sem criar pagamento local em estado inconsistente.
- `sync-status` sobre pagamento sem `externalPaymentId` deve ser rejeitado.
- Operacoes sobre pedido ou pagamento de outra organizacao nunca devem expor ou alterar dados fora do escopo da organizacao.
- Nenhuma operacao deve reservar ou dar baixa em estoque, calcular frete real, integrar Correios, emitir nota fiscal, enviar e-mail, fazer split de pagamento, reembolso real, ou modelar receita medica como entidade nesta spec.
- Erros inesperados devem ser estruturados e nao devem expor detalhes internos nem segredos.

## Requirements *(mandatory)*

### Functional Requirements

#### Pedidos (Orders)

- **FR-001**: O sistema MUST permitir criar um pedido por `POST /organizations/:organizationId/orders`.
- **FR-002**: O sistema MUST permitir listar os pedidos de uma organizacao por `GET /organizations/:organizationId/orders`.
- **FR-003**: O sistema MUST permitir consultar um pedido por `GET /organizations/:organizationId/orders/:orderId`.
- **FR-004**: O sistema MUST permitir cancelar um pedido por `PATCH /organizations/:organizationId/orders/:orderId/cancel`.
- **FR-005**: O sistema MUST modelar `Order` como Aggregate Root.
- **FR-006**: `Order` MUST possuir os campos `id`, `organizationId`, `token`, `patientId`, `guardianId?`, `status`, `itemsAmount`, `deliveryType`, `createdAt` e `updatedAt`.
- **FR-007**: O sistema MUST garantir que `Order` pertence a uma organizacao por `organizationId` obrigatorio.
- **FR-008**: O sistema MUST garantir que `Order` pertence a um paciente por `patientId` obrigatorio.
- **FR-009**: O sistema MUST tratar `guardianId` como opcional; quando informado, MUST corresponder ao responsavel do paciente.
- **FR-010**: O sistema MUST gerar um `token` legivel pelo backend, unico por organizacao, para facilitar a leitura/identificacao do pedido pelo paciente.
- **FR-011**: O sistema MUST calcular `itemsAmount` como a soma das quantidades de todos os itens do pedido.
- **FR-012**: O sistema MUST exigir que um pedido tenha ao menos um item.
- **FR-013**: O sistema MUST iniciar todo pedido com `status = REQUESTED`.
- **FR-014**: O sistema MUST definir os valores de `OrderStatus`: `REQUESTED`, `UNDER_REVIEW`, `IN_SEPARATION`, `APPROVED`, `READY_FOR_PICKUP`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
- **FR-015**: O sistema MUST definir os valores de `OrderDeliveryType`: `CORREIOS`, `PICKUP`.
- **FR-016**: O sistema MUST expor um metodo de dominio `cancel()` em `Order` que define `status = CANCELLED`.
- **FR-017**: O sistema MUST impedir qualquer alteracao (status, itens ou novos pagamentos) de um pedido com `status = CANCELLED`.
- **FR-018**: O sistema MAY expor metodos basicos de transicao de status no dominio, sem implementar o fluxo completo de mudanca de status nesta fase.

#### Itens do pedido (OrderItem)

- **FR-019**: O sistema MUST modelar `OrderItem` como Entity dentro do agregado `Order`.
- **FR-020**: `OrderItem` MUST possuir os campos `id`, `orderId`, `productId`, `unitPrice` e `quantity`.
- **FR-021**: `OrderItem.unitPrice` MUST ser sempre representado em centavos (inteiro nao negativo).
- **FR-022**: `OrderItem.quantity` MUST ser inteiro e positivo.
- **FR-023**: O sistema MUST congelar o `unitPrice` do item a partir do preco do produto no momento da criacao do pedido e MUST NOT recalcula-lo a partir do catalogo posteriormente.
- **FR-024**: O sistema MUST exigir que cada item referencie um produto existente na mesma organizacao do pedido.
- **FR-025**: O sistema MUST exigir que o produto referenciado esteja ativo.
- **FR-026**: O sistema MUST restringir os itens a produtos liberados para o paciente apenas se ja existir no projeto regra de acesso por categoria/produto; enquanto tal regra nao existir, essa verificacao MUST ficar documentada como ponto de extensao e MUST NOT bloquear nesta fase.

#### Pagamentos (OrderPayment)

- **FR-027**: O sistema MUST permitir criar um pagamento por `POST /organizations/:organizationId/orders/:orderId/payments`.
- **FR-028**: O sistema MUST permitir listar os pagamentos de um pedido por `GET /organizations/:organizationId/orders/:orderId/payments`.
- **FR-029**: O sistema MUST permitir consultar um pagamento por `GET /organizations/:organizationId/orders/:orderId/payments/:paymentId`.
- **FR-030**: O sistema MUST permitir sincronizar o status de um pagamento por `PATCH /organizations/:organizationId/orders/:orderId/payments/:paymentId/sync-status`.
- **FR-031**: O sistema MUST modelar `OrderPayment` no dominio como Aggregate Root simples (consistente com o padrao do projeto), referenciando o pedido por `orderId`.
- **FR-032**: `OrderPayment` MUST possuir os campos `id`, `orderId`, `totalPaid`, `discount`, `paymentMethod`, `status`, `createdAt` e `updatedAt`.
- **FR-033**: `OrderPayment.totalPaid` MUST ser sempre inteiro em centavos e nao negativo.
- **FR-034**: `OrderPayment.discount`, quando informado, MUST ser decimal entre `0.01` e `1`, representando porcentagem de desconto; quando omitido, nenhum desconto e aplicado.
- **FR-035**: O sistema MUST calcular `totalPaid` a partir do valor bruto do pedido (soma de `unitPrice * quantity` de todos os itens) aplicando o desconto: `totalPaid = round(valorBruto * (1 - discount))`.
- **FR-036**: `OrderPayment.paymentMethod` MUST ser obrigatorio.
- **FR-037**: O sistema MUST definir os valores de `PaymentMethod`: `CREDIT_CARD`, `BOLETO`, `PIX`.
- **FR-038**: O sistema MUST iniciar todo pagamento com `status = PENDING`.
- **FR-039**: O sistema MUST definir os valores de `PaymentStatus`: `PENDING`, `EXPIRED`, `CANCELLED`, `PAID`, `UNDER_DISPUTE`, `REFUNDED`, `REDEEMED`, `APPROVED`, `FAILED`.
- **FR-040**: O sistema MUST guardar a referencia externa do AbacatePay quando a integracao a fornecer, por exemplo `externalPaymentId`, `checkoutUrl`, `pixQrCode` e `pixQrCodeBase64`, alem de `expiresAt` quando aplicavel.
- **FR-041**: O sistema MUST NOT retornar nem persistir dados sensiveis do gateway (token, secret, credenciais) em nenhuma resposta.
- **FR-042**: O sistema MUST impedir a criacao de pagamento para um pedido cancelado.
- **FR-043**: O sistema MUST permitir mais de um pagamento por pedido (por exemplo, nova tentativa apos expiracao), mas MUST impedir nova criacao quando ja existir um pagamento `PAID`/`APPROVED` para o pedido.
- **FR-044**: O `sync-status` MUST atualizar o status local mapeando o status retornado por `PaymentGatewayService.getPaymentStatus` para `PaymentStatus`, e MUST rejeitar pagamentos sem `externalPaymentId`.
- **FR-045**: O `sync-status` MUST NOT alterar o status do `Order` nesta fase (nao ha fluxo completo de status do pedido derivado do pagamento).

#### Integracao AbacatePay (PaymentGatewayService)

- **FR-046**: A camada Application MUST definir a porta `PaymentGatewayService` com `createPayment(input)` e `getPaymentStatus(externalPaymentId)`.
- **FR-047**: A camada Infrastructure MUST prover `AbacatePayPaymentGatewayService` implementando a porta, isolando o AbacatePay da aplicacao e do dominio.
- **FR-048**: Os casos de uso MUST depender apenas da interface `PaymentGatewayService`, nunca do AbacatePay diretamente.
- **FR-049**: O dominio MUST NOT depender de AbacatePay, HTTP, Prisma, Fastify ou Zod.
- **FR-050**: A integracao MUST seguir o `ABACATE_INTEGRATION.md`: base URL `https://api.abacatepay.com/v2`, autenticacao `Authorization: Bearer <api-key>`, valores em centavos, envelope de resposta `{ data, success, error }`.
- **FR-051**: Para `PIX`, a integracao MUST usar o Checkout Transparente (`POST /transparents/create`), persistindo `brCode` como `pixQrCode`, `brCodeBase64` como `pixQrCodeBase64` e o id retornado como `externalPaymentId`; o status MUST ser consultado por `GET /transparents/check`.
- **FR-052**: Para `CREDIT_CARD`, a integracao MUST usar o Checkout hospedado (`POST /checkouts/create`) com metodo de cartao, persistindo a `url` como `checkoutUrl` e o id como `externalPaymentId`; o status MUST ser consultado por `GET /checkouts/one`.
- **FR-053**: `BOLETO` MUST permanecer definido em `PaymentMethod`, porem, conforme o `ABACATE_INTEGRATION.md` (que documenta apenas PIX/CARD), o gateway MUST retornar erro estruturado de metodo nao suportado para `BOLETO` nesta fase, sem criar pagamento inconsistente.
- **FR-054**: As variaveis de ambiente necessarias do AbacatePay (ex.: `ABACATEPAY_API_KEY`, `ABACATEPAY_BASE_URL`) MUST ser validadas com Zod no carregamento da configuracao, sem expor segredos em respostas/logs.
- **FR-055**: O `AbacatePayPaymentGatewayService` MUST mapear o status retornado pelo AbacatePay para `PaymentStatus` de forma deterministica e documentada.
- **FR-056**: O sistema MUST NOT implementar webhook do AbacatePay nesta spec; o `ABACATE_INTEGRATION.md` nao exige webhook como minimo, pois o status pode ser consultado pelos endpoints de leitura do gateway. A sincronizacao ocorre por `sync-status`.

#### Camadas, isolamento e erros

- **FR-057**: O sistema MUST preservar isolamento por organizacao em criacao, listagem, consulta e cancelamento de pedidos, e em criacao, listagem, consulta e sincronizacao de pagamentos.
- **FR-058**: O sistema MUST rejeitar operacoes sobre pedido inexistente ou de outra organizacao com erro de pedido nao encontrado.
- **FR-059**: O sistema MUST rejeitar operacoes sobre pagamento inexistente, de outro pedido ou de outra organizacao com erro de pagamento nao encontrado.
- **FR-060**: O sistema MUST retornar erros estruturados e distinguiveis para entrada invalida, recurso nao encontrado, conflito, violacao de invariante de dominio, metodo nao suportado pelo gateway e falha inesperada.
- **FR-061**: O dominio MUST conter as regras de `Order`, `OrderItem` e `OrderPayment` sem depender de Prisma, Fastify, Zod, AbacatePay, HTTP ou outro mecanismo de transporte/validacao/persistencia.
- **FR-062**: A camada Application MUST orquestrar os casos de uso dependendo de interfaces de repositorio e da porta `PaymentGatewayService`, sem depender diretamente de Prisma.
- **FR-063**: A camada Infrastructure MUST concentrar repositorios Prisma, mappers de persistencia e o `AbacatePayPaymentGatewayService`.
- **FR-064**: A camada Presentation MUST concentrar handlers, rotas Fastify e schemas Zod de pedidos e pagamentos.
- **FR-065**: O sistema MUST persistir, de forma atomica em uma mesma transacao, a criacao do pedido junto de seus itens, e a criacao/atualizacao de um pagamento junto de seus dados de gateway.
- **FR-066**: Valores monetarios (`unitPrice`, `totalPaid`) MUST usar o Value Object `MoneyInCents`, e quantidades inteiras de item MUST usar `Quantity` ja existentes no projeto.
- **FR-067**: O sistema MUST NOT implementar frontend, carrinho frontend, checkout frontend, cookies, IronSession, autenticacao nova, RBAC novo, integracao com Correios, calculo de frete real, reserva/baixa de estoque, split de pagamento, reembolso real, nota fiscal, envio de e-mail, receita medica como entidade (se ainda nao existir), nem selecao de paciente no frontend nesta spec.

### Key Entities *(include if feature involves data)*

- **Order**: Aggregate Root que representa o pedido de produtos de um paciente em uma organizacao. Atributos: `id`, `organizationId`, `token`, `patientId`, `guardianId?`, `status`, `itemsAmount`, `deliveryType`, `createdAt`, `updatedAt`. Concentra as invariantes de "ao menos um item", calculo de `itemsAmount`, geracao de `token` legivel, inicio em `REQUESTED` e bloqueio de alteracoes quando `CANCELLED`. Possui os `OrderItem` como entidades-filhas.
- **OrderItem**: Entity dentro do agregado `Order`. Atributos: `id`, `orderId`, `productId`, `unitPrice` (centavos, congelado na criacao), `quantity` (inteiro positivo). Referencia um produto ativo da mesma organizacao.
- **OrderPayment**: Aggregate Root simples que representa um pagamento de um pedido. Atributos: `id`, `orderId`, `totalPaid` (centavos), `discount` (decimal 0.01..1 ou ausente), `paymentMethod`, `status`, e referencias externas do gateway (`externalPaymentId`, `checkoutUrl`, `pixQrCode`, `pixQrCodeBase64`, `expiresAt`), `createdAt`, `updatedAt`. Inicia em `PENDING` e nunca expoe segredos do gateway.
- **OrderStatus**: `REQUESTED`, `UNDER_REVIEW`, `IN_SEPARATION`, `APPROVED`, `READY_FOR_PICKUP`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
- **OrderDeliveryType**: `CORREIOS`, `PICKUP`.
- **PaymentMethod**: `CREDIT_CARD`, `BOLETO`, `PIX`.
- **PaymentStatus**: `PENDING`, `EXPIRED`, `CANCELLED`, `PAID`, `UNDER_DISPUTE`, `REFUNDED`, `REDEEMED`, `APPROVED`, `FAILED`.
- **PaymentGatewayService**: Porta da camada Application para criar pagamento no gateway e consultar status; implementada na infraestrutura por `AbacatePayPaymentGatewayService`.
- **MoneyInCents / Quantity**: Value Objects ja existentes reutilizados por `unitPrice`/`totalPaid` e por `quantity`.
- **Product / Patient / Guardian / Organization**: Entidades existentes referenciadas. O pedido le o preco do produto para congelar `unitPrice` e valida existencia/ativacao do produto, existencia do paciente e vinculo do guardiao, sempre escopado por `organizationId`.
- **Tenant Ownership**: `organizationId` e a chave de escopo obrigatoria para todo pedido, item, pagamento e operacao.

### API Endpoints and Payloads

#### `POST /organizations/:organizationId/orders`

Cria um pedido com itens. Gera `token` legivel, inicia em `REQUESTED`, congela `unitPrice` de cada item e calcula `itemsAmount`.

**Request Body**:

```json
{
  "patientId": "patient-id",
  "guardianId": "guardian-id-opcional",
  "deliveryType": "CORREIOS",
  "items": [
    { "productId": "product-id", "quantity": 2 }
  ]
}
```

**Response 201**:

```json
{
  "id": "order-id",
  "organizationId": "organization-id",
  "token": "ORD-7F3K9A",
  "patientId": "patient-id",
  "guardianId": "guardian-id-opcional",
  "status": "REQUESTED",
  "deliveryType": "CORREIOS",
  "itemsAmount": 2,
  "items": [
    {
      "id": "order-item-id",
      "orderId": "order-id",
      "productId": "product-id",
      "unitPrice": 12000,
      "quantity": 2
    }
  ],
  "createdAt": "2026-06-24T12:00:00.000Z",
  "updatedAt": "2026-06-24T12:00:00.000Z"
}
```

#### `GET /organizations/:organizationId/orders`

Lista os pedidos da organizacao.

**Response 200**:

```json
{
  "data": [
    {
      "id": "order-id",
      "organizationId": "organization-id",
      "token": "ORD-7F3K9A",
      "patientId": "patient-id",
      "guardianId": null,
      "status": "REQUESTED",
      "deliveryType": "CORREIOS",
      "itemsAmount": 2,
      "createdAt": "2026-06-24T12:00:00.000Z",
      "updatedAt": "2026-06-24T12:00:00.000Z"
    }
  ]
}
```

#### `GET /organizations/:organizationId/orders/:orderId`

Consulta um pedido com seus itens (mesmo formato da resposta de criacao, incluindo `items`).

#### `PATCH /organizations/:organizationId/orders/:orderId/cancel`

Cancela o pedido (define `status = CANCELLED`).

**Response 200**: pedido atualizado (mesmo formato do `GET`).

#### `POST /organizations/:organizationId/orders/:orderId/payments`

Cria um pagamento do pedido e inicia a cobranca no AbacatePay.

**Request Body**:

```json
{
  "paymentMethod": "PIX",
  "discount": 0.1
}
```

**Response 201 (PIX)**:

```json
{
  "id": "payment-id",
  "orderId": "order-id",
  "totalPaid": 21600,
  "discount": 0.1,
  "paymentMethod": "PIX",
  "status": "PENDING",
  "externalPaymentId": "abacate-pix-id",
  "checkoutUrl": null,
  "pixQrCode": "00020126...br-code-copia-e-cola",
  "pixQrCodeBase64": "data:image/png;base64,iVBORw0KGgo...",
  "expiresAt": "2026-06-24T12:30:00.000Z",
  "createdAt": "2026-06-24T12:00:00.000Z",
  "updatedAt": "2026-06-24T12:00:00.000Z"
}
```

**Response 201 (CREDIT_CARD)**: mesmo formato, com `checkoutUrl` preenchida e `pixQrCode`/`pixQrCodeBase64` nulos.

#### `GET /organizations/:organizationId/orders/:orderId/payments`

Lista os pagamentos do pedido.

**Response 200**:

```json
{
  "data": [
    {
      "id": "payment-id",
      "orderId": "order-id",
      "totalPaid": 21600,
      "discount": 0.1,
      "paymentMethod": "PIX",
      "status": "PENDING",
      "externalPaymentId": "abacate-pix-id",
      "checkoutUrl": null,
      "pixQrCode": "00020126...br-code-copia-e-cola",
      "pixQrCodeBase64": "data:image/png;base64,iVBORw0KGgo...",
      "expiresAt": "2026-06-24T12:30:00.000Z",
      "createdAt": "2026-06-24T12:00:00.000Z",
      "updatedAt": "2026-06-24T12:00:00.000Z"
    }
  ]
}
```

#### `GET /organizations/:organizationId/orders/:orderId/payments/:paymentId`

Consulta um pagamento (mesmo formato de item da lista). Nunca retorna token/secret do gateway.

#### `PATCH /organizations/:organizationId/orders/:orderId/payments/:paymentId/sync-status`

Sincroniza o status do pagamento consultando o AbacatePay.

**Response 200**: pagamento atualizado com o `status` mapeado a partir do gateway.

### Constitution Alignment *(mandatory)*

- **Affected Packages**: API e documentacao da feature. `packages/web` (Web/UI) fica fora de escopo.
- **Tenant/White-Label Impact**: Todo pedido, item e pagamento pertence a uma organizacao por `organizationId`. A feature nao altera branding, dominio customizado, logo, textos de portal ou outras configuracoes white-label.
- **Contract/Typing Impact**: Define contratos backend para criar/listar/consultar/cancelar pedidos, criar/listar/consultar/sincronizar pagamentos, os enums de status/metodo/entrega, a porta `PaymentGatewayService` e erros estruturados, documentados em OpenAPI.
- **Clean-Code Boundaries**: Regras de pedido/item/pagamento ficam no dominio sem Prisma/Fastify/Zod/AbacatePay/HTTP; casos de uso dependem de interfaces e da porta de gateway; repositorios Prisma, mappers e o `AbacatePayPaymentGatewayService` ficam na infraestrutura; handlers, rotas Fastify e schemas Zod ficam na apresentacao.
- **Verification Scope**: Testar invariantes de pedido (ao menos um item, `itemsAmount`, token, inicio em `REQUESTED`, bloqueio quando `CANCELLED`), congelamento de preco do item, calculo de `totalPaid` com desconto, inicio de pagamento em `PENDING`, uso da porta de gateway, isolamento por organizacao, persistencia atomica, mapeamento de status do gateway, e ausencia de estoque/frete/Correios/split/reembolso/nota fiscal/e-mail/receita/RBAC/frontend.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um paciente/guardiao consegue criar um pedido com itens e iniciar um pagamento em menos de 2 minutos usando apenas os contratos backend definidos.
- **SC-002**: 100% dos pedidos criados preservam isolamento por organizacao, iniciam em `REQUESTED`, possuem `token` legivel unico, ao menos um item, `itemsAmount` igual a soma das quantidades e `unitPrice` congelado por item.
- **SC-003**: 100% das tentativas de criar pedido sem itens, com produto inexistente/inativo/de outra organizacao, com quantidade invalida, ou com paciente/guardiao invalido sao rejeitadas sem criar pedido.
- **SC-004**: 100% dos pagamentos iniciam em `PENDING`, calculam `totalPaid` em centavos com o desconto aplicado, usam a porta `PaymentGatewayService` e nunca retornam token/secret do gateway.
- **SC-005**: 100% das tentativas de pagar pedido cancelado, usar `discount` fora de `0.01..1`, ou sincronizar pagamento sem `externalPaymentId` sao rejeitadas com erro estruturado.
- **SC-006**: Nenhuma operacao reserva/baixa estoque, calcula frete, integra Correios, faz split/reembolso, emite nota fiscal, envia e-mail, cria receita como entidade ou altera `packages/web`.

## Assumptions

- O AbacatePay e o gateway de pagamento; a integracao segue o `ABACATE_INTEGRATION.md`. PIX usa Checkout Transparente (`/transparents/*`) e cartao usa Checkout hospedado (`/checkouts/*`). `BOLETO` permanece no enum mas e tratado como nao suportado pelo gateway nesta fase.
- Webhook do AbacatePay fica fora de escopo; o `ABACATE_INTEGRATION.md` nao o exige como minimo porque o status pode ser obtido por consulta (`/transparents/check`, `/checkouts/one`). A sincronizacao e feita por `sync-status` (polling sob demanda).
- O fluxo completo de mudanca de status do pedido nao e implementado nesta fase; apenas `cancel()` e exigido, com a invariante de que pedido `CANCELLED` nao pode ser alterado. Demais transicoes ficam para uma spec futura.
- Nao existe hoje no projeto regra de acesso por categoria/produto liberada ao paciente (o schema atual nao a modela); por isso a verificacao de "produto liberado para o paciente" e documentada como ponto de extensao condicional e nao bloqueia nesta fase. Quando a regra existir, o `CreateOrderUseCase` passa a valida-la.
- `guardianId`, quando informado, e validado contra o responsavel do paciente (`Patient.guardianId`), reutilizando o modelo de acesso existente, em vez de introduzir uma nova consulta de guardiao por id.
- `discount` representa porcentagem de desconto (0.01..1); `totalPaid = round(valorBruto * (1 - discount))`. `discount` e opcional na criacao do pagamento; quando ausente, nao ha desconto.
- Valores monetarios sao inteiros em centavos (`MoneyInCents`), coerentes com o catalogo de produtos e com o `ABACATE_INTEGRATION.md`. `discount` e persistido como decimal (ex.: `Decimal(3,2)`).
- O `token` do pedido e gerado pelo backend como string legivel e curta (ex.: prefixo + base alfanumerica maiuscula), com unicidade garantida por restricao de banco e regeneracao em caso de colisao.
- O ator das operacoes (paciente/guardiao/usuario da organizacao) ja possui acesso ao contexto; RBAC, autenticacao nova, cookies e IronSession ficam fora desta spec, coerente com o estado atual dos demais modulos backend.
- Mais de um pagamento por pedido e permitido (ex.: nova tentativa apos expiracao), mas nao se cria novo pagamento quando ja ha um `PAID`/`APPROVED` para o pedido.
- Reserva e baixa de estoque, calculo de frete real, integracao Correios, split, reembolso real, nota fiscal, envio de e-mail e receita medica como entidade ficam para specs futuras.
